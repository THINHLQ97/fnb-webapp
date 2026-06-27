import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

type Role = 'ADMIN' | 'EDITOR' | 'MANAGER' | 'STAFF';

const ROLE_LEVEL: Record<Role, number> = {
  ADMIN: 40,
  MANAGER: 30,
  EDITOR: 20,
  STAFF: 10,
};

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/sign-in');
  return user;
}

export async function requireRole(...allowed: Role[]) {
  const user = await requireAuth();
  if (!allowed.includes(user.role as Role)) redirect('/dashboard');
  return user;
}

export function hasMinRole(userRole: string, minRole: Role): boolean {
  return (ROLE_LEVEL[userRole as Role] ?? 0) >= ROLE_LEVEL[minRole];
}
