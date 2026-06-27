'use client';

import { useEffect, useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { getEmployees, deleteEmployee, type EmployeeFilters } from '../api/service';
import { EmployeeFormDialog } from './employee-form-dialog';

type Employee = {
  id: string;
  code: string;
  fullName: string;
  phone: string | null;
  position: string | null;
  active: boolean;
  hiredAt: Date | null;
  department: { id: string; name: string } | null;
  user: { email: string } | null;
};

export function EmployeeListing() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const limit = 10;

  function loadData(filters?: Partial<EmployeeFilters>) {
    startTransition(async () => {
      const result = await getEmployees({
        page: filters?.page ?? page,
        limit,
        search: (filters?.search ?? search) || undefined,
      });
      setEmployees(result.employees as Employee[]);
      setTotal(result.total);
    });
  }

  useEffect(() => {
    loadData({ page: 1, search: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
    loadData({ page: 1, search: value });
  }

  function handleDelete(id: string) {
    if (!confirm('Xóa nhân viên này?')) return;
    startTransition(async () => {
      await deleteEmployee(id);
      loadData();
    });
  }

  function handleEdit(emp: Employee) {
    setEditingEmployee(emp);
    setDialogOpen(true);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Input
          placeholder='Tìm theo tên hoặc mã...'
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className='max-w-sm'
        />
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã NV</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Chức vụ</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className='w-[80px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                  Chưa có nhân viên nào
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className='font-mono text-sm'>{emp.code}</TableCell>
                  <TableCell className='font-medium'>{emp.fullName}</TableCell>
                  <TableCell>{emp.position ?? '—'}</TableCell>
                  <TableCell>{emp.department?.name ?? '—'}</TableCell>
                  <TableCell>{emp.phone ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={emp.active ? 'default' : 'secondary'}>
                      {emp.active ? 'Đang làm' : 'Nghỉ'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      <Button variant='ghost' size='icon' onClick={() => handleEdit(emp)}>
                        <Icons.settings className='h-4 w-4' />
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => handleDelete(emp.id)}>
                        <Icons.trash className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            Tổng {total} nhân viên
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => {
                setPage(page - 1);
                loadData({ page: page - 1 });
              }}
            >
              Trước
            </Button>
            <span className='flex items-center text-sm'>
              {page} / {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => {
                setPage(page + 1);
                loadData({ page: page + 1 });
              }}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingEmployee(null);
        }}
        employee={editingEmployee}
        onSuccess={() => {
          setDialogOpen(false);
          setEditingEmployee(null);
          loadData();
        }}
      />
    </div>
  );
}
