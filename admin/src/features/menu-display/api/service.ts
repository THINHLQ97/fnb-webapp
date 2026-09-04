'use server';

import { prisma } from '@/lib/prisma';
import { revalidateWebPaths } from '@/lib/revalidate-web';

export type MenuDisplayItem = {
  id: string;
  name: string;
  category: string;
  priceRegular: number;
  priceLarge: number;
  active: boolean;
  description: string | null;
  image: string | null;
  tag: string | null;
  highlight: boolean;
  featured: boolean;
};

export type MenuDisplayInput = {
  description?: string;
  image?: string;
  tag?: string;
  highlight: boolean;
  featured: boolean;
};

/** Danh sách món trên menu website — nguồn là công thức trong Kho hàng. */
export async function getMenuDisplay(): Promise<{
  items: MenuDisplayItem[];
  error?: string;
}> {
  try {
    const recipes = await prisma.drinkRecipe.findMany({
      orderBy: [{ featured: 'desc' }, { category: 'asc' }, { name: 'asc' }],
    });

    return {
      items: recipes.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category ?? 'Khác',
        priceRegular: r.priceRegular,
        priceLarge: r.priceLarge,
        active: r.active,
        description: r.description,
        image: r.image,
        tag: r.tag,
        highlight: r.highlight,
        featured: r.featured,
      })),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { items: [], error: message };
  }
}

export async function saveMenuDisplay(id: string, data: MenuDisplayInput) {
  const result = await prisma.drinkRecipe.update({
    where: { id },
    data: {
      description: data.description || null,
      image: data.image || null,
      tag: data.tag || null,
      highlight: data.highlight,
      featured: data.featured,
    },
  });
  revalidateWebPaths(['/menu', '/']);
  return result;
}

export async function clearMenuDisplay(id: string) {
  await prisma.drinkRecipe.update({
    where: { id },
    data: {
      description: null,
      image: null,
      tag: null,
      highlight: false,
      featured: false,
    },
  });
  revalidateWebPaths(['/menu', '/']);
}
