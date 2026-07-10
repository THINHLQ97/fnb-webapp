import { KiotVietClient } from "kiotviet-client-sdk";

/**
 * Khởi tạo client KiotViet dùng chung (singleton).
 *
 * Lưu ý ngành nước uống (F&B / Bar–Coffee):
 *  - KiotViet có endpoint Public API riêng cho F&B: https://publicfnb.kiotapi.com/
 *  - Endpoint bán lẻ mặc định của SDK là:           https://public.kiotapi.com/
 *  Hãy đặt KIOTVIET_BASE_URL trong .env cho đúng loại cửa hàng của bạn.
 *
 * clientId / clientSecret lấy ở: KiotViet > Thiết lập cửa hàng > Thiết lập kết nối API
 * (chỉ tài khoản admin của gian hàng mới thấy).
 *
 * QUAN TRỌNG: chỉ import file này ở phía SERVER (Route Handler / Server Action /
 * Server Component). Không bao giờ để clientSecret lọt xuống browser.
 */

let _client: KiotVietClient | null = null;

export function getKiotVietClient(): KiotVietClient | null {
  if (_client) return _client;

  const clientId = process.env.KIOTVIET_CLIENT_ID;
  const clientSecret = process.env.KIOTVIET_CLIENT_SECRET;
  const retailerName = process.env.KIOTVIET_RETAILER;

  if (!clientId || !clientSecret || !retailerName) {
    // Trả null để caller graceful degrade thay vì crash toàn app
    return null;
  }

  _client = new KiotVietClient({
    clientId,
    clientSecret,
    retailerName,
    // SDK tự lấy & làm mới access token (OAuth client_credentials, hạn 1 giờ).
    ...(process.env.KIOTVIET_BASE_URL
      ? { baseUrl: process.env.KIOTVIET_BASE_URL }
      : {}),
  } as ConstructorParameters<typeof KiotVietClient>[0]);

  return _client;
}
