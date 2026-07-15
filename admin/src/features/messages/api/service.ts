'use server';

import { prisma } from '@/lib/prisma';

export type MessageFilters = {
  page?: number;
  limit?: number;
  onlyUnread?: boolean;
};

export async function isMessagesReady(): Promise<boolean> {
  try {
    await prisma.contactMessage.count();
    return true;
  } catch {
    return false;
  }
}

export async function getMessages(filters: MessageFilters = {}) {
  const { page = 1, limit = 30, onlyUnread } = filters;
  const skip = (page - 1) * limit;
  const where = onlyUnread ? { read: false } : {};

  const [messages, total, unreadCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);

  return { messages, total, unreadCount, page, limit };
}

export async function markAsRead(id: string, read: boolean) {
  return prisma.contactMessage.update({ where: { id }, data: { read } });
}

export async function markAllAsRead() {
  return prisma.contactMessage.updateMany({ where: { read: false }, data: { read: true } });
}

export async function deleteMessage(id: string) {
  return prisma.contactMessage.delete({ where: { id } });
}

export async function saveMessageNote(id: string, note: string) {
  return prisma.contactMessage.update({
    where: { id },
    data: { note: note.trim() || null },
  });
}
