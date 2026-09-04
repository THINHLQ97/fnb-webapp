'use client';

import { useState, useTransition, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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

const numFmt = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const priceFmt = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function IngredientsTab({ initial }: { initial: Ingredient[] }) {
  const [items, setItems] = useState(initial);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [addStockFor, setAddStockFor] = useState<Ingredient | null>(null);
  const [editFor, setEditFor] = useState<Ingredient | null>(null);

  const categories = Array.from(new Set(items.map((i) => i.category)));

  const filtered = items.filter((i) => {
    if (category !== 'ALL' && i.category !== category) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const alertCount = items.filter((i) => i.alertLevel > 0 && i.stock <= i.alertLevel).length;
  const totalValue = items.reduce((s, i) => s + i.stock * i.costPerUnit, 0);

  return (
    <div className='space-y-4'>
      {/* Summary bar */}
      <div className='grid gap-3 sm:grid-cols-3'>
        <StatCard label='Tổng nguyên liệu' value={String(items.length)} />
        <StatCard
          label='Giá trị tồn kho'
          value={priceFmt.format(totalValue)}
          hint='Σ (tồn × giá vốn)'
        />
        <StatCard
          label='Sắp hết'
          value={String(alertCount)}
          tone={alertCount > 0 ? 'warn' : 'ok'}
          hint='dưới ngưỡng cảnh báo'
        />
      </div>

      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-2'>
        <Input
          placeholder='Tìm nguyên liệu...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='max-w-xs'
        />
        <div className='flex flex-wrap gap-1'>
          <button
            type='button'
            onClick={() => setCategory('ALL')}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              category === 'ALL'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input hover:bg-accent'
            }`}
          >
            Tất cả ({items.length})
          </button>
          {categories.map((c) => {
            const count = items.filter((i) => i.category === c).length;
            return (
              <button
                key={c}
                type='button'
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  category === c
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input hover:bg-accent'
                }`}
              >
                {CATEGORY_LABELS[c] ?? c} ({count})
              </button>
            );
          })}
        </div>
        <p className='ml-auto text-sm text-muted-foreground'>
          Hiển thị {filtered.length} / {items.length}
        </p>
      </div>

      {/* Table */}
      <div className='rounded-md border overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nguyên liệu</TableHead>
              <TableHead>Nhóm</TableHead>
              <TableHead className='text-right'>Tồn kho</TableHead>
              <TableHead className='text-right'>Giá vốn</TableHead>
              <TableHead className='text-right'>Giá trị tồn</TableHead>
              <TableHead className='w-[180px] text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                  Không có nguyên liệu nào
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((i) => {
                const belowAlert = i.alertLevel > 0 && i.stock <= i.alertLevel;
                return (
                  <TableRow key={i.id} className={belowAlert ? 'bg-red-50/40' : ''}>
                    <TableCell>
                      <div className='font-medium'>{i.name}</div>
                      {i.packagingNote && (
                        <div className='text-xs text-muted-foreground line-clamp-1' title={i.packagingNote}>
                          {i.packagingNote}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{CATEGORY_LABELS[i.category] ?? i.category}</Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='font-mono'>
                        {numFmt.format(i.stock)} <span className='text-xs text-muted-foreground'>{i.unit}</span>
                      </div>
                      {belowAlert && (
                        <Badge variant='destructive' className='mt-1 text-[10px]'>
                          Dưới ngưỡng {numFmt.format(i.alertLevel)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-right font-mono text-sm'>
                      {priceFmt.format(i.costPerUnit)}
                      <div className='text-xs text-muted-foreground'>/ {i.unit}</div>
                    </TableCell>
                    <TableCell className='text-right font-mono text-sm'>
                      {priceFmt.format(i.stock * i.costPerUnit)}
                    </TableCell>
                    <TableCell>
                      <div className='flex justify-end gap-1'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => setAddStockFor(i)}
                          title='Nhập kho'
                        >
                          <Icons.add className='mr-1 h-3 w-3' />
                          Nhập
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => setEditFor(i)}
                          title='Sửa thông tin'
                        >
                          <Icons.settings className='h-3 w-3' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AddStockDialog
        ingredient={addStockFor}
        onClose={() => setAddStockFor(null)}
        onDone={(updated) => {
          setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
          setAddStockFor(null);
        }}
      />

      <EditIngredientDialog
        ingredient={editFor}
        onClose={() => setEditFor(null)}
        onDone={(updated) => {
          setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
          setEditFor(null);
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'ok' | 'warn';
}) {
  return (
    <div className='rounded-lg border p-4'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          tone === 'warn' ? 'text-amber-600' : ''
        }`}
      >
        {value}
      </p>
      {hint && <p className='text-xs text-muted-foreground'>{hint}</p>}
    </div>
  );
}

// =============================================================================
// DIALOG: NHẬP KHO
// =============================================================================
function AddStockDialog({
  ingredient,
  onClose,
  onDone,
}: {
  ingredient: Ingredient | null;
  onClose: () => void;
  onDone: (updated: Ingredient) => void;
}) {
  const [qty, setQty] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [note, setNote] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ingredient) {
      setQty('');
      setTotalCost('');
      setNote('');
      setError(null);
    }
  }, [ingredient]);

  if (!ingredient) return null;

  const qtyNum = parseFloat(qty) || 0;
  const totalNum = parseFloat(totalCost) || 0;
  const unitCost = qtyNum > 0 ? totalNum / qtyNum : 0;
  const newStock = ingredient.stock + qtyNum;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (qtyNum <= 0) {
      setError('Số lượng phải > 0');
      return;
    }
    startTransition(async () => {
      try {
        await addStock(ingredient!.id, qtyNum, totalNum, note || 'Nhập kho');
        onDone({ ...ingredient!, stock: newStock });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi nhập kho');
      }
    });
  }

  return (
    <Dialog open={!!ingredient} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Nhập kho: {ingredient.name}</DialogTitle>
          <DialogDescription>
            Ghi nhận lô nhập mới. Tồn kho sẽ được cộng thêm, lịch sử lưu trong StockMovement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='rounded-md bg-muted/40 p-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Tồn hiện tại</span>
              <span className='font-mono'>{numFmt.format(ingredient.stock)} {ingredient.unit}</span>
            </div>
            <div className='flex justify-between mt-1'>
              <span className='text-muted-foreground'>Giá vốn hiện tại</span>
              <span className='font-mono'>{priceFmt.format(ingredient.costPerUnit)} / {ingredient.unit}</span>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='qty'>
              Số lượng nhập <span className='text-muted-foreground'>({ingredient.unit})</span>
            </Label>
            <Input
              id='qty'
              type='number'
              step='any'
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder={`VD: 1000 (${ingredient.unit})`}
              required
              autoFocus
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='total'>Tổng tiền lô này (đ)</Label>
            <Input
              id='total'
              type='number'
              step='any'
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              placeholder='VD: 235000'
            />
            {qtyNum > 0 && totalNum > 0 && (
              <p className='text-xs text-muted-foreground'>
                → Giá / {ingredient.unit}: <strong className='font-mono'>{priceFmt.format(unitCost)}</strong>
                {' '}(hiện tại {priceFmt.format(ingredient.costPerUnit)})
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='note'>Ghi chú (tùy chọn)</Label>
            <Input
              id='note'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='VD: HĐ WAO ngày 04/09'
            />
          </div>

          <div className='rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900'>
            Sau khi nhập: <strong>{numFmt.format(newStock)} {ingredient.unit}</strong> trong kho
          </div>

          {error && <p className='text-sm text-destructive'>{error}</p>}

          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              Hủy
            </Button>
            <Button type='submit' isLoading={isPending} disabled={qtyNum <= 0}>
              Xác nhận nhập
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// DIALOG: SỬA THÔNG TIN NGUYÊN LIỆU
// =============================================================================
function EditIngredientDialog({
  ingredient,
  onClose,
  onDone,
}: {
  ingredient: Ingredient | null;
  onClose: () => void;
  onDone: (updated: Ingredient) => void;
}) {
  const [costPerUnit, setCostPerUnit] = useState('');
  const [alertLevel, setAlertLevel] = useState('');
  const [adjustStock, setAdjustStock] = useState(false);
  const [stock, setStock] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ingredient) {
      setCostPerUnit(String(ingredient.costPerUnit));
      setAlertLevel(String(ingredient.alertLevel));
      setStock(String(ingredient.stock));
      setAdjustStock(false);
      setError(null);
    }
  }, [ingredient]);

  if (!ingredient) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const payload: {
          costPerUnit: number;
          alertLevel: number;
          stock?: number;
        } = {
          costPerUnit: parseFloat(costPerUnit) || 0,
          alertLevel: parseFloat(alertLevel) || 0,
        };
        if (adjustStock) payload.stock = parseFloat(stock) || 0;
        const updated = await updateIngredient(ingredient!.id, payload);
        onDone({ ...ingredient!, ...updated });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi cập nhật');
      }
    });
  }

  return (
    <Dialog open={!!ingredient} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Sửa: {ingredient.name}</DialogTitle>
          <DialogDescription>
            Chỉnh giá vốn và ngưỡng cảnh báo. Muốn cộng thêm tồn kho từ hóa đơn mới, hãy dùng nút <strong>Nhập</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='rounded-md bg-muted/40 p-3 text-sm space-y-1'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Nhóm</span>
              <span>{CATEGORY_LABELS[ingredient.category] ?? ingredient.category}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Đơn vị nội bộ</span>
              <span className='font-mono'>{ingredient.unit}</span>
            </div>
            {ingredient.packagingNote && (
              <div className='text-xs text-muted-foreground pt-1 border-t'>
                {ingredient.packagingNote}
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='cost'>
              Giá vốn (đ / {ingredient.unit})
            </Label>
            <Input
              id='cost'
              type='number'
              step='any'
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(e.target.value)}
              required
            />
            <p className='text-xs text-muted-foreground'>
              VD: 1kg nhập 235.000đ → giá / g = 235
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='alert'>
              Ngưỡng cảnh báo <span className='text-muted-foreground'>({ingredient.unit})</span>
            </Label>
            <Input
              id='alert'
              type='number'
              step='any'
              value={alertLevel}
              onChange={(e) => setAlertLevel(e.target.value)}
            />
            <p className='text-xs text-muted-foreground'>
              Khi tồn ≤ ngưỡng này → hiện cảnh báo đỏ. Đặt 0 để tắt cảnh báo.
            </p>
          </div>

          <div className='space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={adjustStock}
                onChange={(e) => setAdjustStock(e.target.checked)}
              />
              <span className='text-sm font-medium text-amber-900'>
                Điều chỉnh tồn kho thủ công
              </span>
            </label>
            {adjustStock && (
              <>
                <Input
                  type='number'
                  step='any'
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
                <p className='text-xs text-amber-800'>
                  ⚠️ Chỉ dùng khi kiểm kê phát hiện sai lệch. Nhập kho từ hóa đơn hãy dùng nút{' '}
                  <strong>Nhập</strong> để có lịch sử.
                </p>
              </>
            )}
          </div>

          {error && <p className='text-sm text-destructive'>{error}</p>}

          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              Hủy
            </Button>
            <Button type='submit' isLoading={isPending}>
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
