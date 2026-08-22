'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { updateIngredient, addStock } from '../api/service';

type Ingredient = {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  alertLevel: number;
  costPerUnit: number;
  packagingNote: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  TRA: 'Trà',
  DUONG: 'Đường',
  SUA: 'Sữa',
  TOPPING: 'Topping',
  TRAI_CAY: 'Trái cây',
  SYRUP: 'Syrup',
  CACAO: 'Cacao',
  CA_PHE: 'Cà phê',
  BANH: 'Bánh',
  PHU_LIEU: 'Phụ liệu',
  BAO_BI: 'Bao bì',
  KHAC: 'Khác',
};

const numFmt = new Intl.NumberFormat('vi-VN');
const priceFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

export function IngredientsTab({ initial }: { initial: Ingredient[] }) {
  const [items, setItems] = useState(initial);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Record<string, { stock: string; costPerUnit: string; alertLevel: string }>>({});
  const [addingStock, setAddingStock] = useState<Record<string, { qty: string; cost: string }>>({});
  const [isPending, startTransition] = useTransition();

  const filtered = items.filter((i) =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  );

  function getEdit(i: Ingredient) {
    return editing[i.id] ?? {
      stock: String(i.stock),
      costPerUnit: String(i.costPerUnit),
      alertLevel: String(i.alertLevel),
    };
  }

  function setEdit(id: string, field: 'stock' | 'costPerUnit' | 'alertLevel', value: string) {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    const base = editing[id] ?? {
      stock: String(item.stock),
      costPerUnit: String(item.costPerUnit),
      alertLevel: String(item.alertLevel),
    };
    setEditing({
      ...editing,
      [id]: { ...base, [field]: value },
    });
  }

  function saveEdit(id: string) {
    const draft = editing[id];
    if (!draft) return;
    startTransition(async () => {
      const updated = await updateIngredient(id, {
        stock: parseFloat(draft.stock) || 0,
        costPerUnit: parseFloat(draft.costPerUnit) || 0,
        alertLevel: parseFloat(draft.alertLevel) || 0,
      });
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...updated } : x)));
      setEditing((e) => {
        const n = { ...e };
        delete n[id];
        return n;
      });
    });
  }

  function doAddStock(id: string) {
    const d = addingStock[id];
    if (!d || !d.qty) return;
    startTransition(async () => {
      await addStock(id, parseFloat(d.qty) || 0, parseFloat(d.cost) || 0, 'Nhập kho');
      setItems((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, stock: x.stock + (parseFloat(d.qty) || 0) } : x
        )
      );
      setAddingStock((s) => {
        const n = { ...s };
        delete n[id];
        return n;
      });
    });
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <Input
          placeholder='Tìm nguyên liệu...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='max-w-sm'
        />
        <p className='text-sm text-muted-foreground'>{filtered.length} / {items.length} nguyên liệu</p>
      </div>

      <div className='rounded-md border overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nguyên liệu</TableHead>
              <TableHead>Nhóm</TableHead>
              <TableHead>Đơn vị</TableHead>
              <TableHead className='text-right'>Tồn kho</TableHead>
              <TableHead className='text-right'>Ngưỡng cảnh báo</TableHead>
              <TableHead className='text-right'>Giá / đv</TableHead>
              <TableHead>Nhập thêm</TableHead>
              <TableHead className='w-[80px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((i) => {
              const draft = getEdit(i);
              const isEditing = !!editing[i.id];
              const belowAlert = i.stock <= i.alertLevel && i.alertLevel > 0;
              const add = addingStock[i.id];

              return (
                <TableRow key={i.id} className={belowAlert ? 'bg-red-50/40' : ''}>
                  <TableCell>
                    <div className='font-medium'>{i.name}</div>
                    {i.packagingNote && (
                      <div className='text-xs text-muted-foreground'>{i.packagingNote}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{CATEGORY_LABELS[i.category] ?? i.category}</Badge>
                  </TableCell>
                  <TableCell className='text-sm text-muted-foreground'>{i.unit}</TableCell>
                  <TableCell className='text-right'>
                    <Input
                      type='number'
                      className='w-24 ml-auto text-right'
                      value={draft.stock}
                      onChange={(e) => setEdit(i.id, 'stock', e.target.value)}
                    />
                    {belowAlert && (
                      <Badge variant='destructive' className='mt-1'>Sắp hết</Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    <Input
                      type='number'
                      className='w-20 ml-auto text-right'
                      value={draft.alertLevel}
                      onChange={(e) => setEdit(i.id, 'alertLevel', e.target.value)}
                    />
                  </TableCell>
                  <TableCell className='text-right'>
                    <Input
                      type='number'
                      className='w-24 ml-auto text-right'
                      value={draft.costPerUnit}
                      onChange={(e) => setEdit(i.id, 'costPerUnit', e.target.value)}
                    />
                    <div className='text-xs text-muted-foreground mt-0.5'>
                      = {priceFmt.format(i.costPerUnit * i.stock)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      <Input
                        type='number'
                        placeholder='SL'
                        className='w-20'
                        value={add?.qty ?? ''}
                        onChange={(e) =>
                          setAddingStock({
                            ...addingStock,
                            [i.id]: { qty: e.target.value, cost: add?.cost ?? '' },
                          })
                        }
                      />
                      <Input
                        type='number'
                        placeholder='Giá'
                        className='w-24'
                        value={add?.cost ?? ''}
                        onChange={(e) =>
                          setAddingStock({
                            ...addingStock,
                            [i.id]: { qty: add?.qty ?? '', cost: e.target.value },
                          })
                        }
                      />
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={!add?.qty || isPending}
                        onClick={() => doAddStock(i.id)}
                      >
                        <Icons.add className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isEditing && (
                      <Button size='sm' onClick={() => saveEdit(i.id)} disabled={isPending}>
                        Lưu
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className='text-xs text-muted-foreground'>
        Sửa trực tiếp trên bảng — bấm <strong>Lưu</strong> khi xong. Nhập kho: điền số lượng + tổng
        tiền → bấm <Icons.add className='inline h-3 w-3' />. Tồn kho tổng:{' '}
        <strong>{priceFmt.format(items.reduce((s, i) => s + i.stock * i.costPerUnit, 0))}</strong>.
      </p>
    </div>
  );
}
