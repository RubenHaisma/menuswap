import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const city = searchParams.get('city');

  try {
    // Get popular dishes based on frequency in menus
    const dishes = await prisma.dish.findMany({
      where: {
        menu: {
          status: 'APPROVED',
          restaurant: city ? { 
            city: { contains: city, mode: 'insensitive' } 
          } : undefined,
        },
        priceCents: { not: null }, // Only include dishes with prices
      },
      include: {
        menu: {
          include: {
            restaurant: {
              select: { id: true, name: true, slug: true, city: true, address: true },
            },
          },
        },
      },
      orderBy: [
        { name: 'asc' }, // Secondary sort by name for consistency
      ],
      take: limit,
    });

    // Group by dish name and get the cheapest variant of each
    const dishMap = new Map();
    
    dishes.forEach(dish => {
      const key = dish.name.toLowerCase();
      if (!dishMap.has(key) || (dish.priceCents && dishMap.get(key).priceCents > dish.priceCents)) {
        dishMap.set(key, {
          id: dish.id,
          name: dish.name,
          slug: dish.slug,
          description: dish.description,
          price_cents: dish.priceCents,
          section: dish.section,
          tags: dish.tags,
          restaurant: {
            id: dish.menu.restaurant.id,
            name: dish.menu.restaurant.name,
            slug: dish.menu.restaurant.slug,
            city: dish.menu.restaurant.city,
            address: dish.menu.restaurant.address,
          },
        });
      }
    });

    const result = Array.from(dishMap.values())
      .sort((a, b) => (a.price_cents || 0) - (b.price_cents || 0))
      .slice(0, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching popular dishes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular dishes' },
      { status: 500 }
    );
  }
}