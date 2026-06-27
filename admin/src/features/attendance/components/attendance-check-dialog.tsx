'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { checkIn, checkOut } from '../api/service';
import { getEmployees } from '@/features/employees/api/service';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type Employee = { id: string; code: string; fullName: string };

export function AttendanceCheckDialog({ open, onOpenChange, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [action, setAction] = useState<'in' | 'out'>('in');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      startTransition(async () => {
        const result = await getEmployees({ limit: 100, active: true });
        setEmployees(
          result.employees.map((e) => ({ id: e.id, code: e.code, fullName: e.fullName }))
        );
      });
      setEmployeeId('');
      setNote('');
      setAction('in');
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId) return;
    startTransition(async () => {
      if (action === 'in') {
        await checkIn(employeeId, note || undefined);
      } else {
        await checkOut(employeeId, note || undefined);
      }
      onSuccess();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Chấm công</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label>Nhân viên</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder='Chọn nhân viên' />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.code} — {emp.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Loại</Label>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant={action === 'in' ? 'default' : 'outline'}
                onClick={() => setAction('in')}
                className='flex-1'
              >
                Giờ vào
              </Button>
              <Button
                type='button'
                variant={action === 'out' ? 'default' : 'outline'}
                onClick={() => setAction('out')}
                className='flex-1'
              >
                Giờ ra
              </Button>
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='note'>Ghi chú</Label>
            <Input
              id='note'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='Tùy chọn'
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type='submit' isLoading={isPending} disabled={!employeeId}>
              Chấm công
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
