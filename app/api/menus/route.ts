import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { restaurantId, sourceType, sourceUrl } = body as {
    restaurantId: string;
    sourceType: 'pdf' | 'image' | 'url';
    sourceUrl?: string;
  };

  if (!restaurantId || !sourceType) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  const created = await prisma.menu.create({
    data: {
      restaurantId,
      sourceType: sourceType.toUpperCase() as any,
      sourceUrl: sourceUrl ?? null,
      status: 'PENDING',
    },
  });

  return NextResponse.json(created);
}


