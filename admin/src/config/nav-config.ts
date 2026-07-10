import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Sản phẩm',
        url: '/dashboard/product',
        icon: 'product',
        shortcut: ['p', 'p'],
        isActive: false,
        items: []
      },
      {
        title: 'Người dùng',
        url: '/dashboard/users',
        icon: 'teams',
        shortcut: ['u', 'u'],
        isActive: false,
        items: [],
        access: { roles: ['ADMIN'] }
      }
    ]
  },
  {
    label: 'Nội dung',
    items: [
      {
        title: 'Bài viết',
        url: '/dashboard/posts',
        icon: 'post',
        isActive: false,
        items: [],
        access: { roles: ['ADMIN', 'EDITOR'] }
      }
    ]
  },
  {
    label: 'Nhân sự',
    items: [
      {
        title: 'Nhân viên',
        url: '/dashboard/employees',
        icon: 'teams',
        isActive: false,
        items: [],
        access: { roles: ['ADMIN', 'MANAGER'] }
      },
      {
        title: 'Chấm công',
        url: '/dashboard/attendance',
        icon: 'clock',
        isActive: false,
        items: []
      },
      {
        title: 'Lịch trực',
        url: '/dashboard/shifts',
        icon: 'calendar',
        isActive: false,
        items: [],
        access: { roles: ['ADMIN', 'MANAGER'] }
      }
    ]
  },
  {
    label: '',
    items: [
      {
        title: 'Tài khoản',
        url: '#',
        icon: 'account',
        isActive: true,
        items: [
          {
            title: 'Hồ sơ',
            url: '/dashboard/profile',
            icon: 'profile',
            shortcut: ['m', 'm']
          },
          {
            title: 'Đăng nhập',
            shortcut: ['l', 'l'],
            url: '/',
            icon: 'login'
          }
        ]
      }
    ]
  }
];
