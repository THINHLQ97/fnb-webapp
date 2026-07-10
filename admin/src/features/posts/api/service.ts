'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export type PostFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'DRAFT' | 'PUBLISHED';
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function getPosts(filters: PostFilters = {}) {
  const { page = 1, limit = 20, search, status } = filters;
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { slug: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(status && { status }),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: { author: { select: { name: true, email: true } } },
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total, page, limit };
}

export async function getPost(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: { author: { select: { name: true, email: true } } },
  });
}

export type PostInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  status: 'DRAFT' | 'PUBLISHED';
};

export async function createPost(data: PostInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Chưa đăng nhập');

  const slug = data.slug?.trim() || slugify(data.title);
  return prisma.post.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      content: data.content,
      coverImage: data.coverImage || null,
      status: data.status,
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      authorId: session.user.id,
    },
  });
}

export async function updatePost(id: string, data: PostInput) {
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) throw new Error('Không tìm thấy bài viết');

  const slug = data.slug?.trim() || slugify(data.title);
  const publishing = data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED';

  return prisma.post.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      content: data.content,
      coverImage: data.coverImage || null,
      status: data.status,
      publishedAt: publishing ? new Date() : existing.publishedAt,
    },
  });
}

export async function deletePost(id: string) {
  return prisma.post.delete({ where: { id } });
}
