'use server';

import { prisma } from '@/lib/prisma';

export type EmployeeFilters = {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  active?: boolean;
};

export async function getEmployees(filters: EmployeeFilters = {}) {
  const { page = 1, limit = 10, search, departmentId, active } = filters;
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { code: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(departmentId && { departmentId }),
    ...(active !== undefined && { active }),
  };

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { department: true, user: { select: { email: true } } },
    }),
    prisma.employee.count({ where }),
  ]);

  return { employees, total, page, limit };
}

export async function getEmployee(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: { department: true, user: { select: { email: true, name: true } } },
  });
}

export async function createEmployee(data: {
  code: string;
  fullName: string;
  phone?: string;
  position?: string;
  departmentId?: string;
  hiredAt?: Date;
}) {
  return prisma.employee.create({ data });
}

export async function updateEmployee(
  id: string,
  data: {
    fullName?: string;
    phone?: string;
    position?: string;
    departmentId?: string | null;
    active?: boolean;
    hiredAt?: Date | null;
  }
) {
  return prisma.employee.update({ where: { id }, data });
}

export async function deleteEmployee(id: string) {
  return prisma.employee.delete({ where: { id } });
}

export async function getDepartments() {
  return prisma.department.findMany({ orderBy: { name: 'asc' } });
}

export async function createDepartment(name: string) {
  return prisma.department.create({ data: { name } });
}
