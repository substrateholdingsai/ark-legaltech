import { describe, it, expect, vi } from 'vitest';
import app from '../src/index';
import type { Env, Firm, PracticeArea } from '../src/types/env';

describe('AUREUS API Routes & Tenant Provisioning', () => {
  const mockContagram: Firm = {
    id: 'firm_contagram',
    slug: 'contagram',
    name: 'CONTAGRAM · Asesoría Contable & Fiscal',
    commercial_name: 'Contagram',
    legal_name: 'Contagram México SC',
    rfc: 'CTG200101XYZ',
    bar_association: 'Instituto Mexicano de Contadores Públicos',
    lead_partner: 'C.P. M. Morales',
    cedula_profesional: 'CP-9821453',
    specialty_focus: 'Contabilidad PyME & SAT',
    whatsapp: '525657062511',
    email: 'contacto@contagram.mx',
    clabe: '127180001844721431',
    bank: 'Banco Azteca',
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

  it('POST /api/firms debe aprovisionar un nuevo despacho con áreas de práctica', async () => {
    let insertedFirm = false;
    let batchAreasCount = 0;

    const mockDB = {
      prepare: vi.fn((query: string) => ({
        bind: vi.fn((...params: unknown[]) => ({
          first: vi.fn(async () => null), // no existe previamente
          run: vi.fn(async () => {
            if (query.includes('INSERT INTO firms')) insertedFirm = true;
            return { success: true };
          }),
        })),
      })),
      batch: vi.fn(async (stmts: unknown[]) => {
        batchAreasCount = stmts.length;
        return [];
      }),
    } as unknown as D1Database;

    const mockKV = {
      delete: vi.fn(async () => {}),
    } as unknown as KVNamespace;

    const mockEnv = {
      DB: mockDB,
      CACHE: mockKV,
      DEFAULT_CLABE: '012180012345678901',
      DEFAULT_BANK: 'BBVA',
    } as unknown as Env;

    const req = new Request('https://legal.arksystems.site/api/firms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'lex-mexico',
        name: 'Lex México Corporativo SC',
        whatsapp: '525599887766',
        specialty_focus: 'Derecho Corporativo & M&A',
        practice_areas: [
          { name: 'Due Diligence Legal', fee_type: 'cuota_fija', base_fee: 15000 },
          { name: 'Asesoría Mensual', fee_type: 'iguala_mensual', base_fee: 8000 },
        ],
      }),
    });

    const res = await app.fetch(req, mockEnv);
    expect(res.status).toBe(201);
    const body = await res.json() as { status: string; slug: string };
    expect(body.status).toBe('created');
    expect(body.slug).toBe('lex-mexico');
    expect(insertedFirm).toBe(true);
    expect(batchAreasCount).toBe(2);
  });

  it('POST /api/assistant/triage debe analizar caso, registrar expediente y emitir folio con datos del socio', async () => {
    let consultationInserted = false;

    const mockDB = {
      prepare: vi.fn((query: string) => ({
        bind: vi.fn((...params: unknown[]) => ({
          first: vi.fn(async () => mockContagram),
          all: vi.fn(async () => ({ results: mockAreas })),
          run: vi.fn(async () => {
            if (query.includes('INSERT INTO consultations')) consultationInserted = true;
            return { success: true };
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

    const req = new Request('https://legal.arksystems.site/api/assistant/triage?firm=contagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'Ing. Carlos Mendoza',
        client_phone: '5512345678',
        client_email: 'carlos@empresa.mx',
        message: 'Tengo un requerimiento del SAT sobre mis declaraciones de 2024 que no he presentado.',
      }),
    });

    const res = await app.fetch(req, mockEnv);
    expect(res.status).toBe(200);
    const body = await res.json() as {
      legal_branch: string;
      quoted_fee: number;
      formal_folio: string;
      lead_partner: string;
      bank: string;
      whatsapp_url?: string;
      client_name?: string;
    };

    expect(body.legal_branch).toBe('Fiscal & SAT');
    expect(body.quoted_fee).toBe(1800);
    expect(body.formal_folio).toMatch(/^#EXP-2026-\d{4}$/);
    expect(body.lead_partner).toBe('C.P. M. Morales');
    expect(body.bank).toBe('Banco Azteca');
    expect(body.client_name).toBe('Ing. Carlos Mendoza');
    expect(body.whatsapp_url).toContain('https://wa.me/525657062511');
    expect(consultationInserted).toBe(true);
  });

  it('GET /api/firms/valenzuela debe resolver el despacho jurídico con sus áreas de práctica corporativa', async () => {
    const mockEnv = {
      DB: {
        prepare: vi.fn(() => ({
          bind: vi.fn(() => ({
            first: vi.fn(async () => null), // simula fallback en memoria
            all: vi.fn(async () => ({ results: [] })),
          })),
        })),
      },
      CACHE: null,
    } as unknown as Env;

    const req = new Request('https://legal.arksystems.site/api/firms/valenzuela');
    const res = await app.fetch(req, mockEnv);
    expect(res.status).toBe(200);
    const body = await res.json() as {
      firm: Firm;
      practice_areas: PracticeArea[];
    };

    expect(body.firm.slug).toBe('valenzuela');
    expect(body.firm.lead_partner).toBe('Lic. Roberto Valenzuela');
    expect(body.firm.whatsapp).toBe('525541691234');
    expect(body.practice_areas.length).toBeGreaterThan(0);
    expect(body.practice_areas[0].name).toContain('Contratos');
  });
});
