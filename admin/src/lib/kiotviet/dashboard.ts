import { getKiotVietClient } from "./client";

/**
 * Tầng "nghiệp vụ" cho dashboard admin — gọi KiotViet và gộp lại thành những con
 * số bạn cần hiển thị: doanh số hôm nay, số đơn hôm nay, hàng sắp hết, phiếu nhập.
 *
 * ⚠️ Tên trường (total, purchaseDate, onHand...) dựa trên cấu trúc phổ biến của
 * KiotViet Public API. Bạn NÊN console.log một bản ghi thật từ gian hàng của mình
 * một lần để khớp chính xác tên field, rồi chỉnh lại các chỗ đánh dấu [VERIFY].
 */

const TZ_OFFSET = "+07:00"; // Asia/Ho_Chi_Minh

function dayRange(date = new Date()) {
  // Trả về chuỗi ISO đầu ngày & cuối ngày theo giờ VN
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return {
    from: `${y}-${m}-${d}T00:00:00${TZ_OFFSET}`,
    to: `${y}-${m}-${d}T23:59:59${TZ_OFFSET}`,
  };
}

export interface DashboardToday {
  doanhSo: number; // tổng tiền hóa đơn trong ngày
  soDon: number; // số hóa đơn trong ngày
  hangSapHet: Array<{ ten: string; ma: string; tonKho: number }>;
  capNhatLuc: string;
}

/** Doanh số + số đơn đã bán hôm nay (dựa trên HÓA ĐƠN — giao dịch đã hoàn tất). */
export async function getDoanhSoHomNay(): Promise<{ doanhSo: number; soDon: number }> {
  const client = getKiotVietClient();
  if (!client) throw new Error('Thiếu cấu hình KiotViet (KIOTVIET_CLIENT_ID/SECRET/RETAILER).');
  const { from, to } = dayRange();

  // invoices.getByDateRange(from, to, params) -> { data, total, ... }
  const res: any = await client.invoices.getByDateRange(from, to, {
    pageSize: 100,
  });

  const list: any[] = res?.data ?? [];
  // [VERIFY] tên trường tổng tiền hóa đơn: thường là "total"
  const doanhSo = list.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

  return { doanhSo, soDon: res?.total ?? list.length };
}

/** Hàng sắp hết — đọc tồn kho và lọc theo ngưỡng. */
export async function getHangSapHet(nguong = 10): Promise<DashboardToday["hangSapHet"]> {
  const client = getKiotVietClient();
  if (!client) throw new Error('Thiếu cấu hình KiotViet (KIOTVIET_CLIENT_ID/SECRET/RETAILER).');

  // Lấy sản phẩm kèm tồn kho. includeInventory để có mảng inventories theo chi nhánh.
  const res: any = await client.products.list({
    pageSize: 100,
    includeInventory: true,
  });

  const products: any[] = res?.data ?? [];
  const out: DashboardToday["hangSapHet"] = [];

  for (const p of products) {
    // [VERIFY] cấu trúc tồn kho: p.inventories?.[i].onHand (cộng dồn các chi nhánh)
    const tonKho =
      (p.inventories ?? []).reduce(
        (s: number, inv: any) => s + (Number(inv.onHand) || 0),
        0
      ) || 0;
    if (tonKho <= nguong) {
      out.push({ ten: p.name, ma: p.code, tonKho });
    }
  }
  return out.sort((a, b) => a.tonKho - b.tonKho).slice(0, 20);
}

/** Phiếu nhập / kho vận gần đây (purchaseOrders). */
export async function getPhieuNhapGanDay(soLuong = 10) {
  const client = getKiotVietClient();
  if (!client) throw new Error('Thiếu cấu hình KiotViet (KIOTVIET_CLIENT_ID/SECRET/RETAILER).');
  const res: any = await client.purchaseOrders.list({ pageSize: soLuong });
  return (res?.data ?? []).map((po: any) => ({
    ma: po.code,
    ngay: po.purchaseDate, // [VERIFY]
    nhaCungCap: po.supplierName ?? po.supplierCode ?? "—", // [VERIFY]
    tongTien: Number(po.total) || 0,
    trangThai: po.status, // [VERIFY] map số trạng thái -> chữ nếu cần
  }));
}

/** Gộp tất cả cho trang tổng quan. */
export async function getDashboardToday(): Promise<DashboardToday> {
  const [{ doanhSo, soDon }, hangSapHet] = await Promise.all([
    getDoanhSoHomNay(),
    getHangSapHet(),
  ]);
  return { doanhSo, soDon, hangSapHet, capNhatLuc: new Date().toISOString() };
}
