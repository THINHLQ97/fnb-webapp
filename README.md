# Mắt Bão F&B — Web app theo Hướng A (KiotViet làm nguồn sự thật)

Stack: **Next.js (App Router) + TypeScript + Prisma/Postgres**. Không Laravel.

## Nguyên tắc cốt lõi

KiotViet là **nguồn sự thật** cho bán hàng / tồn kho / đơn hàng / vận đơn. App của
bạn **đọc** dữ liệu đó qua Public API để hiển thị, và **tự lưu** những thứ KiotViet
không có: bài viết (CMS), nhân sự, chấm công, lịch trực, tài khoản & phân quyền.

> Hệ quả: **không có database tồn kho/doanh số riêng**. Tránh nhập liệu 2 nơi và lệch số.

## Bản đồ module

| Yêu cầu của bạn | Cách làm | Nguồn |
|---|---|---|
| Web giới thiệu sản phẩm (F&B) | Template Next.js, clone về sửa | repo `web` |
| Admin biên tập bài viết | Bảng `Post` + editor rich-text (TipTap/Lexical) | tự build, schema có sẵn |
| Quản lý kho, đơn bán trong ngày, kho vận | Đọc từ KiotViet, hiện lên dashboard | `lib/kiotviet/*` |
| Tích hợp KiotViet | `kiotviet-client-sdk` (OAuth tự động) | npm |
| Chấm công + lịch trực | Bảng `Attendance`, `Shift`, `ShiftAssignment` | tự build, schema có sẵn |
| Database nhân viên + phân công | Bảng `Employee`, `Department`, RBAC `Role` | tự build, schema có sẵn |

## Repo nền (chạy `bootstrap.sh` để clone)

- **Admin dashboard:** `Kiranism/next-shadcn-dashboard-starter` — Next.js 16 + shadcn,
  ~6.6k★. Đây là khung admin (menu, bảng, biểu đồ, form) — bạn gắn các trang vào đây.
- **Web F&B:** `canopas/bite-space` (hoặc `cosmicjs/nextjs-restaurant-website-cms`).
- **Tham khảo vận chuyển:** `sociuvn/order-management` — cách nối KiotViet với GHN/GHTK.

## File trong starter này (copy vào ./admin sau khi clone)

```
lib/kiotviet/client.ts        # khởi tạo client KiotViet từ .env (F&B base URL)
lib/kiotviet/dashboard.ts     # doanh số hôm nay, hàng sắp hết, phiếu nhập...
app/api/dashboard/today/route.ts   # API server-side (giấu secret), cache 60s
app/admin/dashboard/kiotviet-overview.tsx  # ví dụ wiring UI
prisma/schema.prisma          # CMS + nhân sự + chấm công + lịch trực + RBAC
.env.example                  # biến môi trường
```

## Các bước triển khai

1. `bash bootstrap.sh` — clone admin + web + cài SDK.
2. Copy `lib/`, `prisma/`, `app/api/`, `app/admin/` của starter vào `./admin`.
3. `cp .env.example admin/.env` rồi điền `KIOTVIET_CLIENT_ID/SECRET/RETAILER`
   (lấy trong KiotViet > Thiết lập cửa hàng > Thiết lập kết nối API — tài khoản admin).
4. `cd admin && npx prisma migrate dev --name init`
5. `npm run dev` → mở `/api/dashboard/today` để kiểm tra dữ liệu KiotViet về chưa.
6. Cắm `<KiotVietOverview />` vào trang dashboard của shadcn starter.

## Việc còn phải tự build (theo thứ tự ưu tiên gợi ý)

1. **Xác thực & RBAC** — thêm Auth.js (NextAuth) vào admin, map `Role`.
2. **CMS bài viết** — trang danh sách + editor TipTap, lưu `content` dạng JSON.
3. **Dashboard KiotViet** — bổ sung biểu đồ doanh số 7 ngày, lọc theo chi nhánh.
4. **Nhân sự** — CRUD `Employee`/`Department`, gán `User` cho nhân viên.
5. **Chấm công + lịch trực** — màn check-in/out, lịch tuần kéo-thả ca.
6. **Webhook KiotViet** — nhận push khi có hóa đơn mới (real-time thay vì polling).

## Lưu ý quan trọng

- **Kiểm tra LICENSE** từng repo nền trước khi dùng thương mại.
- **[VERIFY] trong code:** tên trường KiotViet (`total`, `onHand`, `purchaseDate`...)
  nên `console.log` một bản ghi thật của gian hàng để khớp chính xác.
- SDK mặc định trỏ endpoint **bán lẻ**; ngành nước uống dùng **F&B** — đã để biến
  `KIOTVIET_BASE_URL=https://publicfnb.kiotapi.com/` trong `.env.example`.
- Token KiotViet sống 1 giờ và có giới hạn tần suất — luôn gọi qua route server
  (đã cache 60s), không gọi thẳng từ browser.
