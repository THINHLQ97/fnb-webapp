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
import {
  createEmployee,
  updateEmployee,
  getDepartments,
} from '../api/service';

type Employee = {
  id: string;
  code: string;
  fullName: string;
  phone: string | null;
  position: string | null;
  active: boolean;
  department: { id: string; name: string } | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSuccess: () => void;
};

export function EmployeeFormDialog({ open, onOpenChange, employee, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (open) {
      startTransition(async () => {
        const deps = await getDepartments();
        setDepartments(deps);
      });
    }
  }, [open]);

  useEffect(() => {
    if (employee) {
      setCode(employee.code);
      setFullName(employee.fullName);
      setPhone(employee.phone ?? '');
      setPosition(employee.position ?? '');
      setDepartmentId(employee.department?.id ?? '');
      setActive(employee.active);
    } else {
      setCode('');
      setFullName('');
      setPhone('');
      setPosition('');
      setDepartmentId('');
      setActive(true);
    }
  }, [employee, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (employee) {
        await updateEmployee(employee.id, {
          fullName,
          phone: phone || undefined,
          position: position || undefined,
          departmentId: departmentId || null,
          active,
        });
      } else {
        await createEmployee({
          code,
          fullName,
          phone: phone || undefined,
          position: position || undefined,
          departmentId: departmentId || undefined,
        });
      }
      onSuccess();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{employee ? 'Sửa nhân viên' : 'Thêm nhân viên'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='code'>Mã NV</Label>
            <Input
              id='code'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!!employee}
              required
              placeholder='VD: NV001'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='fullName'>Họ tên</Label>
            <Input
              id='fullName'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='phone'>SĐT</Label>
              <Input
                id='phone'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='position'>Chức vụ</Label>
              <Input
                id='position'
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label>Phòng ban</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue placeholder='Chọn phòng ban' />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {employee && (
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='active'
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <Label htmlFor='active'>Đang làm việc</Label>
            </div>
          )}
          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type='submit' isLoading={isPending}>
              {employee ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
