import { Hono } from 'hono';
import type { Env, PracticeArea, TenantContext, TriageResult } from '../types/env';
import { resolveTenantData } from '../utils/tenant';

const assistant = new Hono<{ Bindings: Env; Variables: { tenant: TenantContext | null } }>();

const PRIVACY_NOTICE =
  'Aviso de privacidad y secreto profesional: la información compartida se trata de forma confidencial conforme a la legislación aplicable. Este diagnóstico preliminar no constituye asesoría legal definitiva ni crea relación abogado-cliente.';

assistant.post('/triage', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const obj = (body ?? {}) as {
    message?: unknown;
    firm?: unknown;
    client_name?: unknown;
    client_phone?: unknown;
    client_email?: unknown;
    service_id?: unknown;
  };
  if (typeof obj.message !== 'string' || obj.message.trim().length === 0) {
    return c.json({ error: 'Invalid payload' }, 400);
  }

  const message = obj.message.trim();
  const clientName = typeof obj.client_name === 'string' && obj.client_name.trim() ? obj.client_name.trim() : 'Cliente';
  const clientPhone = typeof obj.client_phone === 'string' && obj.client_phone.trim() ? obj.client_phone.trim() : '';
  const clientEmail = typeof obj.client_email === 'string' && obj.client_email.trim() ? obj.client_email.trim() : null;
  const explicitServiceId = typeof obj.service_id === 'string' && obj.service_id.trim() ? obj.service_id.trim() : null;
  const explicitFirm = typeof obj.firm === 'string' ? obj.firm.trim().toLowerCase() : null;

  // 1. Resolve tenant context: either from explicit body parameter or from active request context
  let firmRow = c.get('tenant')?.firm ?? null;
  let areas: PracticeArea[] = c.get('tenant')?.practiceAreas ?? [];

  if (explicitFirm && (!firmRow || firmRow.slug !== explicitFirm)) {
    const data = await resolveTenantData(c.env, {
      slug: explicitFirm,
      customDomain: null,
      resolvedBy: 'query',
    });
    if (data) {
      firmRow = data.firm;
      areas = data.practiceAreas;
    }
  }

  if (!firmRow) {
    return c.json({ error: 'Firm not found' }, 404);
  }

  // 2. Build catalog prompt
  const catalog = areas.length > 0
    ? areas.map((a) => `- ${a.id}: ${a.name} (${a.fee_type}, MXN ${a.base_fee})`).join('\n')
    : 'Servicio de Asesoría Legal / Contable General (cuota_fija, MXN 2000)';

  const firmName = firmRow.commercial_name ?? firmRow.name;
  const prompt = `Eres el asistente agéntico de triaje de "${firmName}" (especialidad: ${firmRow.specialty_focus ?? 'Jurídico y Contable'}).
Analiza el caso del cliente y responde SOLO en JSON válido con las claves:
- legal_branch (string, ej: Fiscal SAT, Mercantil, Notarial, Laboral, etc.)
- summary (string breve y profesional del caso)
- matched_service (id del servicio coincidente del catálogo o null)

Catálogo de servicios disponibles:
${catalog}

Caso del cliente:
"${message}"`;

  let aiText = '';
  if (c.env.AI) {
    try {
      const out = (await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          { role: 'system', content: 'Responde únicamente JSON válido con las claves solicitadas.' },
          { role: 'user', content: prompt },
        ],
      })) as { response?: string } | string;
      aiText = typeof out === 'string' ? out : (out?.response ?? '');
    } catch {
      aiText = '';
    }
  }

  let legalBranch = 'General';
  let summary = message;
  let matchedService: string | null = null;

  try {
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : aiText) as {
      legal_branch?: string;
      summary?: string;
      matched_service?: string | null;
    };
    if (parsed.legal_branch) legalBranch = parsed.legal_branch;
    if (parsed.summary) summary = parsed.summary;
    if (parsed.matched_service) matchedService = parsed.matched_service;
  } catch {
    // Keep defaults on fallback
    if (message.toLowerCase().includes('sat') || message.toLowerCase().includes('impuesto') || message.toLowerCase().includes('factura')) {
      legalBranch = 'Fiscal & SAT';
    } else if (message.toLowerCase().includes('contrato') || message.toLowerCase().includes('sociedad')) {
      legalBranch = 'Corporativo & Mercantil';
    }
  }

  const targetServiceId = explicitServiceId ?? matchedService;
  const matchedArea = areas.find((a) => a.id === targetServiceId) ?? (areas.length > 0 ? areas[0] : null);
  const quotedFee = matchedArea ? matchedArea.base_fee : 1800.0;
  const finalServiceId = matchedArea ? matchedArea.id : null;
  const finalServiceName = matchedArea ? matchedArea.name : null;

  const folio = `#EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const id = crypto.randomUUID();

  try {
    if (c.env.DB) {
      await c.env.DB.prepare(
        `INSERT INTO consultations (
          id, firm_id, channel, client_name, client_phone, client_email, case_summary,
          legal_branch, quoted_fee, formal_folio, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          id,
          firmRow.id,
          'web_concierge',
          clientName,
          clientPhone,
          clientEmail,
          summary,
          legalBranch,
          quotedFee,
          folio,
          'diagnostico_pendiente'
        )
        .run();
    }
  } catch (err) {
    // If table column doesn't match or DB error, continue gracefully
    console.warn('Consultation insert error:', err);
  }

  const partnerName = firmRow.lead_partner ?? firmRow.commercial_name ?? 'Titular';
  const waMsg = `Hola ${partnerName}, acabo de generar el folio de consulta ${folio} en su portal oficial.\n\nCliente: ${clientName}${clientPhone ? ` (${clientPhone})` : ''}\nServicio de Interés: ${finalServiceName ?? legalBranch}\nSituación: "${summary.slice(0, 100)}..."\n\nQuisiera agendar asesoría directa.`;
  const whatsappUrl = `https://wa.me/${firmRow.whatsapp}?text=${encodeURIComponent(waMsg)}`;

  const result: TriageResult = {
    legal_branch: legalBranch,
    summary,
    matched_service: finalServiceId,
    service_name: finalServiceName,
    quoted_fee: quotedFee,
    formal_folio: folio,
    privacy_notice: PRIVACY_NOTICE,
    lead_partner: firmRow.lead_partner,
    cedula_profesional: firmRow.cedula_profesional,
    bank: firmRow.bank,
    clabe: firmRow.clabe,
    whatsapp_url: whatsappUrl,
    whatsapp_number: firmRow.whatsapp,
    client_name: clientName,
  };

  return c.json(result);
});

export default assistant;
