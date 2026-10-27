import { Hono } from 'hono';
import type { Env, PracticeArea, SentinelaEvent, TenantContext } from '../types/env';

const sentinela = new Hono<{ Bindings: Env; Variables: { tenant: TenantContext | null } }>();

// Semilla en memoria como fallback garantizado de alta fidelidad
const FALLBACK_EVENTS: SentinelaEvent[] = [
  {
    id: 'sen_sat_01',
    source: 'SAT',
    source_url: 'https://sat.gob.mx/normatividad',
    source_id: 'RMF-2026-CSD',
    channel: 'fiscal',
    title: 'Restricción Masiva de Certificados de Sello Digital (CSD) por discrepancias en Buzón Tributario',
    summary: 'El SAT intensificó la cancelación temporal de sellos a contribuyentes con diferencias en retenciones de nómina vs CFDI emitidos.',
    severity: 'CRITICAL',
    effective_date: 'Inmediata',
    action_required: 'Auditoría urgente de CFDI y aclaración en buzón para evitar parálisis de facturación.',
    matched_practice_area: 'srv_cont_01',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sen_dof_02',
    source: 'DOF',
    source_url: 'https://dof.gob.mx',
    source_id: 'DOF-2026-32D',
    channel: 'fiscal',
    title: 'Publicación del Anexo 1-A de la RMF: Nuevas validaciones en opiniones de cumplimiento 32-D',
    summary: 'Nuevos requisitos estrictos en declaraciones complementarias para licitaciones y contratos públicos con dependencias federales.',
    severity: 'HIGH',
    effective_date: 'Próximo mes',
    action_required: 'Regularización inmediata de ejercicios 2024 y 2025 para mantener constancia 32-D positiva.',
    matched_practice_area: 'srv_cont_01',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sen_banxico_03',
    source: 'BANXICO',
    source_url: 'https://banxico.org.mx/disposiciones',
    source_id: 'CIR-14-2026',
    channel: 'fintech_banca',
    title: 'Circular 14/2026: Trazabilidad reforzada en transferencias SPEI empresariales de alto valor',
    summary: 'Obligación para personas morales de registrar RFC verificado del beneficiario final en pagos superiores a $100,000 MXN.',
    severity: 'MEDIUM',
    effective_date: '2026-11-01',
    action_required: 'Actualización de layout bancario empresarial y conciliación contable de transferencias.',
    matched_practice_area: 'srv_cont_02',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sen_cnbv_04',
    source: 'CNBV',
    source_url: 'https://gob.mx/cnbv',
    source_id: 'CNBV-PLD-2026',
    channel: 'fintech_banca',
    title: 'Revisión trimestral de cumplimiento PLD/FT y manuales de prevención de operaciones ilícitas',
    summary: 'Requerimiento de auditoría externa a despachos y sujetos obligados con actividades vulnerables.',
    severity: 'HIGH',
    effective_date: '2026-11-15',
    action_required: 'Elaboración y actualización del expediente de identificación de clientes y dictamen anual.',
    matched_practice_area: 'srv_cont_03',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sen_condusef_05',
    source: 'CONDUSEF',
    source_url: 'https://condusef.gob.mx/redeco',
    source_id: 'REDECO-2026-04',
    channel: 'cobranza',
    title: 'Actualización al Registro de Despachos de Cobranza (REDECO) y sanciones por gestión no registrada',
    summary: 'Multas de hasta 2,000 UMAS por realizar gestiones de cobro sin registro previo del apoderado o intermediario.',
    severity: 'MEDIUM',
    effective_date: '2026-10-30',
    action_required: 'Validación de contratos mercantiles y registro formal de cobranza supervisada.',
    matched_practice_area: 'srv_cont_03',
    created_at: new Date().toISOString(),
  },
];

