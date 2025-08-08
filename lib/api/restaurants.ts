import { prisma } from '../prisma';
import type { Prisma } from '@prisma/client';

export type RestaurantUI = {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string | null;
  website_url: string | null;
  verified: boolean;
};

export type RestaurantWithDishes = RestaurantUI & {
  dishes: Array<{
    id: string;
    name: string;
    description: string | null;
    price_cents: number | null;
    section: string;
    tags: string[];
  }>;
};

export async function searchRestaurants(params: {
  query?: string;
  city?: string;
  limit?: number;
}): Promise<RestaurantUI[]> {
  const restaurants = await prisma.restaurant.findMany({
    where: {
      verified: true,
      ...(params.query
        ? { name: { contains: params.query, mode: 'insensitive' as const } }
        : {}),
      ...(params.city
        ? { city: { contains: params.city, mode: 'insensitive' as const } }
        : {}),
    },
    orderBy: { name: 'asc' },
    take: params.limit ?? undefined,
  });

  return restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    city: r.city,
    address: r.address,
    website_url: r.websiteUrl ?? null,
    verified: r.verified,
  }));
}

export async function getRestaurantBySlug(slug: string, city: string): Promise<RestaurantWithDishes | null> {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      slug,
      city: { equals: city, mode: 'insensitive' },
    },
    include: {
      menus: {
        where: { status: 'APPROVED' },
        include: {
          dishes: {
            select: {
              id: true,
              name: true,
              description: true,
              priceCents: true,
              section: true,
              tags: true,
            },
          },
        },
      },
    },
  });

  if (!restaurant) return null;

  const dishes = restaurant.menus.flatMap((menu) =>
    menu.dishes.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      price_cents: d.priceCents ?? null,
      section: d.section,
      tags: d.tags,
    }))
  );

  const result: RestaurantWithDishes = {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    city: restaurant.city,
    address: restaurant.address,
    website_url: restaurant.websiteUrl ?? null,
    verified: restaurant.verified,
    dishes,
  };
  return result;
}

export async function getRestaurantsByCity(city: string): Promise<RestaurantUI[]> {
  const restaurants = await prisma.restaurant.findMany({
    where: { city: { equals: city, mode: 'insensitive' }, verified: true },
    orderBy: { name: 'asc' },
  });
  return restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    city: r.city,
    address: r.address,
    website_url: r.websiteUrl ?? null,
    verified: r.verified,
  }));
}

export async function createRestaurant(restaurant: {
  name: string;
  slug: string;
  city: string;
  address?: string | null;
  website_url?: string | null;
  lat?: number | null;
  lon?: number | null;
  claimed_by?: string | null;
  verified?: boolean;
}): Promise<RestaurantUI> {
  const created = await prisma.restaurant.create({
    data: {
      name: restaurant.name,
      slug: restaurant.slug,
      city: restaurant.city,
      address: restaurant.address ?? null,
      websiteUrl: restaurant.website_url ?? null,
      lat: restaurant.lat == null ? null : new Prisma.Decimal(restaurant.lat),
      lon: restaurant.lon == null ? null : new Prisma.Decimal(restaurant.lon),
      claimedBy: restaurant.claimed_by ?? null,
      verified: restaurant.verified ?? false,
    },
  });
  return {
    id: created.id,
    name: created.name,
    slug: created.slug,
    city: created.city,
    address: created.address,
    website_url: created.websiteUrl ?? null,
    verified: created.verified,
  };
}

export async function updateRestaurant(id: string, updates: {
  name?: string;
  slug?: string;
  city?: string;
  address?: string | null;
  website_url?: string | null;
  lat?: number | null;
  lon?: number | null;
  claimed_by?: string | null;
  verified?: boolean;
}): Promise<RestaurantUI> {
  const updated = await prisma.restaurant.update({
    where: { id },
    data: {
      name: updates.name,
      slug: updates.slug,
      city: updates.city,
      address: updates.address,
      websiteUrl: updates.website_url,
      lat: updates.lat == null ? undefined : new Prisma.Decimal(updates.lat),
      lon: updates.lon == null ? undefined : new Prisma.Decimal(updates.lon),
      claimedBy: updates.claimed_by,
      verified: updates.verified,
    },
  });
  return {
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    city: updated.city,
    address: updated.address,
    website_url: updated.websiteUrl ?? null,
    verified: updated.verified,
  };
}