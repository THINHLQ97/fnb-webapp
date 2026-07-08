# F&B WebApp — Next.js monorepo: admin dashboard + public website for Vietnamese F&B

KiotViet là nguồn sự thật cho bán hàng / tồn kho. App tự quản lý: CMS, nhân sự, chấm công, RBAC.

## Structure

```
admin/   — Dashboard (Next.js 16, Auth.js, Prisma, shadcn/ui)
web/     — Public website (Next.js 16, đọc DB từ admin)
```

## Deployment

- **Admin**: branch `master`, root Dockerfile build từ `admin/`
- **Web**: branch `web`, root Dockerfile build từ `web/`

Cả 2 app kết nối cùng PostgreSQL database.

## Development

```bash
cd admin && npm install && npm run dev   # port 3000
cd web && npm install && npm run dev     # port 3001
```
