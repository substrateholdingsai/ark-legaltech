import { Hono } from 'hono';
import type { Env, TenantContext } from '../types/env';

const webhook = new Hono<{ Bindings: Env; Variables: { tenant: TenantContext | null } }>();

// Handshake de verificación de Meta WhatsApp Cloud API
webhook.get('/', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');
  if (mode === 'subscribe' && token === c.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return c.text(challenge);
  }
  return c.text('Forbidden', 403);
});

// Ingesta de mensajes de clientes
webhook.post('/', async (c) => {
  let payload: unknown;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const tenant = c.get('tenant');
  const firm = tenant?.firm ?? null;
  const slug = firm?.slug ?? 'contagram';

  const entries = (payload as { entry?: unknown[] })?.entry ?? [];
  for (const entry of entries) {
    const changes = (entry as { changes?: unknown[] })?.changes ?? [];
    for (const change of changes) {
      const value = (change as { value?: unknown })?.value as {
        messages?: { from: string; type: string; text?: { body: string } }[];
        contacts?: { profile?: { name?: string } }[];
      } | undefined;

      const messages = value?.messages ?? [];
      const contactName = value?.contacts?.[0]?.profile?.name ?? null;

      for (const m of messages) {
        const text = m.text?.body ?? '';
        const msgId = crypto.randomUUID();

        await c.env.DB.prepare(
          `INSERT INTO whatsapp_messages (
            id, firm_id, phone, sender_name, direction, message_text, matched_firm, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(msgId, firm?.id ?? null, m.from, contactName, 'inbound', text, slug, 'processed')
          .run();

        if (text && firm) {
          const cid = crypto.randomUUID();
          const folio = `#EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          await c.env.DB.prepare(
            `INSERT INTO consultations (
              id, firm_id, channel, client_name, client_phone, case_summary, formal_folio, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          )
            .bind(
              cid,
              firm.id,
              'whatsapp_inbound',
              contactName ?? 'Cliente WhatsApp',
              m.from,
              text,
              folio,
              'diagnostico_pendiente'
            )
            .run();
        }
      }
    }
  }

  return c.json({ status: 'received' });
});

export default webhook;
