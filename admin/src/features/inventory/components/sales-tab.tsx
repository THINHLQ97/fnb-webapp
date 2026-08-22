'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getDailySales, upsertDailySale, closeDay, isDayClosed } from '../api/service';

const priceFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

type Recipe = {
  id: string;
  name: string;
  category: string | null;
  priceRegular: number;
  priceLarge: number;
};

type SaleRow = {
  recipeId: string;
  countRegular: number;
  countLarge: number;
  countPromo: number;
};

type CloseResult = {
  ok: boolean;
  message: string;
  totalRevenue?: number;
  totalCost?: number;
  netProfit?: number;
  itemsSold?: number;
};

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function SalesTab({ recipes }: { recipes: Recipe[] }) {
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState<Record<string, SaleRow>>({});
  const [closed, setClosed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [closeResult, setCloseResult] = useState<CloseResult | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      const d = new Date(date);
      const [sales, isClosed] = await Promise.all([getDailySales(d), isDayClosed(d)]);
      const map: Record<string, SaleRow> = {};
      for (const s of sales) {
        map[s.recipeId] = {
          recipeId: s.recipeId,
          countRegular: s.countRegular,
          countLarge: s.countLarge,
          countPromo: s.countPromo,
        };
      }
      setRows(map);
      setClosed(isClosed);
      setCloseResult(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function updateRow(recipeId: string, field: 'countRegular' | 'countLarge' | 'countPromo', value: string) {
    const n = parseInt(value, 10);
    setRows((prev) => ({
      ...prev,
      [recipeId]: {
        recipeId,
        countRegular: field === 'countRegular' ? (n || 0) : prev[recipeId]?.countRegular ?? 0,
        countLarge: field === 'countLarge' ? (n || 0) : prev[recipeId]?.countLarge ?? 0,
        countPromo: field === 'countPromo' ? (n || 0) : prev[recipeId]?.countPromo ?? 0,
      },
    }));
  }

  function saveAll() {
    setSaveMsg(null);
    startTransition(async () => {
      const d = new Date(date);
      const toSave = Object.values(rows).filter(
        (r) => r.countRegular > 0 || r.countLarge > 0 || r.countPromo > 0
      );
      for (const r of toSave) {
        await upsertDailySale(d, r.recipeId, {
          countRegular: r.countRegular,
          countLarge: r.countLarge,
          countPromo: r.countPromo,
        });
      }
      setSaveMsg(`Đã lưu ${toSave.length} món.`);
    });
  }

  function doClose() {
    if (!confirm(`Chốt sổ ngày ${date}? Sau khi chốt sẽ trừ tồn kho và không sửa được nữa.`)) return;
    setCloseResult(null);
    startTransition(async () => {
      const d = new Date(date);
      const result = await closeDay(d);
      setCloseResult(result);
      if (result.ok) setClosed(true);
    });
  }

  const totalRegular = Object.values(rows).reduce((s, r) => s + r.countRegular, 0);
  const totalLarge = Object.values(rows).reduce((s, r) => s + r.countLarge, 0);
  const totalPromo = Object.values(rows).reduce((s, r) => s + r.countPromo, 0);
  const revenue = Object.values(rows).reduce((s, r) => {
    const rec = recipes.find((x) => x.id === r.recipeId);
    if (!rec) return s;
    return s + r.countRegular * rec.priceRegular + r.countLarge * rec.priceLarge;
  }, 0);

  const byCategory = new Map<string, Recipe[]>();
  for (const r of recipes) {
    const key = r.category ?? 'Khác';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(r);
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-3 rounded-lg border p-4 bg-muted/30'>
        <div>
          <label className='text-sm font-medium'>Ngày</label>
          <Input
            type='date'
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className='w-40 mt-1'
            disabled={isPending}
          />
        </div>
        <div className='flex-1 text-right'>
          {closed ? (
            <Badge variant='destructive'>Đã chốt sổ</Badge>
          ) : (
            <Badge variant='secondary'>Đang mở</Badge>
          )}
          <div className='mt-1 text-sm text-muted-foreground'>
            {totalRegular} ly M + {totalLarge} ly L + {totalPromo} promo = <strong>{totalRegular + totalLarge + totalPromo}</strong> ly ·{' '}
            Doanh thu ước <strong>{priceFmt.format(revenue)}</strong>
          </div>
        </div>
      </div>

      {closed && closeResult && (
        <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
          <p className='font-semibold text-green-900'>Đã chốt sổ ngày {date}</p>
          <div className='mt-2 grid grid-cols-4 gap-3 text-sm'>
            <div><span className='text-green-700'>Doanh thu:</span> <strong>{priceFmt.format(closeResult.totalRevenue ?? 0)}</strong></div>
            <div><span className='text-green-700'>Cost NL:</span> <strong>{priceFmt.format(closeResult.totalCost ?? 0)}</strong></div>
            <div><span className='text-green-700'>Lợi nhuận:</span> <strong>{priceFmt.format(closeResult.netProfit ?? 0)}</strong></div>
            <div><span className='text-green-700'>Số ly:</span> <strong>{closeResult.itemsSold}</strong></div>
          </div>
        </div>
      )}

      {closeResult && !closeResult.ok && (
        <p className='rounded bg-red-50 p-3 text-sm text-red-700'>{closeResult.message}</p>
      )}

      {!closed && (
        <div className='space-y-4'>
          {Array.from(byCategory.entries()).map(([cat, items]) => (
            <section key={cat}>
              <h3 className='mb-2 text-sm font-semibold text-muted-foreground uppercase'>{cat}</h3>
              <div className='rounded-md border divide-y'>
                {items.map((r) => {
                  const row = rows[r.id] ?? { recipeId: r.id, countRegular: 0, countLarge: 0, countPromo: 0 };
                  return (
                    <div key={r.id} className='flex items-center gap-3 p-2.5'>
                      <div className='flex-1'>
                        <p className='font-medium'>{r.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          M {priceFmt.format(r.priceRegular)} · L {priceFmt.format(r.priceLarge)}
                        </p>
                      </div>
                      <label className='flex items-center gap-1 text-sm'>
                        <span className='text-xs text-muted-foreground'>M</span>
                        <Input
                          type='number'
                          className='w-16 text-right'
                          value={row.countRegular || ''}
                          placeholder='0'
                          onChange={(e) => updateRow(r.id, 'countRegular', e.target.value)}
                          disabled={isPending}
                        />
                      </label>
                      <label className='flex items-center gap-1 text-sm'>
                        <span className='text-xs text-muted-foreground'>L</span>
                        <Input
                          type='number'
                          className='w-16 text-right'
                          value={row.countLarge || ''}
                          placeholder='0'
                          onChange={(e) => updateRow(r.id, 'countLarge', e.target.value)}
                          disabled={isPending}
                        />
                      </label>
                      <label className='flex items-center gap-1 text-sm'>
                        <span className='text-xs text-muted-foreground'>Promo</span>
                        <Input
                          type='number'
                          className='w-14 text-right'
                          value={row.countPromo || ''}
                          placeholder='0'
                          onChange={(e) => updateRow(r.id, 'countPromo', e.target.value)}
                          disabled={isPending}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <div className='sticky bottom-4 flex items-center justify-between gap-3 rounded-lg border bg-background p-3 shadow-md'>
            <div className='text-sm'>
              {saveMsg && <span className='text-green-700'>{saveMsg}</span>}
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={saveAll} disabled={isPending}>
                Lưu tạm
              </Button>
              <Button onClick={doClose} disabled={isPending || totalRegular + totalLarge + totalPromo === 0}>
                Chốt sổ ngày
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
