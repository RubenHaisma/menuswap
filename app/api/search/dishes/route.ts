import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { query, city, maxPrice, section, tags, sortBy, limit } = body as {
    query?: string;
    city?: string;
    maxPrice?: number;
    section?: string;
    tags?: string[];
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'name';
    limit?: number;
  };

  // Build advanced query: split terms and match across name, description, section, tags
  const terms = (query ?? '')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const where = {
    menu: {
      status: 'APPROVED' as const,
      restaurant: city ? { city: { contains: city, mode: 'insensitive' as const } } : undefined,
    },
    ...(maxPrice != null ? { priceCents: { lte: maxPrice * 100 } } : {}),
    ...(section ? { section } : {}),
    ...(tags && tags.length > 0 ? { tags: { hasSome: tags } } : {}),
    ...(terms.length > 0
      ? {
          AND: terms.map((t) => ({
            OR: [
              { name: { contains: t, mode: 'insensitive' as const } },
              { description: { contains: t, mode: 'insensitive' as const } },
              { section: { contains: t, mode: 'insensitive' as const } },
              { tags: { has: t } },
              { menu: { restaurant: { name: { contains: t, mode: 'insensitive' as const } } } },
              { menu: { restaurant: { city: { contains: t, mode: 'insensitive' as const } } } },
            ],
          })),
        }
      : {}),
  } as const;

  // Sorting strategy
  let orderBy: any = { name: 'asc' as const };
  if (sortBy === 'price_asc') {
    orderBy = [{ priceCents: 'asc' as const }, { name: 'asc' as const }];
  } else if (sortBy === 'price_desc') {
    orderBy = [{ priceCents: 'desc' as const }, { name: 'asc' as const }];
  } else if (sortBy === 'name') {
    orderBy = { name: 'asc' as const };
  } else if (sortBy === 'relevance' && terms.length > 0) {
    // Basic relevance: prioritize exact match, then startsWith, then contains, then price asc as tiebreaker
    // Prisma cannot express complex text ranking natively; approximate by name asc to keep deterministic
    orderBy = { name: 'asc' as const };
  }

  const dishes = await prisma.dish.findMany({
    where,
    include: { menu: { include: { restaurant: true } } },
    orderBy,
    take: limit ?? 100,
  });

  // Client-visible mapping
  const result = dishes
    .filter((d) => d.priceCents != null || sortBy !== 'price_asc')
    .map((d) => ({
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


