import { Hono } from 'hono';
import type { Env, Firm, PracticeArea } from '../types/env';
import { resolveAureusTheme } from '../utils/theme';
import { invalidateTenantCache, DEFAULT_SEED_FIRMS } from '../utils/tenant';

const firms = new Hono<{ Bindings: Env }>();

// 1. Listar despachos activos
firms.get('/', async (c) => {
  let list: Firm[] = [];
  try {
    const rows = await c.env.DB.prepare(
      'SELECT id, slug, name, commercial_name, specialty_focus, whatsapp, email, theme_primary, theme_accent, domain, active FROM firms WHERE active = 1 ORDER BY name'
    ).all<Firm>();
    list = rows.results ?? [];
  } catch {
    list = [];
  }

  if (list.length === 0) {
    list = Object.values(DEFAULT_SEED_FIRMS).map((item) => item.firm);
  }

  return c.json({ firms: list });
});

// 2. Obtener detalle de despacho + áreas de práctica + branding AUREUS
firms.get('/:slug', async (c) => {
  const slug = c.req.param('slug').toLowerCase();
  let firm: Firm | null = null;
  let practiceAreas: PracticeArea[] = [];

  try {
    firm = await c.env.DB.prepare('SELECT * FROM firms WHERE slug = ? AND active = 1')
      .bind(slug)
      .first<Firm>();

    if (firm) {
      const areasRes = await c.env.DB.prepare(
        'SELECT * FROM practice_areas WHERE firm_id = ? AND active = 1 ORDER BY display_order ASC'
      )
        .bind(firm.id)
        .all<PracticeArea>();
      practiceAreas = areasRes.results ?? [];
    }
  } catch {
    firm = null;
  }

  if (!firm) {
    const fallback = DEFAULT_SEED_FIRMS[slug];
    if (fallback) {
      firm = fallback.firm;
      practiceAreas = fallback.practiceAreas;
    }
  }

  if (!firm) {
    return c.json({ error: 'Firm not found' }, 404);
  }

  const mode = c.req.query('mode') === 'marmora' ? 'marmora' : 'nox';
  const branding = resolveAureusTheme(firm, mode);

  return c.json({
    firm,
    practice_areas: practiceAreas,
    branding,
  });
});

// 3. Aprovisionar nuevo despacho (Tenant Provisioning)
firms.post('/', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const payload = (body ?? {}) as {
    slug?: string;
    name?: string;
    commercial_name?: string;
    legal_name?: string;
    rfc?: string;
    bar_association?: string;
    lead_partner?: string;
    cedula_profesional?: string;
    specialty_focus?: string;
    whatsapp?: string;
    email?: string;
    clabe?: string;
    bank?: string;
    clabe_holder?: string;
    domain?: string;
    theme_primary?: string;
    theme_accent?: string;
    practice_areas?: Array<{
      name: string;
      code?: string;
      fee_type: string;
      base_fee: number;
      description?: string;
    }>;
  };

  if (!payload.slug || !payload.name || !payload.whatsapp) {
    return c.json({ error: 'Missing required fields: slug, name, whatsapp' }, 400);
  }

  const slug = payload.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!slug) {
    return c.json({ error: 'Invalid slug format' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT id FROM firms WHERE slug = ?')
    .bind(slug)
    .first<{ id: string }>();

  if (existing) {
    return c.json({ error: 'A firm with this slug already exists' }, 409);
  }

  const firmId = `firm_${slug}_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO firms (
      id, slug, name, commercial_name, legal_name, rfc, bar_association,
      lead_partner, cedula_profesional, specialty_focus, whatsapp, email,
      clabe, bank, clabe_holder, domain, theme_primary, theme_accent, active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
  )
    .bind(
      firmId,
      slug,
      payload.name.trim(),
      payload.commercial_name ?? payload.name,
      payload.legal_name ?? null,
      payload.rfc ?? null,
      payload.bar_association ?? null,
      payload.lead_partner ?? null,
      payload.cedula_profesional ?? null,
      payload.specialty_focus ?? 'Servicios Legales y Fiscales',
      payload.whatsapp.trim(),
      payload.email ?? null,
      payload.clabe ?? c.env.DEFAULT_CLABE,
      payload.bank ?? c.env.DEFAULT_BANK,
      payload.clabe_holder ?? payload.name,
      payload.domain ? payload.domain.trim().toLowerCase() : null,
      payload.theme_primary ?? '#0A192F',
      payload.theme_accent ?? '#D4AF37',
      now,
      now
    )
    .run();

  // Insert practice areas if provided
  if (Array.isArray(payload.practice_areas) && payload.practice_areas.length > 0) {
    const stmts = payload.practice_areas.map((area, idx) => {
      const areaId = `srv_${slug}_${idx + 1}`;
      return c.env.DB.prepare(
        `INSERT INTO practice_areas (id, firm_id, name, code, fee_type, base_fee, description, display_order, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
      ).bind(
        areaId,
        firmId,
        area.name,
        area.code ?? `SRV-${idx + 1}`,
        area.fee_type,
        area.base_fee,
        area.description ?? null,
        idx + 1
      );
    });
    await c.env.DB.batch(stmts);
  }

  await invalidateTenantCache(c.env, slug, payload.domain);

  return c.json({
    status: 'created',
    firm_id: firmId,
    slug,
  }, 201);
});

// 4. Actualizar despacho e invalidar caché KV
firms.put('/:slug', async (c) => {
  const slug = c.req.param('slug').toLowerCase();
  const existing = await c.env.DB.prepare('SELECT * FROM firms WHERE slug = ? AND active = 1')
    .bind(slug)
    .first<Firm>();

  if (!existing) {
    return c.json({ error: 'Firm not found' }, 404);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const p = (body ?? {}) as Partial<Firm>;
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `UPDATE firms SET
      name = COALESCE(?, name),
      commercial_name = COALESCE(?, commercial_name),
      legal_name = COALESCE(?, legal_name),
      rfc = COALESCE(?, rfc),
      bar_association = COALESCE(?, bar_association),
      lead_partner = COALESCE(?, lead_partner),
      cedula_profesional = COALESCE(?, cedula_profesional),
      specialty_focus = COALESCE(?, specialty_focus),
      whatsapp = COALESCE(?, whatsapp),
      email = COALESCE(?, email),
      clabe = COALESCE(?, clabe),
      bank = COALESCE(?, bank),
      clabe_holder = COALESCE(?, clabe_holder),
      domain = COALESCE(?, domain),
      theme_primary = COALESCE(?, theme_primary),
      theme_accent = COALESCE(?, theme_accent),
      updated_at = ?
    WHERE id = ?`
  )
    .bind(
      p.name ?? null,
      p.commercial_name ?? null,
      p.legal_name ?? null,
      p.rfc ?? null,
      p.bar_association ?? null,
      p.lead_partner ?? null,
      p.cedula_profesional ?? null,
      p.specialty_focus ?? null,
      p.whatsapp ?? null,
      p.email ?? null,
      p.clabe ?? null,
      p.bank ?? null,
      p.clabe_holder ?? null,
      p.domain ? p.domain.toLowerCase() : null,
      p.theme_primary ?? null,
      p.theme_accent ?? null,
      now,
      existing.id
    )
    .run();

  await invalidateTenantCache(c.env, slug, existing.domain);
  if (p.domain && p.domain !== existing.domain) {
    await invalidateTenantCache(c.env, slug, p.domain);
  }

  return c.json({ status: 'updated', slug });
});

export default firms;
