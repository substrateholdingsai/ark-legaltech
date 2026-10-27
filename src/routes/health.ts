import { Hono } from 'hono';
import type { Env } from '../types/env';

const health = new Hono<{ Bindings: Env }>();

health.get('/', async (c) => {
  let dbOk = false;
  try {
    const r = await c.env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>();
    dbOk = r?.ok === 1;
  } catch {
    dbOk = false;
  }
  return c.json({
    status: 'ok',
    service: c.env.SITE_NAME,
    db: dbOk,
    timestamp: new Date().toISOString(),
  });
});

export default health;
