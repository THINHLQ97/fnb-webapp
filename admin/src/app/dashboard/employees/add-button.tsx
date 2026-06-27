'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { EmployeeFormDialog } from '@/features/employees/components/employee-form-dialog';

export function AddEmployeeButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icons.add className='mr-2 h-4 w-4' />
        Thêm nhân viên
      </Button>
      <EmployeeFormDialog
        open={open}
        onOpenChange={setOpen}
        employee={null}
        onSuccess={() => {
          setOpen(false);
          window.location.reload();
        }}
      />
    </>
  );
}
