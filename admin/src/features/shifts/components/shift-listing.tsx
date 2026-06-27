'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { getShifts, createShift, updateShift, deleteShift } from '../api/service';

type Shift = { id: string; name: string; startTime: string; endTime: string };

export function ShiftListing() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  function loadData() {
    startTransition(async () => {
      const data = await getShifts();
      setShifts(data);
    });
  }

  useEffect(() => { loadData(); }, []);

  function openCreate() {
    setEditing(null);
    setName('');
    setStartTime('');
    setEndTime('');
    setDialogOpen(true);
  }

  function openEdit(s: Shift) {
    setEditing(s);
    setName(s.name);
    setStartTime(s.startTime);
    setEndTime(s.endTime);
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (editing) {
        await updateShift(editing.id, { name, startTime, endTime });
      } else {
        await createShift({ name, startTime, endTime });
      }
      setDialogOpen(false);
      loadData();
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Xóa ca làm này?')) return;
    startTransition(async () => {
      await deleteShift(id);
      loadData();
    });
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Button onClick={openCreate}>
          <Icons.add className='mr-2 h-4 w-4' />
          Thêm ca làm
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên ca</TableHead>
              <TableHead>Giờ bắt đầu</TableHead>
              <TableHead>Giờ kết thúc</TableHead>
              <TableHead className='w-[80px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center py-8 text-muted-foreground'>
                  {isPending ? 'Đang tải...' : 'Chưa có ca làm nào'}
                </TableCell>
              </TableRow>
            ) : (
              shifts.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className='font-medium'>{s.name}</TableCell>
                  <TableCell>{s.startTime}</TableCell>
                  <TableCell>{s.endTime}</TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      <Button variant='ghost' size='icon' onClick={() => openEdit(s)}>
                        <Icons.settings className='h-4 w-4' />
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => handleDelete(s.id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa ca làm' : 'Thêm ca làm'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='shiftName'>Tên ca</Label>
              <Input
                id='shiftName'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder='VD: Ca sáng'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='startTime'>Giờ bắt đầu</Label>
                <Input
                  id='startTime'
                  type='time'
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='endTime'>Giờ kết thúc</Label>
                <Input
                  id='endTime'
                  type='time'
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => setDialogOpen(false)}>
                Hủy
              </Button>
              <Button type='submit' isLoading={isPending}>
                {editing ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
