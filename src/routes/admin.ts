import { Hono } from 'hono';
import type { Env } from '../types/env';

const admin = new Hono<{ Bindings: Env }>();

admin.get('/leads/summary', async (c) => {
  const total = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM consultations').first<{ n: number }>();
  const quoted = await c.env.DB.prepare('SELECT COALESCE(SUM(quoted_fee), 0) AS total FROM consultations').first<{ total: number }>();
  const byBranch = await c.env.DB.prepare(
    'SELECT legal_branch, COUNT(*) AS count, COALESCE(SUM(quoted_fee), 0) AS total FROM consultations GROUP BY legal_branch ORDER BY count DESC'
  ).all<{ legal_branch: string | null; count: number; total: number }>();
  const byFirm = await c.env.DB.prepare(
    'SELECT f.slug, f.name, COUNT(c.id) AS count FROM firms f LEFT JOIN consultations c ON c.firm_id = f.id GROUP BY f.id ORDER BY count DESC'
  ).all<{ slug: string; name: string; count: number }>();

  return c.json({
    total_consultations: total?.n ?? 0,
    total_quoted_fees: quoted?.total ?? 0,
    by_legal_branch: byBranch.results ?? [],
    by_firm: byFirm.results ?? [],
  });
});

export default admin;
