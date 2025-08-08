import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { query, city, limit } = body as { query?: string; city?: string; limit?: number };

  const isProd = process.env.NODE_ENV === 'production';

  const restaurants = await prisma.restaurant.findMany({
    where: {
      ...(isProd ? { verified: true } : {}),
      ...(query ? { name: { contains: query, mode: 'insensitive' } } : {}),
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
    },
    orderBy: { name: 'asc' },
    take: limit ?? 50,
  });

  const result = restaurants.map((r) => ({
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


