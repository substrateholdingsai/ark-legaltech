import { describe, it, expect, vi } from 'vitest';
import { detectTenantIdentifier, resolveTenantData, invalidateTenantCache } from '../src/utils/tenant';
import { resolveAureusTheme, AUREUS_NOX_TOKENS, AUREUS_MARMORA_TOKENS } from '../src/utils/theme';
import app from '../src/index';
import type { Env, Firm, PracticeArea } from '../src/types/env';

describe('AUREUS Multi-Tenant Architecture', () => {
  describe('1. Detección de Identificador de Tenant', () => {
    it('debe resolver tenant desde header X-Tenant-Slug prioritariamente', () => {
      const req = new Request('https://legal.arksystems.site/api/test?firm=queryslug', {
        headers: { 'x-tenant-slug': 'headerslug' },
      });
      const detected = detectTenantIdentifier(req);
      expect(detected.slug).toBe('headerslug');
      expect(detected.resolvedBy).toBe('header');
    });

    it('debe resolver tenant desde query param ?firm o ?tenant', () => {
      const req1 = new Request('https://legal.arksystems.site/api/test?firm=bufete_alvarez');
      expect(detectTenantIdentifier(req1)).toEqual({
        slug: 'bufete_alvarez',
        customDomain: null,
        resolvedBy: 'query',
      });

      const req2 = new Request('https://legal.arksystems.site/api/test?tenant=notaria_24');
      expect(detectTenantIdentifier(req2)).toEqual({
        slug: 'notaria_24',
        customDomain: null,
        resolvedBy: 'query',
      });
    });

    it('debe resolver subdominio tenant en *.arksystems.site', () => {
      const req = new Request('https://contagram.legal.arksystems.site/api/test');
      const detected = detectTenantIdentifier(req);
      expect(detected.slug).toBe('contagram');
      expect(detected.resolvedBy).toBe('subdomain');
    });

    it('debe ignorar subdominios reservados (www, api, legal)', () => {
      const req = new Request('https://legal.arksystems.site/api/test');
      const detected = detectTenantIdentifier(req);
      expect(detected.slug).toBeNull();
      expect(detected.resolvedBy).toBe('default');
    });

    it('debe detectar dominio personalizado completo (custom domain)', () => {
      const req = new Request('https://lex.despachomorales.com.mx/api/test', {
        headers: { host: 'lex.despachomorales.com.mx' },
      });
      const detected = detectTenantIdentifier(req);
      expect(detected.slug).toBeNull();
      expect(detected.customDomain).toBe('lex.despachomorales.com.mx');
      expect(detected.resolvedBy).toBe('custom_domain');
    });
  });

  describe('2. Motor de Branding AUREUS & Tokens Duales', () => {
    it('debe aplicar tokens AUREUS Nox Basalt por defecto', () => {
      const theme = resolveAureusTheme(null, 'nox');
      expect(theme.mode).toBe('nox');
      expect(theme.tokens.bgPrimary).toBe(AUREUS_NOX_TOKENS.bgPrimary);
      expect(theme.tokens.accent500).toBe('#C9A664');
      expect(theme.tokens.sealPorphyry).toBe('#8B4A5A');
      expect(theme.cssVariables).toContain('--aureus-bg-primary: #100F0D;');
      expect(theme.isCustomized).toBe(false);
    });

    it('debe aplicar tokens AUREUS Marmora Pergamino en modo claro', () => {
      const theme = resolveAureusTheme(null, 'marmora');
      expect(theme.mode).toBe('marmora');
      expect(theme.tokens.bgPrimary).toBe(AUREUS_MARMORA_TOKENS.bgPrimary);
      expect(theme.tokens.accent500).toBe('#6F4F22');
      expect(theme.tokens.textPrimary).toBe('#15120F');
      expect(theme.isCustomized).toBe(false);
    });

    it('debe permitir overrides de despacho (theme_primary y theme_accent) sin romper el esquema', () => {
      const mockFirm: Partial<Firm> = {
        theme_primary: '#0B1D3A',
        theme_accent: '#E5A93C',
      };
      const theme = resolveAureusTheme(mockFirm, 'nox');
      expect(theme.tokens.bgSurface).toBe('#0B1D3A');
      expect(theme.tokens.accent500).toBe('#E5A93C');
      expect(theme.isCustomized).toBe(true);
      expect(theme.cssVariables).toContain('--aureus-bg-surface: #0B1D3A;');
      expect(theme.cssVariables).toContain('--aureus-accent-500: #E5A93C;');
    });
  });

  describe('3. Caché de Tenants en Cloudflare KV & D1', () => {
    const mockFirm: Firm = {
      id: 'firm_test',
      slug: 'testfirm',
      name: 'Test Firm SC',
      commercial_name: 'Test Legal',
      legal_name: 'Test Legal SC',
      rfc: 'TST200101XYZ',
      bar_association: 'Barra Mexicana',
      lead_partner: 'Lic. Test',
      cedula_profesional: 'CED-123',
      specialty_focus: 'Corporativo',
      whatsapp: '525511223344',
      email: 'test@firm.mx',
      clabe: '012180012345678901',
      bank: 'BBVA',
      clabe_holder: 'Test Firm SC',
      domain: 'lex.testfirm.com',
      theme_primary: '#112233',
      theme_accent: '#DDAA55',
      active: 1,
      created_at: '2026-10-27T00:00:00Z',
      updated_at: '2026-10-27T00:00:00Z',
    };

    const mockAreas: PracticeArea[] = [
      {
        id: 'srv_1',
        firm_id: 'firm_test',
        name: 'Constitución de Empresa',
        code: 'SRV-01',
        fee_type: 'cuota_fija',
        base_fee: 5000,
        description: 'Acta constitutiva y registro',
        retainer_percentage: 50,
        active: 1,
        display_order: 1,
      },
    ];

    it('debe almacenar en KV cache en miss de lectura y retornar en hit posterior', async () => {
      const kvStore = new Map<string, string>();
      const mockKV = {
        get: vi.fn(async (key: string, type: string) => {
          const val = kvStore.get(key);
          if (!val) return null;
          return type === 'json' ? JSON.parse(val) : val;
        }),
        put: vi.fn(async (key: string, val: string) => {
          kvStore.set(key, val);
        }),
        delete: vi.fn(async (key: string) => {
          kvStore.delete(key);
        }),
      } as unknown as KVNamespace;

      const mockD1 = {
        prepare: vi.fn((query: string) => ({
          bind: vi.fn((...params: unknown[]) => ({
            first: vi.fn(async () => mockFirm),
            all: vi.fn(async () => ({ results: mockAreas })),
          })),
        })),
      } as unknown as D1Database;

      const mockEnv = {
        DB: mockD1,
        CACHE: mockKV,
      } as unknown as Env;

      // Primer llamado: Miss en KV, consulta a D1 y puebla KV
      const result1 = await resolveTenantData(mockEnv, {
        slug: 'testfirm',
        customDomain: null,
        resolvedBy: 'query',
      });

      expect(result1?.firm.slug).toBe('testfirm');
      expect(mockD1.prepare).toHaveBeenCalled();
      expect(mockKV.put).toHaveBeenCalledWith(
        'tenant:slug:testfirm',
        expect.any(String),
        { expirationTtl: 300 }
      );

      // Segundo llamado: Hit en KV
      const result2 = await resolveTenantData(mockEnv, {
        slug: 'testfirm',
        customDomain: null,
        resolvedBy: 'query',
      });
      expect(result2?.firm.slug).toBe('testfirm');
      expect(result2?.practiceAreas.length).toBe(1);

      // Invalidación de caché
      await invalidateTenantCache(mockEnv, 'testfirm', 'lex.testfirm.com');
      expect(mockKV.delete).toHaveBeenCalledWith('tenant:slug:testfirm');
      expect(mockKV.delete).toHaveBeenCalledWith('tenant:domain:lex.testfirm.com');
    });
  });

  describe('4. Endpoints y Middleware Hono', () => {
    it('GET /api/tenant/current debe responder con el tenant y branding AUREUS activo', async () => {
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

      const mockEnv = {
        DB: {
          prepare: vi.fn(() => ({
            bind: vi.fn(() => ({
              first: vi.fn(async () => mockFirm),
              all: vi.fn(async () => ({ results: [] })),
            })),
          })),
        },
        CACHE: {
          get: vi.fn(async () => null),
          put: vi.fn(async () => {}),
        },
        SITE_NAME: 'Ark Legaltech',
      } as unknown as Env;

      const req = new Request('https://legal.arksystems.site/api/tenant/current?firm=contagram');
      const res = await app.fetch(req, mockEnv);

      expect(res.status).toBe(200);
      const json = await res.json() as { firm: Firm; branding: { mode: string; tokens: { bgPrimary: string; accent500: string } } };
      expect(json.firm.slug).toBe('contagram');
      expect(json.branding.mode).toBe('nox');
      expect(json.branding.tokens.bgPrimary).toBe('#040F1D');
    });

    it('debe resolver tenant vigil con tokens signal-lucerna y púrpura porfídica', async () => {
      const mockEnv = {
        DB: {
          prepare: vi.fn(() => ({
            bind: vi.fn(() => ({
              first: vi.fn(async () => null),
              all: vi.fn(async () => ({ results: [] })),
            })),
          })),
        },
        CACHE: {
          get: vi.fn(async () => null),
          put: vi.fn(async () => {}),
        },
        SITE_NAME: 'Ark Legaltech',
      } as unknown as Env;

      const req = new Request('https://legal.arksystems.site/api/tenant/current?firm=vigil');
      const res = await app.fetch(req, mockEnv);

      expect(res.status).toBe(200);
      const json = await res.json() as { firm: Firm; branding: { mode: string; tokens: { bgPrimary: string; accent500: string; sealPorphyry: string; accentForeground: string } } };
      expect(json.firm.slug).toBe('vigil');
      expect(json.branding.tokens.bgPrimary).toBe('#0F0D0A');
      expect(json.branding.tokens.accent500).toBe('#E89F4C'); // signal-lucerna
      expect(json.branding.tokens.sealPorphyry).toBe('#8B4A5A'); // púrpura porfídica
      expect(json.branding.tokens.accentForeground).toBe('#14110D'); // WCAG AAA
    });

    it('debe resolver tenant valenzuela por defecto sin contaminar la landing principal', async () => {
      const mockEnv = {
        DB: {
          prepare: vi.fn(() => ({
            bind: vi.fn(() => ({
              first: vi.fn(async () => null),
              all: vi.fn(async () => ({ results: [] })),
            })),
          })),
        },
        CACHE: {
          get: vi.fn(async () => null),
          put: vi.fn(async () => {}),
        },
        SITE_NAME: 'Ark Legaltech',
      } as unknown as Env;

      const req = new Request('https://legal.arksystems.site/api/tenant/current');
      const res = await app.fetch(req, mockEnv);

      expect(res.status).toBe(200);
      const json = await res.json() as { firm: Firm; branding: { mode: string; tokens: { bgPrimary: string; accent500: string } } };
      expect(json.firm.slug).toBe('valenzuela');
      expect(json.branding.tokens.bgPrimary).toBe('#100F0D'); // Basalto canónico
      expect(json.branding.tokens.accent500).toBe('#C9A664'); // Bronce / Oro
    });
  });
});
