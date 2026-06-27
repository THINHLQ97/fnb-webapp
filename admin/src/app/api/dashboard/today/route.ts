import { NextResponse } from "next/server";
import { getDashboardToday } from "@/lib/kiotviet";

// Chạy phía server — clientSecret KiotViet không bao giờ ra browser.
// Cache 60s để tránh gọi KiotViet quá dày (token sống 1 giờ, API có giới hạn).
export const revalidate = 60;

export async function GET() {
  try {
    const data = await getDashboardToday();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[dashboard/today]", err);
    return NextResponse.json(
      { error: "Không lấy được dữ liệu KiotViet", detail: err?.message },
      { status: 502 }
    );
  }
}
