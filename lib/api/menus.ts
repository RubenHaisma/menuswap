import { prisma } from '../prisma';
import type { Menu } from '@prisma/client';

type MenuWithRestaurant = Menu & { restaurant?: { name: string; city: string } };

export async function uploadMenu(menuData: {
  restaurantId: string;
  sourceType: 'pdf' | 'image' | 'url';
  sourceUrl?: string;
  file?: File;
}): Promise<Menu> {
  let sourceUrl = menuData.sourceUrl;

  // If a file is provided, upload it first
  if (menuData.file) {
    const form = new FormData();
    form.append('file', menuData.file);
    const response = await fetch('/api/uploads', { method: 'POST', body: form });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`File upload failed: ${text}`);
    }
    const json = (await response.json()) as { url: string };
    sourceUrl = json.url;
  }

  const created = await prisma.menu.create({
    data: {
      restaurantId: menuData.restaurantId,
      sourceType: menuData.sourceType.toUpperCase() as any,
      sourceUrl: sourceUrl ?? null,
      status: 'PENDING',
    },
  });

  return created;
}

export async function updateMenuStatus(menuId: string, status: 'approved' | 'rejected', parsedData?: any): Promise<Menu> {
  const updated = await prisma.menu.update({
    where: { id: menuId },
    data: {
      status: status.toUpperCase() as any,
      parsedJson: parsedData ?? undefined,
    },
  });
  return updated;
}

export async function getPendingMenus(): Promise<Menu[]> {
  const menus = await prisma.menu.findMany({
    where: { status: 'PENDING' },
    include: { restaurant: { select: { name: true, city: true } } },
    orderBy: { uploadedAt: 'asc' },
  });
  return menus as unknown as Menu[];
}

export async function createDishesFromMenu(menuId: string, dishes: Array<{
  name: string;
  slug: string;
  description?: string;
  price_cents?: number;
  section: string;
  tags?: string[];
}>): Promise<void> {
  await prisma.dish.createMany({
    data: dishes.map((d) => ({
      menuId,
      name: d.name,
      slug: d.slug,
      description: d.description ?? null,
      priceCents: d.price_cents ?? null,
      section: d.section,
      tags: d.tags ?? [],
    })),
    skipDuplicates: true,
  });
}