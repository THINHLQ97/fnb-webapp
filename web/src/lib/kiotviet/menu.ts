import { getKiotVietClient } from './client';

export type MenuItem = {
  id: number;
  code: string;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  categoryId: number | null;
  categoryName: string;
};

export type MenuCategory = {
  id: number;
  name: string;
};

export type MenuData = {
  categories: MenuCategory[];
  items: MenuItem[];
  source: 'kiotviet' | 'fallback';
  error?: string;
};

const FALLBACK: MenuData = {
  source: 'fallback',
  categories: [
    { id: -1, name: 'Cà phê' },
    { id: -2, name: 'Trà' },
    { id: -3, name: 'Nước ép' },
  ],
  items: [
    { id: 1, code: 'DEMO-01', name: 'Cà phê sữa đá', price: 29000, description: 'Cà phê phin với sữa đặc', image: null, categoryId: -1, categoryName: 'Cà phê' },
    { id: 2, code: 'DEMO-02', name: 'Bạc xỉu', price: 32000, description: 'Cà phê nhẹ, nhiều sữa', image: null, categoryId: -1, categoryName: 'Cà phê' },
    { id: 3, code: 'DEMO-03', name: 'Trà đào cam sả', price: 35000, description: 'Trà hoa cúc, đào tươi', image: null, categoryId: -2, categoryName: 'Trà' },
    { id: 4, code: 'DEMO-04', name: 'Nước ép cam', price: 30000, description: 'Cam tươi ép nguyên chất', image: null, categoryId: -3, categoryName: 'Nước ép' },
  ],
};

function firstImage(p: Record<string, unknown>): string | null {
  const imgs = p.images;
  if (Array.isArray(imgs) && imgs.length > 0 && typeof imgs[0] === 'string') return imgs[0];
  const img = p.image;
  if (typeof img === 'string' && img) return img;
  return null;
}

export async function getMenu(): Promise<MenuData> {
  const client = getKiotVietClient();
  if (!client) return { ...FALLBACK, error: 'Chưa cấu hình KiotViet — hiển thị menu mẫu' };

  try {
    // Product list (chỉ lấy sản phẩm còn bán)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productRes: any = await (client as any).products.list({
      pageSize: 100,
      isActive: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawItems: any[] = productRes?.data ?? [];

    const items: MenuItem[] = rawItems
      .filter((p) => p.allowsSale !== false && p.isActive !== false)
      .map((p) => ({
        id: Number(p.id),
        code: String(p.code ?? ''),
        name: String(p.name ?? p.fullName ?? ''),
        price: Number(p.basePrice ?? p.price ?? 0),
        description: (p.description as string | null) ?? null,
        image: firstImage(p),
        categoryId: p.categoryId != null ? Number(p.categoryId) : null,
        categoryName: String(p.categoryName ?? 'Khác'),
      }))
      .filter((m) => m.name);

    // Tự dựng danh sách category từ chính sản phẩm (không cần gọi thêm endpoint)
    const catMap = new Map<number, string>();
    for (const m of items) {
      if (m.categoryId != null && !catMap.has(m.categoryId)) {
        catMap.set(m.categoryId, m.categoryName);
      }
    }
    const categories: MenuCategory[] = Array.from(catMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    return { source: 'kiotviet', categories, items };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[kiotviet/menu]', message);
    return { ...FALLBACK, error: `Không lấy được menu từ KiotViet: ${message}` };
  }
}
