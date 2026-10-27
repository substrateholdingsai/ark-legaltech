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

// 5. Root Entrypoint: sirve la Landing Page interactiva AUREUS desde public/
app.get('/', async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Ark Legaltech · AUREUS Legal Tech Romano');
});

export default app;
