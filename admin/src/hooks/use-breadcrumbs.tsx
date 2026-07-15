'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Tổng quan', link: '/dashboard' }],
  '/dashboard/overview': [
    { title: 'Tổng quan', link: '/dashboard' },
    { title: 'Bảng điều khiển', link: '/dashboard/overview' },
  ],
  '/dashboard/product': [
    { title: 'Tổng quan', link: '/dashboard' },
    { title: 'Sản phẩm', link: '/dashboard/product' },
  ],
  '/dashboard/posts': [
    { title: 'Tổng quan', link: '/dashboard' },
    { title: 'Bài viết', link: '/dashboard/posts' },
  ],
  '/dashboard/menu': [
    { title: 'Tổng quan', link: '/dashboard' },
    { title: 'Menu KiotViet', link: '/dashboard/menu' },
  ],
  '/dashboard/settings': [
    { title: 'Tổng quan', link: '/dashboard' },
    { title: 'Cấu hình website', link: '/dashboard/settings' },
  ],
  '/dashboard/setup': [
    { title: 'Tổng quan', link: '/dashboard' },
    { title: 'Khởi tạo hệ thống', link: '/dashboard/setup' },
  ],
  '/dashboard/users': [
    { title: 'Tổng quan', link: '/dashboard' },
    { title: 'Người dùng', link: '/dashboard/users' },
  ],
  '/dashboard/employees': [
    { title: 'Tổng quan', link: '/dashboard' },
    { title: 'Nhân viên', link: '/dashboard/employees' },
  ],
  '/dashboard/attendance': [
    { title: 'Tổng quan', link: '/dashboard' },
    { title: 'Chấm công', link: '/dashboard/attendance' },
  ],
  '/dashboard/shifts': [
    { title: 'Tổng quan', link: '/dashboard' },
    { title: 'Lịch trực', link: '/dashboard/shifts' },
  ],
  '/dashboard/profile': [
    { title: 'Tổng quan', link: '/dashboard' },
    { title: 'Hồ sơ', link: '/dashboard/profile' },
  ],
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
