'use server';

import { prisma } from '@/lib/prisma';

export type AttendanceFilters = {
  page?: number;
  limit?: number;
  date?: string;
  employeeId?: string;
  month?: string;
};

export async function getAttendances(filters: AttendanceFilters = {}) {
  const { page = 1, limit = 20, date, employeeId, month } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (employeeId) where.employeeId = employeeId;
  if (date) {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start.getTime() + 86400000);
    where.date = { gte: start, lt: end };
  } else if (month) {
    const [y, m] = month.split('-').map(Number);
    where.date = {
      gte: new Date(y, m - 1, 1),
      lt: new Date(y, m, 1),
    };
  }

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ date: 'desc' }, { checkIn: 'desc' }],
      include: { employee: { select: { code: true, fullName: true } } },
    }),
    prisma.attendance.count({ where }),
  ]);

  return { records, total, page, limit };
}

export async function checkIn(employeeId: string, note?: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return prisma.attendance.upsert({
    where: { employeeId_date: { employeeId, date: today } },
    update: { checkIn: now, note },
    create: { employeeId, date: today, checkIn: now, source: 'web', note },
  });
}

export async function checkOut(employeeId: string, note?: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return prisma.attendance.upsert({
    where: { employeeId_date: { employeeId, date: today } },
    update: { checkOut: now, ...(note && { note }) },
    create: { employeeId, date: today, checkOut: now, source: 'web', note },
  });
}

export async function updateAttendance(
  id: string,
  data: { checkIn?: Date | null; checkOut?: Date | null; note?: string }
) {
  return prisma.attendance.update({ where: { id }, data });
}

export async function deleteAttendance(id: string) {
  return prisma.attendance.delete({ where: { id } });
}

export async function getAttendanceSummary(month: string) {
  const [y, m] = month.split('-').map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const records = await prisma.attendance.findMany({
    where: { date: { gte: start, lt: end } },
    include: { employee: { select: { code: true, fullName: true } } },
  });

  const summary = new Map<string, { name: string; code: string; days: number; totalHours: number }>();

  for (const r of records) {
    const key = r.employeeId;
    const existing = summary.get(key) ?? {
      name: r.employee.fullName,
      code: r.employee.code,
      days: 0,
      totalHours: 0,
    };
    existing.days++;
    if (r.checkIn && r.checkOut) {
      existing.totalHours += (r.checkOut.getTime() - r.checkIn.getTime()) / 3600000;
    }
    summary.set(key, existing);
  }

  return Array.from(summary.entries()).map(([employeeId, data]) => ({
    employeeId,
    ...data,
    totalHours: Math.round(data.totalHours * 10) / 10,
  }));
}
