import { prisma } from './prisma';

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  priceLarge: number;
  description: string | null;
  image: string | null;
  categoryId: string | null;
  categoryName: string;
  tag: string | null;
  highlight: boolean;
  featured: boolean;
};

export type MenuCategory = {
  id: string;
  name: string;
};

export type MenuData = {
  categories: MenuCategory[];
  items: MenuItem[];
  error?: string;
};

const EMPTY: MenuData = { categories: [], items: [] };

/**
 * Menu công khai — nguồn là công thức món (DrinkRecipe) do admin quản lý ở
 * Dashboard → Kho hàng (món & giá) và Dashboard → Menu website (ảnh, tag, mô tả).
 */
export async function getMenu(): Promise<MenuData> {
  try {
    const recipes = await prisma.drinkRecipe.findMany({
      where: { active: true },
      orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    });

    const items: MenuItem[] = recipes.map((r) => {
      const categoryName = r.category?.trim() || 'Khác';
      return {
        id: r.id,
        name: r.name,
        price: r.priceRegular,
        priceLarge: r.priceLarge,
        description: r.description,
        image: r.image,
        categoryId: categoryName,
        categoryName,
        tag: r.tag,
        highlight: r.highlight,
        featured: r.featured,
      };
    });

    const catNames = Array.from(new Set(items.map((i) => i.categoryName))).sort((a, b) =>
      a.localeCompare(b, 'vi')
    );
    const categories: MenuCategory[] = catNames.map((name) => ({ id: name, name }));

    return { categories, items };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[menu]', message);
    return { ...EMPTY, error: `Không lấy được menu: ${message}` };
  }
}
