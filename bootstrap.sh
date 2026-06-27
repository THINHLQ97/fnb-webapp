#!/usr/bin/env bash
# bootstrap.sh — clone các repo nền cho hướng A (KiotViet + Next.js/TypeScript)
# Chạy:  bash bootstrap.sh
set -e

echo "==> 1. Clone admin dashboard nền (Next.js 16 + shadcn, ~6.6k star)"
git clone https://github.com/Kiranism/next-shadcn-dashboard-starter.git admin

echo "==> 2. Clone template website F&B (mặt tiền giới thiệu sản phẩm)"
# Chọn 1 trong các template — bite-space có UI món/đồ uống khá đẹp:
git clone https://github.com/canopas/bite-space.git web
# (thay thế) git clone https://github.com/cosmicjs/nextjs-restaurant-website-cms.git web

echo "==> 3. (Tham khảo) repo nối KiotViet + đơn vị vận chuyển GHN/GHTK"
git clone https://github.com/sociuvn/order-management.git ref-shipping || true

echo "==> 4. Cài SDK KiotViet vào app admin"
cd admin
npm install kiotviet-client-sdk @prisma/client
npm install -D prisma
cd ..

echo ""
echo "==> XONG. Tiếp theo:"
echo "   - Copy thư mục lib/ , prisma/ , app/api/ trong starter này vào ./admin"
echo "   - cp .env.example admin/.env  rồi điền KiotViet client_id/secret"
echo "   - cd admin && npx prisma migrate dev --name init && npm run dev"
