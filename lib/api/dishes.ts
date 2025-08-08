import { prisma } from '../prisma';

export type DishWithRestaurant = {
  id: string;
  menuId: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number | null;
  section: string;
  tags: string[];
  imageUrl: string | null;
  createdAt: Date;
  restaurant: {
    id: string;
    name: string;
    slug: string;
    city: string;
    address: string | null;
  };
};

export async function searchDishes(params: {
  query?: string;
  city?: string;
  maxPrice?: number;
  section?: string;
  tags?: string[];
  limit?: number;
}): Promise<DishWithRestaurant[]> {
  const dishes = await prisma.dish.findMany({
    where: {
      menu: {
        status: 'APPROVED',
        restaurant: params.city
          ? { city: { contains: params.city, mode: 'insensitive' } }
          : undefined,
      },
      ...(params.query ? { name: { contains: params.query, mode: 'insensitive' } } : {}),
      ...(params.maxPrice != null ? { priceCents: { lte: params.maxPrice * 100 } } : {}),
      ...(params.section ? { section: params.section } : {}),
      ...(params.tags && params.tags.length > 0 ? { tags: { hasSome: params.tags } } : {}),
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
    orderBy: { name: 'asc' },
    take: params.limit ?? undefined,
  });

  return dishes.map((d) => ({
    id: d.id,
    menuId: d.menuId,
    name: d.name,
    slug: d.slug,
    description: d.description,
    price_cents: d.priceCents ?? null,
    section: d.section,
    tags: d.tags,
    imageUrl: d.imageUrl ?? null,
    createdAt: d.createdAt,
    restaurant: {
      id: d.menu.restaurant.id,
      name: d.menu.restaurant.name,
      slug: d.menu.restaurant.slug,
      city: d.menu.restaurant.city,
      address: d.menu.restaurant.address,
    },
  }));
}

export async function getDishBySlug(slug: string, city: string): Promise<DishWithRestaurant | null> {
  const dish = await prisma.dish.findFirst({
    where: {
      slug,
      menu: { status: 'APPROVED', restaurant: { city: { equals: city, mode: 'insensitive' } } },
    },
    include: {
      menu: { include: { restaurant: true } },
    },
  });
  if (!dish) return null;
  return {
    id: dish.id,
    menuId: dish.menuId,
    name: dish.name,
    slug: dish.slug,
    description: dish.description,
    price_cents: dish.priceCents ?? null,
    section: dish.section,
    tags: dish.tags,
    imageUrl: dish.imageUrl ?? null,
    createdAt: dish.createdAt,
    restaurant: {
      id: dish.menu.restaurant.id,
      name: dish.menu.restaurant.name,
      slug: dish.menu.restaurant.slug,
      city: dish.menu.restaurant.city,
      address: dish.menu.restaurant.address,
    },
  };
}

export async function getDishesByName(dishName: string): Promise<DishWithRestaurant[]> {
  const dishes = await prisma.dish.findMany({
    where: { name: { contains: dishName, mode: 'insensitive' }, menu: { status: 'APPROVED' } },
    include: { menu: { include: { restaurant: true } } },
    orderBy: { priceCents: 'asc' },
  });
  return dishes.map((d) => ({
    id: d.id,
    menuId: d.menuId,
    name: d.name,
    slug: d.slug,
    description: d.description,
    price_cents: d.priceCents ?? null,
    section: d.section,
    tags: d.tags,
    imageUrl: d.imageUrl ?? null,
    createdAt: d.createdAt,
    restaurant: {
      id: d.menu.restaurant.id,
      name: d.menu.restaurant.name,
      slug: d.menu.restaurant.slug,
      city: d.menu.restaurant.city,
      address: d.menu.restaurant.address,
    },
  }));
}

export async function getBestDishesUnderPrice(dishName: string, maxPrice: number, city?: string): Promise<DishWithRestaurant[]> {
  const dishes = await prisma.dish.findMany({
    where: {
      name: { contains: dishName, mode: 'insensitive' },
      priceCents: { lte: maxPrice * 100 },
      menu: {
        status: 'APPROVED',
        restaurant: city ? { city: { contains: city, mode: 'insensitive' } } : undefined,
      },
    },
    include: { menu: { include: { restaurant: true } } },
    orderBy: { priceCents: 'asc' },
    take: 20,
  });
  return dishes.map((d) => ({
    id: d.id,
    menuId: d.menuId,
    name: d.name,
    slug: d.slug,
    description: d.description,
    price_cents: d.priceCents ?? null,
    section: d.section,
    tags: d.tags,
    imageUrl: d.imageUrl ?? null,
    createdAt: d.createdAt,
    restaurant: {
      id: d.menu.restaurant.id,
      name: d.menu.restaurant.name,
      slug: d.menu.restaurant.slug,
      city: d.menu.restaurant.city,
      address: d.menu.restaurant.address,
    },
  }));
}