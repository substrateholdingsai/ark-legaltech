import type { Env, Firm, PracticeArea, TenantContext } from '../types/env';
import { resolveAureusTheme } from './theme';

export interface TenantIdentifier {
  slug: string | null;
  customDomain: string | null;
  resolvedBy: 'header' | 'query' | 'subdomain' | 'custom_domain' | 'default';
}

const RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'admin',
  'app',
  'legal',
  'staging',
  'dev',
  'localhost',
]);

export function detectTenantIdentifier(request: Request): TenantIdentifier {
  // 1. Header resolution
  const headerSlug = request.headers.get('x-tenant-slug') ?? request.headers.get('x-firm-slug');
  if (headerSlug && headerSlug.trim()) {
    return {
      slug: headerSlug.trim().toLowerCase(),
      customDomain: null,
      resolvedBy: 'header',
    };
  }

  const url = new URL(request.url);

  // 2. Query param resolution
  const queryParam = url.searchParams.get('firm') ?? url.searchParams.get('tenant');
  if (queryParam && queryParam.trim()) {
    return {
      slug: queryParam.trim().toLowerCase(),
      customDomain: null,
      resolvedBy: 'query',
    };
  }

  // 3. Host resolution
  const host = (request.headers.get('host') ?? url.hostname).split(':')[0].trim().toLowerCase();

  // If host is an IP or localhost without subdomain, return null
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) {
    return { slug: null, customDomain: null, resolvedBy: 'default' };
  }

  // Subdomain check strictly for platform domains (*.arksystems.site or *.workers.dev)
  const isPlatformDomain = host.endsWith('.arksystems.site') || host.endsWith('.workers.dev');
  if (isPlatformDomain) {
    const parts = host.split('.');
    if (parts.length >= 3) {
      const sub = parts[0];
      if (!RESERVED_SUBDOMAINS.has(sub)) {
        return {
          slug: sub,
          customDomain: null,
          resolvedBy: 'subdomain',
        };
      }
    }
    return { slug: null, customDomain: null, resolvedBy: 'default' };
  }

  // Custom domain check (e.g. lex.despachomorales.com.mx or bufetemartinez.mx)
  return {
    slug: null,
    customDomain: host,
    resolvedBy: 'custom_domain',
  };
}

// Backward compatible helper
export function resolveFirmSlug(request: Request): string | null {
  const detected = detectTenantIdentifier(request);
  return detected.slug;
}

export interface CachedTenantData {
  firm: Firm;
  practiceAreas: PracticeArea[];
}

export const DEFAULT_SEED_FIRMS: Record<string, CachedTenantData> = {
  contagram: {
    firm: {
      id: 'firm_contagram',
      slug: 'contagram',
      name: 'CONTAGRAM · Asesoría Contable & Fiscal',
      commercial_name: 'Contagram',
      legal_name: 'Contagram México SC',
      rfc: 'CTG200101XYZ',
      bar_association: 'Instituto Mexicano de Contadores Públicos',
      lead_partner: 'C.P. M. Morales',
      cedula_profesional: 'CP-9821453',
      specialty_focus: 'Contabilidad PyME, SAT & Balanza Mensual',
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
    },
    practiceAreas: [
      {
        id: 'srv_cont_01',
        firm_id: 'firm_contagram',
        name: 'Diagnóstico y Regularización Fiscal SAT',
        code: 'SAT-01',
        fee_type: 'consulta_inicial',
        base_fee: 1800.0,
        description: 'Revisión integral de buzón tributario y opiniones de cumplimiento 32-D.',
        retainer_percentage: 50.0,
        active: 1,
        display_order: 1,
      },
      {
        id: 'srv_cont_02',
        firm_id: 'firm_contagram',
        name: 'Contabilidad General y Balanza Mensual',
        code: 'SAT-02',
        fee_type: 'iguala_mensual',
        base_fee: 2800.0,
        description: 'Pólizas, cálculo de IVA/ISR, DIOT y timbrado de nómina hasta 10 colaboradores.',
        retainer_percentage: 50.0,
        active: 1,
        display_order: 2,
      },
      {
        id: 'srv_cont_03',
        firm_id: 'firm_contagram',
        name: 'Defensa y Aclaración de Requerimientos',
        code: 'SAT-03',
        fee_type: 'cuota_fija',
        base_fee: 4500.0,
        description: 'Atención jurídica a multas y embargos de cuentas ante el SAT e IMSS.',
        retainer_percentage: 50.0,
        active: 1,
        display_order: 3,
      },
    ],
  },
  valenzuela: {
    firm: {
      id: 'firm_valenzuela',
      slug: 'valenzuela',
      name: 'VALENZUELA & ASOCIADOS · Abogados Corporativos',
      commercial_name: 'Valenzuela & Asoc.',
      legal_name: 'Valenzuela Consultores Jurídicos SC',
      rfc: 'VLA190412AB1',
      bar_association: 'Barra Mexicana, Colegio de Abogados',
      lead_partner: 'Lic. Roberto Valenzuela',
      cedula_profesional: 'CED-4820194',
      specialty_focus: 'Litigio Mercantil, Contratos & Blindaje Patrimonial',
      whatsapp: '525541691234',
      email: 'contacto@valenzuela-abogados.mx',
      clabe: '014180098765432109',
      bank: 'Santander',
      clabe_holder: 'Valenzuela Consultores Jurídicos SC',
      domain: null,
      theme_primary: '#100F0D',
      theme_accent: '#C9A664',
      active: 1,
      created_at: '2026-10-27T00:00:00Z',
      updated_at: '2026-10-27T00:00:00Z',
    },
    practiceAreas: [
      {
        id: 'srv_val_01',
        firm_id: 'firm_valenzuela',
        name: 'Blindaje y Auditoría de Contratos Mercantiles',
        code: 'CORP-01',
        fee_type: 'cuota_fija',
        base_fee: 3500.0,
        description: 'Revisión preventiva de cláusulas leoninas, garantías y penas convencionales.',
        retainer_percentage: 50.0,
        active: 1,
        display_order: 1,
      },
      {
        id: 'srv_val_02',
        firm_id: 'firm_valenzuela',
        name: 'Defensa en Litigio y Cobranza Judicial',
        code: 'LIT-02',
        fee_type: 'consulta_inicial',
        base_fee: 2500.0,
        description: 'Estrategia procesal para recuperación de cartera y mediación mercantil.',
        retainer_percentage: 50.0,
        active: 1,
        display_order: 2,
      },
      {
        id: 'srv_val_03',
        firm_id: 'firm_valenzuela',
        name: 'Gobierno Corporativo y Asambleas de Accionistas',
        code: 'CORP-03',
        fee_type: 'cuota_fija',
        base_fee: 7500.0,
        description: 'Formalización notarial de libros corporativos, fusiones y poderes.',
        retainer_percentage: 50.0,
        active: 1,
        display_order: 3,
      },
    ],
  },
};

