"use client";

import { useEffect, useState } from "react";
import type { DashboardToday } from "@/lib/kiotviet";

/**
 * Ví dụ wiring tối giản: gọi /api/dashboard/today và hiển thị.
 * Phần style/đẹp lấy từ component Card của shadcn dashboard starter bạn clone về —
 * ở đây chỉ minh hoạ luồng dữ liệu, không phải giao diện cuối.
 */
export function KiotVietOverview() {
  const [data, setData] = useState<DashboardToday | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/today")
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then(setData)
      .catch(() => setError("Chưa kết nối được KiotViet. Kiểm tra .env."));
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p>Đang tải số liệu hôm nay…</p>;

  const vnd = (n: number) =>
    n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <section>
      <div>
        <strong>Doanh số hôm nay:</strong> {vnd(data.doanhSo)} · {data.soDon} đơn
      </div>
      <div>
        <strong>Hàng sắp hết ({data.hangSapHet.length}):</strong>
        <ul>
          {data.hangSapHet.map((h) => (
            <li key={h.ma}>
              {h.ten} — còn {h.tonKho}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
