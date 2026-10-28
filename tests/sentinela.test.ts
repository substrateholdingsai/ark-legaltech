import { describe, it, expect, vi } from 'vitest';
import app from '../src/index';
import type { Env, Firm, PracticeArea, SentinelaEvent } from '../src/types/env';

describe('Sentinela RegTech Feed & Webhook Ingestion', () => {
  const mockFirm: Firm = {
    id: 'firm_contagram',
    slug: 'contagram',
    name: 'CONTAGRAM',
    commercial_name: 'Contagram',
    legal_name: 'Contagram SC',
    rfc: 'CTG200101XYZ',
    bar_association: 'IMCP',
    lead_partner: 'C.P. M. Morales',
    cedula_profesional: 'CP-9821453',
    specialty_focus: 'Contabilidad PyME & SAT',
    whatsapp: '525657062511',
    email: 'contacto@contagram.mx',
    clabe: '012180012345678901',
    bank: 'BBVA',
    clabe_holder: 'Contagram México SC',
    domain: null,
    theme_primary: '#0A192F',
    theme_accent: '#D4AF37',
    active: 1,
    created_at: '2026-10-27T00:00:00Z',
    updated_at: '2026-10-27T00:00:00Z',
  };

  const mockAreas: PracticeArea[] = [
    {
      id: 'srv_cont_01',
      firm_id: 'firm_contagram',
      name: 'Diagnóstico y Regularización Fiscal SAT',
      code: 'SAT-01',
      fee_type: 'consulta_inicial',
      base_fee: 1800,
      description: 'Revisión de 32-D',
      retainer_percentage: 50,
      active: 1,
      display_order: 1,
    },
  ];

  const mockEvents: SentinelaEvent[] = [
    {
      id: 'sen_sat_test',
      source: 'SAT',
      channel: 'fiscal',
      title: 'Cancelación de sellos por omisión en retenciones',
      summary: 'Impacto directo en facturación PyME.',
      severity: 'CRITICAL',
      effective_date: 'Inmediata',
      action_required: 'Presentar aclaración urgente.',
      matched_practice_area: 'srv_cont_01',
      created_at: '2026-10-27T02:00:00Z',
    },
  ];

  it('GET /api/sentinela/feed debe devolver las 5 fuentes oficiales enriquecidas con la defensa del despacho', async () => {
    const mockDB = {
      prepare: vi.fn((query: string) => ({
        bind: vi.fn((...params: unknown[]) => ({
          all: vi.fn(async () => {
            if (query.includes('FROM sentinela_events')) {
              return { results: mockEvents };
            }
            if (query.includes('FROM practice_areas')) {
              return { results: mockAreas };
            }
            return { results: [] };
          }),
          first: vi.fn(async () => {
            if (query.includes('FROM firms')) return mockFirm;
            return null;
          }),
        })),
      })),
    } as unknown as D1Database;

    const mockEnv = {
      DB: mockDB,
      CACHE: {
        get: vi.fn(async () => null),
        put: vi.fn(async () => {}),
      },
      SITE_NAME: 'Ark Legaltech',
    } as unknown as Env;

    const req = new Request('https://legal.arksystems.site/api/sentinela/feed?firm=contagram');
    const res = await app.fetch(req, mockEnv);

    expect(res.status).toBe(200);
    const body = await res.json() as {
      status: string;
      sources: string[];
      events: Array<SentinelaEvent & { defense_action?: { service_name: string; fee: number } }>;
    };

    expect(body.status).toBe('ok');
    expect(body.sources).toEqual(['DOF', 'SAT', 'CONDUSEF', 'CNBV', 'BANXICO']);
    expect(body.events.length).toBeGreaterThan(0);
    expect(body.events[0].defense_action?.service_name).toBe('Diagnóstico y Regularización Fiscal SAT');
    expect(body.events[0].defense_action?.fee).toBe(1800);
  });

  it('POST /api/sentinela/webhook debe ingestar eventos regulatorios y mapearlos al catálogo del despacho', async () => {
    let insertedEvent = false;

    const mockDB = {
      prepare: vi.fn((query: string) => ({
        bind: vi.fn((...params: unknown[]) => ({
          run: vi.fn(async () => {
            if (query.includes('INSERT INTO sentinela_events')) insertedEvent = true;
            return { success: true };
          }),
          first: vi.fn(async () => mockFirm),
          all: vi.fn(async () => ({ results: mockAreas })),
        })),
      })),
    } as unknown as D1Database;

    const mockEnv = {
      DB: mockDB,
      CACHE: {
        get: vi.fn(async () => null),
        put: vi.fn(async () => {}),
      },
    } as unknown as Env;

    const req = new Request('https://legal.arksystems.site/api/sentinela/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'SAT',
        title: 'Nueva resolución sobre discrepancia fiscal en CSD',
        summary: 'Afecta contribuyentes del régimen simplificado.',
        severity: 'CRITICAL',
      }),
    });

    const res = await app.fetch(req, mockEnv);
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; matched_practice_area: string };
    expect(body.status).toBe('received');
    expect(body.matched_practice_area).toBe('srv_cont_01');
    expect(insertedEvent).toBe(true);
  });

  it('GET /api/public/dof/latest debe devolver items del DOF con formato estructurado', async () => {
    const mockEnv = {
      CACHE: {
        get: vi.fn(async () => null),
        put: vi.fn(async () => {}),
      },
    } as unknown as Env;

    const req = new Request('https://legal.arksystems.site/api/public/dof/latest');
    const res = await app.fetch(req, mockEnv);
    expect(res.status).toBe(200);
    const body = await res.json() as { items: Array<{ title: string; url: string; summary: string }>; updatedAt: string };
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items[0]).toHaveProperty('title');
    expect(body.items[0]).toHaveProperty('url');
    expect(typeof body.updatedAt).toBe('string');
  });
});
