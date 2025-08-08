import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      totalRestaurants,
      totalDishes,
      totalCities,
      avgPrice
    ] = await Promise.all([
      prisma.restaurant.count({
        where: { verified: true }
      }),
      prisma.dish.count({
        where: {
          menu: { status: 'APPROVED' }
        }
      }),
      prisma.restaurant.findMany({
        where: { verified: true },
        select: { city: true },
        distinct: ['city']
      }).then(cities => cities.length),
      prisma.dish.aggregate({
        where: {
          menu: { status: 'APPROVED' },
          priceCents: { not: null }
        },
        _avg: { priceCents: true }
      }).then(result => result._avg.priceCents || 0)
    ]);

    return NextResponse.json({
      restaurants: totalRestaurants,
      dishes: totalDishes,
      cities: totalCities,
      avgPriceEuros: Math.round((avgPrice / 100) * 100) / 100, // Round to 2 decimals
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}