/**
 * URL gốc của website public (dùng cho sitemap, OG tags, canonical...).
 * Ưu tiên biến môi trường NEXT_PUBLIC_SITE_URL; fallback là fnb-webapp.vibe.matbao.net.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://fnb-webapp.vibe.matbao.net'
).replace(/\/$/, '');

export const SITE_NAME = 'F&B Store';
