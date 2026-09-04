'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import type { Role } from '@prisma/client';

export type UserListItem = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  createdAt: Date;
  providers: string[];
  hasPassword: boolean;
};

export async function listUsers(search?: string): Promise<UserListItem[]> {
  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      accounts: { select: { provider: true } },
    },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    image: u.image,
    role: u.role,
    createdAt: u.createdAt,
    providers: u.accounts.map((a) => a.provider),
    hasPassword: !!u.password,
  }));
}

export async function updateUserRole(
  userId: string,
  role: Role
): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  const meId = session?.user?.id;
  if (!meId) return { ok: false, message: 'Chưa đăng nhập' };

  const me = await prisma.user.findUnique({
    where: { id: meId },
    select: { role: true },
  });
  if (me?.role !== 'ADMIN') {
    return { ok: false, message: 'Chỉ ADMIN được đổi quyền' };
  }

  if (userId === meId && role !== 'ADMIN') {
    // Cấm tự hạ chức chính mình nếu là ADMIN duy nhất
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount <= 1) {
      return {
        ok: false,
        message: 'Bạn là ADMIN duy nhất — không thể tự hạ quyền. Nâng người khác lên ADMIN trước.',
      };
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  return { ok: true, message: 'Đã cập nhật quyền' };
}

export async function deleteUser(
  userId: string
): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  const meId = session?.user?.id;
  if (!meId) return { ok: false, message: 'Chưa đăng nhập' };

  const me = await prisma.user.findUnique({
    where: { id: meId },
    select: { role: true },
  });
  if (me?.role !== 'ADMIN') {
    return { ok: false, message: 'Chỉ ADMIN được xoá' };
  }

  if (userId === meId) {
    return { ok: false, message: 'Không thể xoá chính mình' };
  }

  // Check FK: nếu user có Post → không cho xoá
  const postCount = await prisma.post.count({ where: { authorId: userId } });
  if (postCount > 0) {
    return {
      ok: false,
      message: `User đã viết ${postCount} bài — không xoá được. Đổi tác giả các bài đó sang người khác trước.`,
    };
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    return { ok: true, message: 'Đã xoá' };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Lỗi xoá user',
    };
  }
}
