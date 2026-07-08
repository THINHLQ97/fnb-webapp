'use client';

import { useEffect, useState, useTransition } from 'react';
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
import {
  getAttendances,
  deleteAttendance,
  type AttendanceFilters,
} from '../api/service';
import { AttendanceCheckDialog } from './attendance-check-dialog';
import { Icons } from '@/components/icons';

type AttendanceRecord = {
  id: string;
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  source: string;
  note: string | null;
  employee: { code: string; fullName: string };
};

function formatTime(d: Date | null) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('vi-VN');
}

function calcHours(checkIn: Date | null, checkOut: Date | null) {
  if (!checkIn || !checkOut) return '—';
  const hours = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 3600000;
  return `${Math.round(hours * 10) / 10}h`;
}

export function AttendanceListing() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isPending, startTransition] = useTransition();
  const [checkDialogOpen, setCheckDialogOpen] = useState(false);

  const limit = 20;

  function loadData(filters?: Partial<AttendanceFilters>) {
    startTransition(async () => {
      const result = await getAttendances({
        page: filters?.page ?? page,
        limit,
        month: filters?.month ?? month,
      });
      setRecords(result.records as AttendanceRecord[]);
      setTotal(result.total);
    });
  }

  useEffect(() => {
    loadData({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMonthChange(value: string) {
    setMonth(value);
    setPage(1);
    loadData({ page: 1, month: value });
  }

  function handleDelete(id: string) {
    if (!confirm('Xóa bản ghi chấm công này?')) return;
    startTransition(async () => {
      await deleteAttendance(id);
      loadData();
    });
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <Input
          type='month'
          value={month}
          onChange={(e) => handleMonthChange(e.target.value)}
          className='w-44'
        />
        <Button onClick={() => setCheckDialogOpen(true)}>
          <Icons.check className='mr-2 h-4 w-4' />
          Chấm công
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
              <TableHead>Mã NV</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Giờ vào</TableHead>
              <TableHead>Giờ ra</TableHead>
              <TableHead>Số giờ</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead className='w-[50px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-8 text-muted-foreground'>
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-8 text-muted-foreground'>
                  Chưa có bản ghi chấm công nào trong tháng này
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{formatDate(r.date)}</TableCell>
                  <TableCell className='font-mono text-sm'>{r.employee.code}</TableCell>
                  <TableCell className='font-medium'>{r.employee.fullName}</TableCell>
                  <TableCell>{formatTime(r.checkIn)}</TableCell>
                  <TableCell>{formatTime(r.checkOut)}</TableCell>
                  <TableCell>{calcHours(r.checkIn, r.checkOut)}</TableCell>
                  <TableCell className='text-sm text-muted-foreground'>{r.note ?? ''}</TableCell>
                  <TableCell>
                    <Button variant='ghost' size='icon' onClick={() => handleDelete(r.id)}>
                      <Icons.trash className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>Tổng {total} bản ghi</p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => { setPage(page - 1); loadData({ page: page - 1 }); }}
            >
              Trước
            </Button>
            <span className='flex items-center text-sm'>{page} / {totalPages}</span>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => { setPage(page + 1); loadData({ page: page + 1 }); }}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      <AttendanceCheckDialog
        open={checkDialogOpen}
        onOpenChange={setCheckDialogOpen}
        onSuccess={() => {
          setCheckDialogOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
