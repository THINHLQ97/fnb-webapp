'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { NavItem, NavGroup } from '@/types';

function filterItems(items: NavItem[], userRole?: string): NavItem[] {
  return items
    .filter((item) => {
      if (!item.access?.roles) return true;
      return userRole ? item.access.roles.includes(userRole as any) : false;
    })
    .map((item) => {
      if (item.items && item.items.length > 0) {
        return { ...item, items: filterItems(item.items, userRole) };
      }
      return item;
    });
}

export function useFilteredNavItems(items: NavItem[]) {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return useMemo(() => filterItems(items, role), [items, role]);
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        items: filterItems(group.items, role),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, role]);
}
