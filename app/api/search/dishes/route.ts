import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeDishFields, isDishAllowed } from '@/lib/utils/dishFilters';

type SortBy = 'relevance' | 'price_asc' | 'price_desc' | 'name';

function normalize(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function tokenize(query: string | undefined): string[] {
  return normalize(query)
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { query, city, maxPrice, section, tags, sortBy, limit } = body as {
    query?: string;
    city?: string;
    maxPrice?: number;
    section?: string;
    tags?: string[];
    sortBy?: SortBy;
    limit?: number;
  };

  const terms = tokenize(query);
  const isProd = process.env.NODE_ENV === 'production';

  const baseWhere: any = {
    menu: {
      ...(isProd ? { status: 'APPROVED' as const } : {}),
      restaurant: city ? { city: { contains: city, mode: 'insensitive' as const } } : undefined,
    },
    ...(maxPrice != null ? { priceCents: { lte: maxPrice * 100 } } : {}),
    ...(section ? { section } : {}),
    ...(tags && tags.length > 0 ? { tags: { hasSome: tags } } : {}),
  };

  const fieldOR = (t: string) => ({
    OR: [
      { name: { contains: t, mode: 'insensitive' as const } },
      { description: { contains: t, mode: 'insensitive' as const } },
      { section: { contains: t, mode: 'insensitive' as const } },
      { tags: { has: t } },
      { menu: { restaurant: { name: { contains: t, mode: 'insensitive' as const } } } },
      { menu: { restaurant: { city: { contains: t, mode: 'insensitive' as const } } } },
    ],
  });

  // Strict AND across tokens
  const strictWhere = {
    ...baseWhere,
    ...(terms.length > 0 ? { AND: terms.map((t) => fieldOR(t)) } : {}),
  } as const;

  // Relaxed OR across tokens
  const relaxedWhere = {
    ...baseWhere,
    ...(terms.length > 0 ? { OR: terms.map((t) => fieldOR(t)) } : {}),
  } as const;

  // Initial candidate set (fetch generously, then rank)
  let candidates = await prisma.dish.findMany({
    where: strictWhere,
    include: { menu: { include: { restaurant: true } } },
    take: Math.min(Math.max(limit ?? 100, 100), 300),
  });

  if (candidates.length === 0 && terms.length > 0) {
    candidates = await prisma.dish.findMany({
      where: relaxedWhere,
      include: { menu: { include: { restaurant: true } } },
      take: 300,
    });
  }

  // Sanitize and filter noisy/irrelevant entries
  const sanitized = candidates
    .map((d) => {
      const s = sanitizeDishFields({
        name: d.name,
        description: d.description,
        section: d.section,
        tags: d.tags,
      });
      return { ...d, name: s.name, description: s.description };
    })
    .filter((d) =>
      isDishAllowed(
        { name: d.name, description: d.description, section: d.section, tags: d.tags },
        query
      )
    );

  // Deduplicate by name+restaurant+price
  const seen = new Set<string>();
  const deduped = sanitized.filter((d) => {
    const key = `${normalize(d.name)}|${d.menu.restaurant.id}|${d.priceCents ?? -1}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const normalizedQuery = normalize(query ?? '');
  const scoreDish = (d: typeof deduped[number]): number => {
    const nName = normalize(d.name);
    const nDesc = normalize(d.description);
    const nSection = normalize(d.section);
    const nTags = d.tags.map(normalize);
    const nRest = normalize(d.menu.restaurant.name);
    const nCity = normalize(d.menu.restaurant.city);

    let score = 0;

    if (normalizedQuery) {
      if (nName === normalizedQuery) score += 120;
      else if (nName.startsWith(normalizedQuery)) score += 80;
      else if (nName.includes(normalizedQuery)) score += 50;
    }

    for (const t of terms) {
      if (!t) continue;
      if (nName === t) score += 30;
      else if (nName.startsWith(t)) score += 18;
      else if (nName.includes(t)) score += 12;

      if (nSection.includes(t)) score += 8;
      if (nDesc.includes(t)) score += 6;
      if (nTags.some((tg) => tg === t)) score += 14;
      else if (nTags.some((tg) => tg.includes(t))) score += 10;
      if (nRest.includes(t)) score += 8;
      if (nCity.includes(t)) score += 6;
    }

    // Prefer priced dishes
    if (d.priceCents != null) score += 4;

    return score;
  };

  // Apply sort
  let sorted = deduped
    .map((d) => ({ d, score: scoreDish(d) }))
    .sort((a, b) => {
      if ((sortBy ?? 'relevance') === 'relevance') {
        if (b.score !== a.score) return b.score - a.score;
        const aPrice = a.d.priceCents ?? Number.POSITIVE_INFINITY;
        const bPrice = b.d.priceCents ?? Number.POSITIVE_INFINITY;
        if (aPrice !== bPrice) return aPrice - bPrice;
        return a.d.name.localeCompare(b.d.name);
      }
      if (sortBy === 'price_asc') {
        const aPrice = a.d.priceCents ?? Number.POSITIVE_INFINITY;
        const bPrice = b.d.priceCents ?? Number.POSITIVE_INFINITY;
        if (aPrice !== bPrice) return aPrice - bPrice;
        return b.score - a.score;
      }
      if (sortBy === 'price_desc') {
        const aPrice = a.d.priceCents ?? -1;
        const bPrice = b.d.priceCents ?? -1;
        if (aPrice !== bPrice) return bPrice - aPrice;
        return b.score - a.score;
      }
      // name
      const byName = a.d.name.localeCompare(b.d.name);
      if (byName !== 0) return byName;
      return b.score - a.score;
    })
    .map(({ d }) => d);

  const limited = sorted.slice(0, Math.min(limit ?? 100, 100));

  const result = limited.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    description: d.description,
    price_cents: d.priceCents ?? null,
    section: d.section,
    tags: d.tags,
    restaurant: {
      id: d.menu.restaurant.id,
      name: d.menu.restaurant.name,
      slug: d.menu.restaurant.slug,
      city: d.menu.restaurant.city,
      address: d.menu.restaurant.address,
    },
  }));

  return NextResponse.json(result);
}


