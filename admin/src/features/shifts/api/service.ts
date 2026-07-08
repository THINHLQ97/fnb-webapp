'use server';

import { prisma } from '@/lib/prisma';

export async function getShifts() {
  return prisma.shift.findMany({ orderBy: { startTime: 'asc' } });
}

export async function createShift(data: { name: string; startTime: string; endTime: string }) {
  return prisma.shift.create({ data });
}

export async function updateShift(id: string, data: { name?: string; startTime?: string; endTime?: string }) {
  return prisma.shift.update({ where: { id }, data });
}

export async function deleteShift(id: string) {
  return prisma.shift.delete({ where: { id } });
}

export async function getShiftAssignments(filters: { date?: string; week?: string; employeeId?: string } = {}) {
  const where: Record<string, unknown> = {};

  if (filters.employeeId) where.employeeId = filters.employeeId;

  if (filters.date) {
    const d = new Date(filters.date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start.getTime() + 86400000);
    where.date = { gte: start, lt: end };
  } else if (filters.week) {
    const start = new Date(filters.week);
    const end = new Date(start.getTime() + 7 * 86400000);
    where.date = { gte: start, lt: end };
  }

  return prisma.shiftAssignment.findMany({
    where,
    orderBy: [{ date: 'asc' }],
    include: {
      shift: true,
      employee: { select: { code: true, fullName: true } },
    },
  });
}

export async function assignShift(data: {
  shiftId: string;
  employeeId: string;
  date: Date;
  note?: string;
}) {
  return prisma.shiftAssignment.create({ data });
}

export async function removeShiftAssignment(id: string) {
  return prisma.shiftAssignment.delete({ where: { id } });
}
