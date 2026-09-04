'use client';

import { useEffect, useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSession } from 'next-auth/react';
import { listUsers, updateUserRole, deleteUser, type UserListItem } from '../api/service';

type Role = 'ADMIN' | 'EDITOR' | 'MANAGER' | 'STAFF';

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Quản trị viên',
  EDITOR: 'Biên tập',
  MANAGER: 'Quản lý',
  STAFF: 'Nhân viên',
};

const ROLE_VARIANTS: Record<Role, 'default' | 'secondary' | 'outline'> = {
  ADMIN: 'default',
  EDITOR: 'secondary',
  MANAGER: 'secondary',
  STAFF: 'outline',
};

const dateFmt = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function UserListing() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const { data: session } = useSession();
  const meId = session?.user?.id;
  const meIsAdmin = session?.user?.role === 'ADMIN';

  function loadData(q?: string) {
    startTransition(async () => {
      const list = await listUsers(q || undefined);
      setUsers(list);
    });
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(v: string) {
    setSearch(v);
    loadData(v);
  }

  function handleRoleChange(user: UserListItem, newRole: Role) {
    if (user.role === newRole) return;
    setMessage(null);
    startTransition(async () => {
      const r = await updateUserRole(user.id, newRole);
      setMessage({ ok: r.ok, text: r.message });
      if (r.ok) loadData(search);
    });
  }

  function handleDelete(user: UserListItem) {
    if (!confirm(`Xoá user ${user.email}? Không thể hoàn tác.`)) return;
    setMessage(null);
    startTransition(async () => {
      const r = await deleteUser(user.id);
      setMessage({ ok: r.ok, text: r.message });
      if (r.ok) loadData(search);
    });
  }

  return (
    <div className='space-y-4'>
      {!meIsAdmin && (
        <div className='rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900'>
          Bạn không phải <strong>ADMIN</strong> — chỉ xem được danh sách, không đổi quyền hay xoá.
        </div>
      )}

      <div className='flex items-center gap-3'>
        <Input
          placeholder='Tìm theo email hoặc tên...'
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className='max-w-sm'
        />
        <p className='text-sm text-muted-foreground'>
          {users.length} tài khoản
        </p>
      </div>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className='rounded-md border overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Đăng nhập bằng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Đăng ký</TableHead>
              <TableHead className='w-[80px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='py-8 text-center text-muted-foreground'>
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='py-8 text-center text-muted-foreground'>
                  Chưa có tài khoản nào. Đăng nhập lần đầu (Google/email) sẽ tự tạo user.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const isMe = u.id === meId;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        {u.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.image}
                            alt={u.name ?? u.email}
                            className='h-8 w-8 rounded-full object-cover'
                          />
                        ) : (
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium'>
                            {(u.name ?? u.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className='font-medium flex items-center gap-2'>
                            {u.name ?? '—'}
                            {isMe && (
                              <Badge variant='outline' className='text-[10px]'>Bạn</Badge>
                            )}
                          </div>
                          <div className='text-xs text-muted-foreground'>{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {u.providers.map((p) => (
                          <Badge key={p} variant='secondary' className='capitalize'>
                            {p}
                          </Badge>
                        ))}
                        {u.hasPassword && (
                          <Badge variant='secondary'>Email/pass</Badge>
                        )}
                        {u.providers.length === 0 && !u.hasPassword && (
                          <span className='text-xs text-muted-foreground'>—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {meIsAdmin ? (
                        <Select
                          value={u.role}
                          onValueChange={(v) => handleRoleChange(u, v as Role)}
                          disabled={isPending}
                        >
                          <SelectTrigger className='w-[160px]'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='ADMIN'>Quản trị viên</SelectItem>
                            <SelectItem value='MANAGER'>Quản lý</SelectItem>
                            <SelectItem value='EDITOR'>Biên tập</SelectItem>
                            <SelectItem value='STAFF'>Nhân viên</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={ROLE_VARIANTS[u.role]}>
                          {ROLE_LABELS[u.role]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {dateFmt.format(new Date(u.createdAt))}
                    </TableCell>
                    <TableCell>
                      {meIsAdmin && !isMe && (
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDelete(u)}
                          title='Xoá tài khoản'
                          disabled={isPending}
                        >
                          <Icons.trash className='h-4 w-4' />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className='rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900'>
        <p className='font-medium'>Cách thêm người dùng mới</p>
        <ul className='mt-2 list-disc pl-5 space-y-1'>
          <li>
            Nhờ họ vào <strong>{typeof window !== 'undefined' ? window.location.origin : ''}/auth/sign-in</strong> → bấm <strong>Đăng nhập bằng Google</strong>
          </li>
          <li>Sau khi họ login lần đầu, tài khoản sẽ tự xuất hiện ở đây với role <strong>Nhân viên</strong></li>
          <li>Bạn (ADMIN) có thể chỉnh vai trò của họ qua cột <strong>Vai trò</strong></li>
        </ul>
      </div>
    </div>
  );
}
