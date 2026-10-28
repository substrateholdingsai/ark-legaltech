export interface DofFeedItem {
  title: string;
  url: string;
  summary: string;
  publishedAt: string | null;
}

export const DOF_RSS_URL = 'https://dof.gob.mx/rss/notas_nuevas.xml';

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(parseInt(code, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function readTag(xml: string, tag: string): string {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return xml.match(new RegExp(`<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}\\s*>`, 'i'))?.[1]?.trim() ?? '';
}

export function parseDofFeed(xml: string): DofFeedItem[] {
  const items: DofFeedItem[] = [];
  const matches = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item\s*>/gi) ?? [];

  for (const item of matches) {
    const title = decodeXml(readTag(item, 'title')).trim();
    const rawUrl = decodeXml(readTag(item, 'link')).trim();
    if (!title || !rawUrl) continue;

    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      continue;
    }
    if (url.protocol !== 'https:' || !['dof.gob.mx', 'www.dof.gob.mx'].includes(url.hostname)) continue;

    const rawDate = decodeXml(readTag(item, 'pubDate') || readTag(item, 'dc:date')).trim();
    const timestamp = rawDate ? Date.parse(rawDate) : NaN;
    const rawSummary = decodeXml(readTag(item, 'description'))
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    items.push({
      title,
      url: url.toString(),
      summary: rawSummary.slice(0, 500),
      publishedAt: Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString(),
    });
  }

  return items;
}

export const FALLBACK_DOF_ITEMS: DofFeedItem[] = [
  {
    title: 'Acuerdo por el que se dan a conocer las disposiciones de carácter general en materia de certificación tributaria y buzón',
    url: 'https://dof.gob.mx',
    summary: 'Secretaría de Hacienda y Crédito Público · Disposiciones aplicables a personas físicas y morales con actividades empresariales.',
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'Resolución de modificaciones a las Reglas Generales de Comercio Exterior y validaciones aduaneras de mercancías',
    url: 'https://dof.gob.mx',
    summary: 'Servicio de Administración Tributaria · Actualización de causales de suspensión en el padrón de importadores.',
    publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    title: 'Circular informativa referente a los lineamientos de ciberseguridad y trazabilidad en transferencias SPEI corporativas',
    url: 'https://dof.gob.mx',
    summary: 'Banco de México · Nuevas exigencias de autenticación para plataformas financieras y participantes directos.',
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    title: 'Acuerdo que fija el calendario oficial de suspensión de labores en juzgados de distrito y tribunales colegiados',
    url: 'https://dof.gob.mx',
    summary: 'Consejo de la Judicatura Federal · Turnos de guardia permanente para demandas de amparo y suspensiones de plano.',
    publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];
