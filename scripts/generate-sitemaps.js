/* eslint-disable no-console */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PAGE_SIZE = 49000; // safety margin under 50,000

function getBaseUrl() {
  const envBase = process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  return envBase || 'http://localhost:3000';
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSitemapIndex(entries) {
  const items = entries
    .map((e) => {
      const lastmod = e.lastmod ? `\n    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : '';
      return `  <sitemap>\n    <loc>${xmlEscape(e.loc)}</loc>${lastmod}\n  </sitemap>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`;
}

function buildUrlSet(urls) {
  const items = urls
    .map((u) => {
      const lastmod = u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : '';
      return `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>${lastmod}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function writeXml(filePath, xml) {
  await ensureDir(path.dirname(filePath));
  await fsp.writeFile(filePath, xml, 'utf8');
}

async function generateRestaurantsSitemaps(base) {
  const total = await prisma.restaurant.count();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const entries = [];

  for (let page = 1; page <= pages; page++) {
    const take = PAGE_SIZE;
    const skip = (page - 1) * take;

    const rows = await prisma.restaurant.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { slug: true, city: true, updatedAt: true },
      take,
      skip,
    });

    const urls = rows.map((r) => ({
      loc: `${base}/restaurant/${encodeURIComponent(r.city)}/${encodeURIComponent(r.slug)}/menu`,
      lastmod: r.updatedAt,
    }));

    const xml = buildUrlSet(urls);
    const filename = `restaurants-${page}.xml`;
    await writeXml(path.join('public', 'sitemaps', filename), xml);
    entries.push({ loc: `${base}/sitemaps/${filename}`, lastmod: rows[0]?.updatedAt || new Date() });
    console.log(`Wrote restaurants page ${page}/${pages} (${urls.length} urls)`);
  }

  return entries;
}

async function generateDishesSitemaps(base) {
  // Group by dish name and get latest createdAt for lastmod
  const groups = await prisma.dish.groupBy({
    by: ['name'],
    _count: { name: true },
    _max: { createdAt: true },
  });

  // Sort by name asc for deterministic paging
  groups.sort((a, b) => a.name.localeCompare(b.name));

  const pages = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const entries = [];

  for (let page = 1; page <= pages; page++) {
    const slice = groups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const urls = slice.map((g) => ({
      loc: `${base}/search?q=${encodeURIComponent(g.name)}`,
      lastmod: g._max.createdAt || new Date(),
    }));

    const xml = buildUrlSet(urls);
    const filename = `dishes-${page}.xml`;
    await writeXml(path.join('public', 'sitemaps', filename), xml);
    entries.push({ loc: `${base}/sitemaps/${filename}`, lastmod: slice[0]?._max.createdAt || new Date() });
    console.log(`Wrote dishes page ${page}/${pages} (${urls.length} urls)`);
  }

  return entries;
}

async function generateCitiesSitemaps(base) {
  const groups = await prisma.restaurant.groupBy({
    by: ['city'],
    _count: { city: true },
    _max: { updatedAt: true },
  });

  groups.sort((a, b) => a.city.localeCompare(b.city));

  const pages = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const entries = [];

  for (let page = 1; page <= pages; page++) {
    const slice = groups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const urls = slice.map((g) => ({
      loc: `${base}/search?city=${encodeURIComponent(g.city)}`,
      lastmod: g._max.updatedAt || new Date(),
    }));

    const xml = buildUrlSet(urls);
    const filename = `cities-${page}.xml`;
    await writeXml(path.join('public', 'sitemaps', filename), xml);
    entries.push({ loc: `${base}/sitemaps/${filename}`, lastmod: slice[0]?._max.updatedAt || new Date() });
    console.log(`Wrote cities page ${page}/${pages} (${urls.length} urls)`);
  }

  return entries;
}

async function generateBestListsSitemaps(base) {
  // Use top dish names by frequency; generate lists for common price caps
  const groups = await prisma.dish.groupBy({
    by: ['name'],
    _count: { name: true },
    _max: { createdAt: true },
  });

  groups.sort((a, b) => b._count.name - a._count.name || a.name.localeCompare(b.name));

  const priceCaps = [5, 10, 15];
  const all = [];
  for (const g of groups) {
    for (const cap of priceCaps) {
      all.push({
        loc: `${base}/search?q=${encodeURIComponent(g.name)}&maxPrice=${cap}`,
        lastmod: g._max.createdAt || new Date(),
      });
    }
  }

  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const entries = [];
  for (let page = 1; page <= pages; page++) {
    const slice = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const xml = buildUrlSet(slice);
    const filename = `best-${page}.xml`;
    await writeXml(path.join('public', 'sitemaps', filename), xml);
    entries.push({ loc: `${base}/sitemaps/${filename}`, lastmod: slice[0]?.lastmod || new Date() });
    console.log(`Wrote best lists page ${page}/${pages} (${slice.length} urls)`);
  }

  return entries;
}

async function main() {
  const base = getBaseUrl();
  const outDir = path.join('public', 'sitemaps');
  await ensureDir(outDir);

  const indexEntries = [];

  const [restaurantsEntries, dishesEntries, citiesEntries, bestEntries] = await Promise.all([
    generateRestaurantsSitemaps(base),
    generateDishesSitemaps(base),
    generateCitiesSitemaps(base),
    generateBestListsSitemaps(base),
  ]);

  indexEntries.push(...restaurantsEntries, ...dishesEntries, ...citiesEntries, ...bestEntries);

  // Sort by loc for stability
  indexEntries.sort((a, b) => a.loc.localeCompare(b.loc));

  const indexXml = buildSitemapIndex(indexEntries);
  await writeXml(path.join('public', 'sitemap.xml'), indexXml);
  console.log(`Wrote sitemap index with ${indexEntries.length} shards`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


