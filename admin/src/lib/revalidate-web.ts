/**
 * Gọi endpoint /api/revalidate của web app để invalidate ISR cache ngay lập tức.
 * Không await ở chỗ gọi (fire-and-forget) — nếu web app down, admin action vẫn thành công.
 *
 * Cần env vars:
 *  - WEB_URL: URL gốc của web app (VD: https://fnb-webapp.vibe.matbao.net)
 *  - REVALIDATE_SECRET: shared secret giữa admin và web
 */
export function revalidateWebPaths(paths: string[]): void {
  const url = process.env.WEB_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!url || !secret) {
    // Chưa cấu hình — bỏ qua, không phá logic gọi
    return;
  }

  const endpoint = url.replace(/\/$/, '') + '/api/revalidate';

  // Fire-and-forget với timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-revalidate-secret': secret,
    },
    body: JSON.stringify({ paths }),
    signal: controller.signal,
  })
    .then((res) => {
      if (!res.ok) {
        console.warn(`[revalidateWeb] ${res.status} khi gọi ${endpoint}`);
      }
    })
    .catch((err) => {
      console.warn(`[revalidateWeb] lỗi: ${err instanceof Error ? err.message : String(err)}`);
    })
    .finally(() => clearTimeout(timeout));
}
