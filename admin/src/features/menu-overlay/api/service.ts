'use server';

import { prisma } from '@/lib/prisma';
import { getKiotVietClient } from '@/lib/kiotviet/client';
import { revalidateWebPaths } from '@/lib/revalidate-web';

export type MenuOverlayItem = {
  kiotvietId: number;
  code: string;
  name: string;
  price: number;
  categoryName: string;
  kiotvietImage: string | null;
  override: {
    id: string | null;
    highlight: boolean;
    featured: boolean;
    customImage: string | null;
    tag: string | null;
    note: string | null;
  };
};

function firstImage(p: Record<string, unknown>): string | null {
  const imgs = p.images;
  if (Array.isArray(imgs) && imgs.length > 0 && typeof imgs[0] === 'string') return imgs[0];
  const img = p.image;
  if (typeof img === 'string' && img) return img;
  return null;
}

export async function getMenuOverlay(): Promise<{
  items: MenuOverlayItem[];
  error?: string;
}> {
  const client = getKiotVietClient();
  if (!client) {
    return { items: [], error: 'Chưa cấu hình KIOTVIET_CLIENT_ID / SECRET / RETAILER' };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await (client as any).products.list({
      pageSize: 100,
      isActive: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any[] = res?.data ?? [];

    const kiotvietIds = raw.map((p) => Number(p.id)).filter((n) => Number.isFinite(n));
    let overrideMap = new Map<number, Awaited<ReturnType<typeof prisma.menuItemOverride.findMany>>[number]>();
    try {
      const overrides = await prisma.menuItemOverride.findMany({
        where: { kiotvietId: { in: kiotvietIds } },
      });
      overrideMap = new Map(overrides.map((o) => [o.kiotvietId, o]));
    } catch {
      // Bảng chưa migrate — vẫn hiển thị sản phẩm KiotViet, chỉ không có overlay
    }

    const items: MenuOverlayItem[] = raw.map((p) => {
      const id = Number(p.id);
      const o = overrideMap.get(id);
      return {
        kiotvietId: id,
        code: String(p.code ?? ''),
        name: String(p.name ?? p.fullName ?? ''),
        price: Number(p.basePrice ?? p.price ?? 0),
        categoryName: String(p.categoryName ?? 'Khác'),
        kiotvietImage: firstImage(p),
        override: {
          id: o?.id ?? null,
          highlight: o?.highlight ?? false,
          featured: o?.featured ?? false,
          customImage: o?.customImage ?? null,
          tag: o?.tag ?? null,
          note: o?.note ?? null,
        },
      };
    });

    return { items };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { items: [], error: message };
  }
}

export type OverrideInput = {
  highlight: boolean;
  featured: boolean;
  customImage?: string;
  tag?: string;
  note?: string;
};

export async function isMenuOverrideReady(): Promise<boolean> {
  try {
    await prisma.menuItemOverride.count();
    return true;
  } catch {
    return false;
  }
}

export async function saveOverride(kiotvietId: number, data: OverrideInput) {
  const result = await prisma.menuItemOverride.upsert({
    where: { kiotvietId },
    create: {
      kiotvietId,
      highlight: data.highlight,
      featured: data.featured,
      customImage: data.customImage || null,
      tag: data.tag || null,
      note: data.note || null,
    },
    update: {
      highlight: data.highlight,
      featured: data.featured,
      customImage: data.customImage || null,
      tag: data.tag || null,
      note: data.note || null,
    },
  });
  revalidateWebPaths(['/menu', '/']);
  return result;
}

export async function clearOverride(kiotvietId: number) {
  await prisma.menuItemOverride.deleteMany({ where: { kiotvietId } });
  revalidateWebPaths(['/menu', '/']);
}
