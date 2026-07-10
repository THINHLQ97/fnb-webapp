import { prisma } from './prisma';

export type HeroSettings = {
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
};

export type ContactSettings = {
  address: string;
  phone: string;
  email: string;
  hoursShort: string;
  socialFacebook?: string;
  socialInstagram?: string;
};

export type FooterSettings = {
  storeName: string;
  tagline: string;
};

export const DEFAULT_HERO: HeroSettings = {
  badge: 'Chào mừng đến với F&B Store',
  titlePrefix: 'Thức uống ngon,',
  titleHighlight: 'mỗi ngày',
  subtitle:
    'Khám phá menu phong phú với các loại trà, cà phê, nước ép và nhiều thức uống hấp dẫn khác. Nguyên liệu tươi ngon, phục vụ tận tâm.',
  primaryCta: 'Xem Menu',
  secondaryCta: 'Liên hệ',
};

export const DEFAULT_CONTACT: ContactSettings = {
  address: '123 Đường ABC, Quận 1, TP.HCM',
  phone: '0909 123 456',
  email: 'hello@fnbstore.vn',
  hoursShort: '7:00 – 22:00 hàng ngày',
};

export const DEFAULT_FOOTER: FooterSettings = {
  storeName: 'F&B Store',
  tagline: 'Thức uống ngon mỗi ngày. Chất lượng là ưu tiên hàng đầu.',
};

async function readSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    if (!row) return fallback;
    return { ...fallback, ...(row.value as object) } as T;
  } catch {
    return fallback;
  }
}

export async function getHero(): Promise<HeroSettings> {
  return readSetting('hero', DEFAULT_HERO);
}

export async function getContact(): Promise<ContactSettings> {
  return readSetting('contact', DEFAULT_CONTACT);
}

export async function getFooter(): Promise<FooterSettings> {
  return readSetting('footer', DEFAULT_FOOTER);
}
