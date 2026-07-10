import { KiotVietClient } from 'kiotviet-client-sdk';

/**
 * KiotViet client dùng chung (singleton).
 * Chỉ import ở SERVER — clientSecret không bao giờ ra browser.
 *
 * F&B: KIOTVIET_BASE_URL = https://publicfnb.kiotapi.com/
 * Bán lẻ: mặc định của SDK
 */

let _client: KiotVietClient | null = null;

export function getKiotVietClient(): KiotVietClient | null {
  if (_client) return _client;

  const clientId = process.env.KIOTVIET_CLIENT_ID;
  const clientSecret = process.env.KIOTVIET_CLIENT_SECRET;
  const retailerName = process.env.KIOTVIET_RETAILER;

  if (!clientId || !clientSecret || !retailerName) {
    // Thiếu env → trả null để caller graceful degrade (menu fallback tĩnh)
    return null;
  }

  _client = new KiotVietClient({
    clientId,
    clientSecret,
    retailerName,
    ...(process.env.KIOTVIET_BASE_URL
      ? { baseUrl: process.env.KIOTVIET_BASE_URL }
      : {}),
  } as ConstructorParameters<typeof KiotVietClient>[0]);

  return _client;
}
