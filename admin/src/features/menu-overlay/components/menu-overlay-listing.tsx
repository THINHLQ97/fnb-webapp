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
import { OverlayEditDialog } from './overlay-edit-dialog';
import type { MenuOverlayItem } from '../api/service';

type Props = {
  initialItems: MenuOverlayItem[];
  initialError?: string;
};

const priceFmt = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function MenuOverlayListing({ initialItems, initialError }: Props) {
  const [items, setItems] = useState<MenuOverlayItem[]>(initialItems);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuOverlayItem | null>(null);
  const [, startTransition] = useTransition();

  function handleEdit(item: MenuOverlayItem) {
    setEditing(item);
    setDialogOpen(true);
  }

  function handleSaved(kiotvietId: number, newOverride: MenuOverlayItem['override']) {
    setItems((prev) =>
      prev.map((it) => (it.kiotvietId === kiotvietId ? { ...it, override: newOverride } : it))
    );
  }

  const filtered = items.filter((it) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return it.name.toLowerCase().includes(q) || it.code.toLowerCase().includes(q);
  });

  if (initialError) {
    return (
      <div className='rounded-md border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900'>
        <p className='font-medium'>Chưa lấy được sản phẩm từ KiotViet.</p>
        <p className='mt-1 text-amber-800'>{initialError}</p>
        <p className='mt-3 text-xs text-amber-800'>
          Kiểm tra biến môi trường KIOTVIET_CLIENT_ID, KIOTVIET_CLIENT_SECRET, KIOTVIET_RETAILER,
          KIOTVIET_BASE_URL trên Vibe Hosting rồi rebuild.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Input
          placeholder='Tìm theo tên hoặc mã...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='max-w-sm'
        />
        <p className='text-sm text-muted-foreground'>
          {filtered.length} / {items.length} sản phẩm
        </p>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ảnh</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Overlay</TableHead>
              <TableHead className='w-[80px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                  Không có sản phẩm nào khớp.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((it) => {
                const image = it.override.customImage ?? it.kiotvietImage;
                return (
                  <TableRow key={it.kiotvietId}>
                    <TableCell>
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={it.name} className='h-10 w-10 rounded object-cover' />
                      ) : (
                        <div className='h-10 w-10 rounded bg-muted' />
                      )}
                    </TableCell>
                    <TableCell className='font-mono text-xs'>{it.code}</TableCell>
                    <TableCell className='font-medium max-w-xs truncate' title={it.name}>
                      {it.name}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>{it.categoryName}</TableCell>
                    <TableCell>{priceFmt.format(it.price)}</TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {it.override.featured && <Badge>Ghim đầu</Badge>}
                        {it.override.highlight && <Badge variant='secondary'>Best seller</Badge>}
                        {it.override.tag && <Badge variant='outline'>{it.override.tag}</Badge>}
                        {!it.override.featured && !it.override.highlight && !it.override.tag && (
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <OverlayEditDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        item={editing}
        onSuccess={(kiotvietId, override) => {
          startTransition(() => {
            handleSaved(kiotvietId, override);
            setDialogOpen(false);
            setEditing(null);
          });
        }}
      />
    </div>
  );
}
