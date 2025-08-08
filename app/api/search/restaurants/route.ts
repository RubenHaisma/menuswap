import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  const { query, city, limit } = body as { query?: string; city?: string; limit?: number };

  const isProd = process.env.NODE_ENV === 'production';
  const terms = tokenize(query);

  // Base DB filter
  const baseWhere: any = {
    ...(isProd ? { verified: true } : {}),
    ...(city ? { city: { contains: city, mode: 'insensitive' as const } } : {}),
  };

  const fieldOR = (t: string) => ({
    OR: [
      { name: { contains: t, mode: 'insensitive' as const } },
      { city: { contains: t, mode: 'insensitive' as const } },
      { address: { contains: t, mode: 'insensitive' as const } },
    ],
  });

  const strictWhere = { ...baseWhere, ...(terms.length > 0 ? { AND: terms.map((t) => fieldOR(t)) } : {}) };
  const relaxedWhere = { ...baseWhere, ...(terms.length > 0 ? { OR: terms.map((t) => fieldOR(t)) } : {}) };

  let candidates = await prisma.restaurant.findMany({ where: strictWhere, take: 300 });
  if (candidates.length === 0 && terms.length > 0) {
    candidates = await prisma.restaurant.findMany({ where: relaxedWhere, take: 300 });
  }

  const normalizedQuery = normalize(query ?? '');
  const scoreRestaurant = (r: typeof candidates[number]): number => {
    const nName = normalize(r.name);
    const nCity = normalize(r.city);
    const nAddr = normalize(r.address);

    let score = 0;

    if (normalizedQuery) {
      if (nName === normalizedQuery) score += 100;
      else if (nName.startsWith(normalizedQuery)) score += 60;
      else if (nName.includes(normalizedQuery)) score += 35;
    }

    for (const t of terms) {
      if (nName === t) score += 20;
      else if (nName.startsWith(t)) score += 12;
      else if (nName.includes(t)) score += 8;
      if (nCity.includes(t)) score += 6;
      if (nAddr.includes(t)) score += 4;
    }

    // Prefer verified
    if (r.verified) score += 3;
    return score;
  };

  const sorted = candidates
    .map((r) => ({ r, score: scoreRestaurant(r) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.r.name.localeCompare(b.r.name);
    })
    .map(({ r }) => r)
    .slice(0, Math.min(limit ?? 50, 100));

  const result = sorted.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    city: r.city,
    address: r.address,
    website_url: r.websiteUrl ?? null,
    verified: r.verified,
  }));

  return NextResponse.json(result);
}


