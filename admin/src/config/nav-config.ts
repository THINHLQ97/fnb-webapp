import { NavGroup } from '@/types';

// Ghi chú: nav được hiển thị cho MỌI user login. Server actions vẫn kiểm tra
// quyền — RBAC được thực thi ở tầng nghiệp vụ, không phải ở tầng nhìn thấy.
// Với quán F&B nhỏ (1-2 quản lý), ẩn nav gây nhầm lẫn nhiều hơn là bảo vệ.

export const navGroups: NavGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      {
        title: 'Bảng điều khiển',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
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
        shortcut: ['b', 'b'],
        items: []
      },
      {
        title: 'Menu',
        url: '/dashboard/menu',
        icon: 'product',
        isActive: false,
        shortcut: ['m', 'm'],
        items: []
      },
      {
        title: 'Cấu hình website',
        url: '/dashboard/settings',
        icon: 'settings',
        isActive: false,
        items: []
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
        items: []
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
        items: []
      }
    ]
  },
  {
    label: 'Hệ thống',
    items: [
      {
        title: 'Người dùng',
        url: '/dashboard/users',
        icon: 'teams',
        isActive: false,
        items: []
      },
      {
        title: 'Khởi tạo',
        url: '/dashboard/setup',
        icon: 'settings',
        isActive: false,
        items: []
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
            icon: 'profile'
          },
          {
            title: 'Đăng xuất',
            url: '/',
            icon: 'login'
          }
        ]
      }
    ]
  }
];