export async function resolveTenantData(
  env: Env,
  identifier: TenantIdentifier
): Promise<CachedTenantData | null> {
  const cacheKey = identifier.customDomain
    ? `tenant:domain:${identifier.customDomain}`
    : identifier.slug
    ? `tenant:slug:${identifier.slug}`
    : null;

  // 1. Check KV Cache
  if (cacheKey && env.CACHE) {
    try {
      const cached = await env.CACHE.get<CachedTenantData>(cacheKey, 'json');
      if (cached && cached.firm) {
        return cached;
      }
    } catch {
      // Ignore KV cache failure, fallback to D1
    }
  }

  // 2. Query D1
  let firm: Firm | null = null;
  try {
    if (identifier.customDomain && env.DB) {
      firm = await env.DB.prepare('SELECT * FROM firms WHERE domain = ? AND active = 1')
        .bind(identifier.customDomain)
        .first<Firm>();
    } else if (identifier.slug && env.DB) {
      firm = await env.DB.prepare('SELECT * FROM firms WHERE slug = ? AND active = 1')
        .bind(identifier.slug)
        .first<Firm>();
    }
  } catch {
    firm = null;
  }

  if (!firm) {
    if (identifier.slug && DEFAULT_SEED_FIRMS[identifier.slug]) {
      return DEFAULT_SEED_FIRMS[identifier.slug];
    }
    return null;
  }

  // Fetch active practice areas
  let practiceAreas: PracticeArea[] = [];
  try {
    const areasRes = await env.DB.prepare(
      'SELECT * FROM practice_areas WHERE firm_id = ? AND active = 1 ORDER BY display_order ASC'
    )
      .bind(firm.id)
      .all<PracticeArea>();
    practiceAreas = areasRes.results ?? [];
  } catch {
    if (identifier.slug && DEFAULT_SEED_FIRMS[identifier.slug]) {
      practiceAreas = DEFAULT_SEED_FIRMS[identifier.slug].practiceAreas;
    }
  }

  const data: CachedTenantData = {
    firm,
    practiceAreas,
  };

  // 3. Populate KV Cache with 5 min TTL
  if (cacheKey && env.CACHE) {
    try {
      await env.CACHE.put(cacheKey, JSON.stringify(data), { expirationTtl: 300 });
    } catch {
      // Ignore KV cache failure
    }
  }

  return data;
}

export async function resolveTenantContext(
  env: Env,
  request: Request,
  mode: 'nox' | 'marmora' = 'nox'
): Promise<TenantContext | null> {
  let identifier = detectTenantIdentifier(request);
  let data = await resolveTenantData(env, identifier);

  // If no tenant matched, fallback to default seed firm (contagram)
  if (!data) {
    identifier = { slug: 'contagram', customDomain: null, resolvedBy: 'default' };
    data = (await resolveTenantData(env, identifier)) ?? DEFAULT_SEED_FIRMS.contagram;
  }

  if (!data) {
    return null;
  }

  const branding = resolveAureusTheme(data.firm, mode);

  return {
    firm: data.firm,
    practiceAreas: data.practiceAreas,
    branding,
    resolvedBy: identifier.resolvedBy,
  };
}

export async function invalidateTenantCache(
  env: Env,
  slug: string,
  domain?: string | null
): Promise<void> {
  if (!env.CACHE) return;
  const promises: Promise<void>[] = [env.CACHE.delete(`tenant:slug:${slug}`)];
  if (domain) {
    promises.push(env.CACHE.delete(`tenant:domain:${domain}`));
  }
  await Promise.allSettled(promises);
}

// Backward compatible helper
export async function resolveFirm(env: Env, slug: string | null): Promise<Firm | null> {
  if (!slug) return null;
  const data = await resolveTenantData(env, {
    slug,
    customDomain: null,
    resolvedBy: 'query',
  });
  return data?.firm ?? null;
}
