import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env, TenantContext } from './types/env';
import { resolveTenantContext } from './utils/tenant';
import health from './routes/health';
import firms from './routes/firms';
import assistant from './routes/assistant';
import webhook from './routes/webhook_wa';
import admin from './routes/admin';
import sentinela from './routes/sentinela';
import { DOF_RSS_URL, parseDofFeed, FALLBACK_DOF_ITEMS, type DofFeedItem } from './utils/dof';

export type AppVariables = {
  tenant: TenantContext | null;
  firmSlug: string | null;
};

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// 1. CORS Perimetral Zero-Trust
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*';
    if (
      origin.endsWith('.arksystems.site') ||
      origin === 'https://arksystems.site' ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return origin;
    }
    // Allow custom tenant domains (reflect origin)
    return origin;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug', 'X-Firm-Slug'],
  credentials: true,
}));

// 2. Middleware de Contexto Multi-Tenant en Edge con KV Cache
app.use('*', async (c, next) => {
  const mode = c.req.query('mode') === 'marmora' ? 'marmora' : 'nox';
  const tenant = await resolveTenantContext(c.env, c.req.raw, mode);
  c.set('tenant', tenant);
  c.set('firmSlug', tenant?.firm.slug ?? null);
  await next();
});

// 3. Rutas Modulares
app.route('/health', health);
app.route('/api/firms', firms);
app.route('/api/assistant', assistant);
app.route('/api/webhook/whatsapp', webhook);
app.route('/api/admin', admin);
app.route('/api/sentinela', sentinela);

// 4. Endpoint directo de Contexto del Inquilino Activo
app.get('/api/tenant/current', (c) => {
  const tenant = c.get('tenant');
  if (!tenant) {
    return c.json({ error: 'No active tenant resolved' }, 404);
  }
  return c.json({
    firm: tenant.firm,
    practice_areas: tenant.practiceAreas,
    branding: tenant.branding,
    resolved_by: tenant.resolvedBy,
  });
});

// 5. Endpoint público de feed del Diario Oficial de la Federación (DOF)
app.get('/api/public/dof/latest', async (c) => {
  const cacheKey = 'public:dof:latest:v1';
  if (c.env.CACHE) {
    try {
      const cached = await c.env.CACHE.get(cacheKey);
      if (cached) {
        const payload = JSON.parse(cached);
        if (Array.isArray(payload.items)) {
          return c.json(payload, 200, { 'Cache-Control': 'public, max-age=300' });
        }
      }
    } catch {
      // ignore cache failure
    }
  }

  let items: DofFeedItem[] = [];
  try {
    const res = await fetch(DOF_RSS_URL, { headers: { 'User-Agent': 'Ark-Legaltech/1.0 (Sentinela)' } });
    if (res.ok) {
      const xml = await res.text();
      items = parseDofFeed(xml).slice(0, 5);
    }
  } catch {
    items = [];
  }

  if (items.length === 0) {
    items = FALLBACK_DOF_ITEMS;
  }

  const payload = { items, updatedAt: new Date().toISOString() };
  if (c.env.CACHE) {
    try {
      await c.env.CACHE.put(cacheKey, JSON.stringify(payload), { expirationTtl: 300 });
    } catch {}
  }

  return c.json(payload, 200, { 'Cache-Control': 'public, max-age=300' });
});

// 6. Root Entrypoint: sirve la Landing Page interactiva AUREUS desde public/
app.get('/', async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Ark Legaltech · AUREUS Legal Tech Romano');
});

// 6. Ruta directa para Contagram (Isfahan Ledger Edition)
app.get('/contagram', async (c) => {
  if (c.env.ASSETS) {
    const url = new URL(c.req.url);
    url.pathname = '/contagram.html';
    return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
  }
  return c.text('Contagram · Despacho de Contabilidad · Isfahan Ledger');
});

// 7. Ruta directa para AUREUS VIGIL (Guardia Nocturna Penal y Amparo)
app.get('/vigil', async (c) => {
  if (c.env.ASSETS) {
    const url = new URL(c.req.url);
    url.pathname = '/vigil.html';
    return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
  }
  return c.text('AUREUS VIGIL · Guardia Legal Permanente · Penal & Amparo');
});

export default app;
