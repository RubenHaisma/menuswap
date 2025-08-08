import { headers } from 'next/headers';

export const SITEMAP_PAGE_SIZE = 49000; // safety margin under 50,000
export const SITEMAP_REVALIDATE_SECONDS = 60 * 60; // 1 hour

export async function getBaseUrl(): Promise<string> {
  const envBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (envBase) return envBase;
  // Fallback to request headers (may be undefined during build-time)
  try {
    const hdrs = await headers();
    const host = hdrs.get('x-forwarded-host') || hdrs.get('host');
    const proto = hdrs.get('x-forwarded-proto') || 'https';
    if (host) return `${proto}://${host}`;
  } catch (_) {
    // noop
  }
  return 'http://localhost:3000';
}

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildSitemapIndex(entries: Array<{ loc: string; lastmod?: Date }>): string {
  const items = entries
    .map((e) => {
      const lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod.toISOString()}</lastmod>` : '';
      return `  <sitemap>\n    <loc>${xmlEscape(e.loc)}</loc>${lastmod}\n  </sitemap>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`;
}

export function buildUrlSet(urls: Array<{ loc: string; lastmod?: Date }>): string {
  const items = urls
    .map((u) => {
      const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod.toISOString()}</lastmod>` : '';
      return `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>${lastmod}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;
}


