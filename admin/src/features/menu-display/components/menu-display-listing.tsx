'use client';

import { useState, useTransition } from 'react';
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
import { MenuDisplayDialog } from './menu-display-dialog';
import type { MenuDisplayItem } from '../api/service';

type Props = {
  initialItems: MenuDisplayItem[];
  initialError?: string;
};

const priceFmt = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function MenuDisplayListing({ initialItems, initialError }: Props) {
  const [items, setItems] = useState<MenuDisplayItem[]>(initialItems);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuDisplayItem | null>(null);
  const [, startTransition] = useTransition();

  function handleEdit(item: MenuDisplayItem) {
    setEditing(item);
    setDialogOpen(true);
  }

  function handleSaved(id: string, patch: Partial<MenuDisplayItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  const filtered = items.filter((it) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return it.name.toLowerCase().includes(q) || it.category.toLowerCase().includes(q);
  });

  if (initialError) {
    return (
      <div className='rounded-md border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900'>
        <p className='font-medium'>Chưa lấy được danh sách món.</p>
        <p className='mt-1 text-amber-800'>{initialError}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground'>
        <p className='font-medium text-foreground'>Chưa có món nào trên menu.</p>
        <p className='mt-1'>
          Món trên menu lấy từ công thức trong{' '}
          <a href='/dashboard/kho-hang' className='underline'>
            Kho hàng → Công thức
          </a>
          . Thêm công thức trước, rồi quay lại đây để trình bày.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Input
          placeholder='Tìm theo tên món hoặc danh mục...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='max-w-sm'
        />
        <p className='text-sm text-muted-foreground'>
          {filtered.length} / {items.length} món
        </p>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ảnh</TableHead>
              <TableHead>Tên món</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá M</TableHead>
              <TableHead>Giá L</TableHead>
              <TableHead>Trình bày</TableHead>
              <TableHead className='w-[80px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                  Không có món nào khớp.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((it) => (
                <TableRow key={it.id} className={it.active ? undefined : 'opacity-50'}>
                  <TableCell>
                    {it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image} alt={it.name} className='h-10 w-10 rounded object-cover' />
                    ) : (
                      <div className='h-10 w-10 rounded bg-muted' />
                    )}
                  </TableCell>
                  <TableCell className='font-medium max-w-xs truncate' title={it.name}>
                    {it.name}
                    {!it.active && (
                      <span className='ml-2 text-xs text-muted-foreground'>(ngừng bán)</span>
                    )}
                  </TableCell>
                  <TableCell className='text-sm text-muted-foreground'>{it.category}</TableCell>
                  <TableCell>{priceFmt.format(it.priceRegular)}</TableCell>
                  <TableCell>{priceFmt.format(it.priceLarge)}</TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {it.featured && <Badge>Ghim đầu</Badge>}
                      {it.highlight && <Badge variant='secondary'>Best seller</Badge>}
                      {it.tag && <Badge variant='outline'>{it.tag}</Badge>}
                      {!it.featured && !it.highlight && !it.tag && (
                        <span className='text-xs text-muted-foreground'>—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant='ghost' size='icon' onClick={() => handleEdit(it)}>
                      <Icons.settings className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MenuDisplayDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        item={editing}
        onSuccess={(id, patch) => {
          startTransition(() => {
            handleSaved(id, patch);
            setDialogOpen(false);
            setEditing(null);
          });
        }}
      />
    </div>
  );
}
