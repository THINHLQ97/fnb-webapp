# Navigation RBAC System

## Overview

Client-side RBAC for navigation items using Auth.js session roles.

## Architecture

- **`src/hooks/use-nav.ts`** — filters nav items by user role from session
- **`src/config/nav-config.ts`** — nav items with optional `access.roles` array

## Usage

```typescript
// nav-config.ts
{
  title: 'Nhân viên',
  url: '/dashboard/employees',
  icon: 'teams',
  access: { roles: ['ADMIN', 'MANAGER'] }
}
```

Items without `access` are visible to all authenticated users.

## Roles

Defined in Prisma schema: `ADMIN`, `EDITOR`, `MANAGER`, `STAFF`.