// 1. Feed para el Radar en Vivo de la Landing Page
sentinela.get('/feed', async (c) => {
  const source = c.req.query('source')?.toUpperCase();
  const channel = c.req.query('channel')?.toLowerCase();
  const limit = Math.min(Number(c.req.query('limit') || 10), 30);

  let events: SentinelaEvent[] = [];

  try {
    let query = 'SELECT * FROM sentinela_events WHERE 1=1';
    const params: unknown[] = [];

    if (source) {
      query += ' AND source = ?';
      params.push(source);
    }
    if (channel) {
      query += ' AND channel = ?';
      params.push(channel);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const res = await c.env.DB.prepare(query).bind(...params).all<SentinelaEvent>();
    events = res.results ?? [];
  } catch {
    events = [];
  }

  // Fallback si la tabla está vacía
  if (events.length === 0) {
    events = FALLBACK_EVENTS.filter((e) => {
      if (source && e.source !== source) return false;
      if (channel && e.channel !== channel) return false;
      return true;
    }).slice(0, limit);
  }

  // Mapear con el catálogo del despacho activo
  const tenant = c.get('tenant');
  const practiceAreas = tenant?.practiceAreas ?? [];
  const firm = tenant?.firm;
  const whatsappNum = firm?.whatsapp ?? '525657062511';
  const partnerName = firm?.lead_partner ?? firm?.commercial_name ?? 'Titular';
  const areasMap = new Map<string, PracticeArea>(practiceAreas.map((a) => [a.id, a]));

  const enrichedEvents = events.map((ev) => {
    const matched = ev.matched_practice_area ? areasMap.get(ev.matched_practice_area) : null;
    const waText = `Hola ${partnerName}, vi en su portal la alerta SENTINELA sobre: "${ev.title}". Requiero asesoría preventiva para blindar mi negocio.`;
    const waUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(waText)}`;

    return {
      ...ev,
      defense_action: matched
        ? {
            area_id: matched.id,
            service_name: matched.name,
            fee: matched.base_fee,
            fee_type: matched.fee_type,
            cta_text: `Prevenir con ${matched.name} (MXN $${matched.base_fee.toLocaleString('es-MX')})`,
            whatsapp_url: waUrl,
            whatsapp_text: waText,
          }
        : {
            area_id: 'default',
            service_name: 'Diagnóstico Legal / Contable Preventivo',
            fee: 1800,
            fee_type: 'consulta_inicial',
            cta_text: 'Acuñar Diagnóstico Preventivo',
            whatsapp_url: waUrl,
            whatsapp_text: waText,
          },
    };
  });

  return c.json({
    status: 'ok',
    sources: ['DOF', 'SAT', 'CONDUSEF', 'CNBV', 'BANXICO'],
    total: enrichedEvents.length,
    events: enrichedEvents,
  });
});

// 2. Webhook Receptor de Sentinela (Directo del Hermano RegTech)
sentinela.post('/webhook', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  const payload = (body ?? {}) as Partial<SentinelaEvent> & { event?: Partial<SentinelaEvent> };
  const eventData = payload.event ?? payload;

  if (!eventData.title || !eventData.source) {
    return c.json({ error: 'Missing required fields: title, source' }, 400);
  }

  const id = `sen_${eventData.source.toLowerCase()}_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  // Mapeo heurístico a áreas de práctica de Contagram / despachos
  let matchedArea = eventData.matched_practice_area ?? null;
  if (!matchedArea) {
    const text = `${eventData.title} ${eventData.summary || ''}`.toLowerCase();
    if (text.includes('sat') || text.includes('csd') || text.includes('32-d') || text.includes('multa')) {
      matchedArea = 'srv_cont_01'; // Diagnóstico SAT
    } else if (text.includes('nómina') || text.includes('balanza') || text.includes('declaraci')) {
      matchedArea = 'srv_cont_02'; // Contabilidad General
    } else {
      matchedArea = 'srv_cont_03'; // Defensa legal
    }
  }

  try {
    await c.env.DB.prepare(
      `INSERT INTO sentinela_events (
        id, source, source_url, source_id, channel, title, summary,
        severity, effective_date, action_required, matched_practice_area, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        eventData.source,
        eventData.source_url ?? null,
        eventData.source_id ?? null,
        eventData.channel ?? 'fiscal',
        eventData.title,
        eventData.summary ?? eventData.title,
        eventData.severity ?? 'HIGH',
        eventData.effective_date ?? 'Inmediata',
        eventData.action_required ?? 'Revisión y defensa preventiva con el despacho',
        matchedArea,
        now
      )
      .run();
  } catch (err) {
    console.error('Error inserting sentinela event:', err);
  }

  return c.json({
    status: 'received',
    event_id: id,
    source: eventData.source,
    matched_practice_area: matchedArea,
  });
});

export default sentinela;
