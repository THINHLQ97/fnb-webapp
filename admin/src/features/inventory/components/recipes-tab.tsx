'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { RecipeWithItems } from '../api/types';
import { computeRecipeCostM } from '../api/cost-utils';

const priceFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

type Props = { recipes: RecipeWithItems[] };

export function RecipesTab({ recipes }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const byCategory = new Map<string, RecipeWithItems[]>();
  for (const r of recipes) {
    const key = r.category ?? 'Khác';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(r);
  }

  return (
    <div className='space-y-6'>
      {Array.from(byCategory.entries()).map(([cat, items]) => (
        <section key={cat}>
          <h3 className='mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
            {cat}
          </h3>
          <div className='space-y-2'>
            {items.map((r) => {
              const cost = computeRecipeCostM(r);
              const marginM = r.priceRegular - cost;
              const marginPctM = r.priceRegular > 0 ? (marginM / r.priceRegular) * 100 : 0;
              const isOpen = expanded === r.id;
              return (
                <div key={r.id} className='rounded-lg border'>
                  <div
                    className='flex cursor-pointer items-center justify-between gap-4 p-3'
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                  >
                    <div className='flex-1'>
                      <p className='font-medium'>{r.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {r.items.length} thành phần · size L nhân {r.sizeLargeFactor}x
                      </p>
                    </div>
                    <div className='text-right text-sm'>
                      <p className='text-muted-foreground'>
                        Giá M {priceFmt.format(r.priceRegular)} / L {priceFmt.format(r.priceLarge)}
                      </p>
                      <p className='text-muted-foreground'>
                        Cost M {priceFmt.format(cost)}
                      </p>
                    </div>
                    <div className='w-20 text-right'>
                      <Badge variant={marginPctM >= 60 ? 'default' : marginPctM >= 40 ? 'secondary' : 'destructive'}>
                        {marginPctM.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>

                  {isOpen && (
                    <div className='border-t bg-muted/30 p-3 text-sm'>
                      <table className='w-full'>
                        <thead>
                          <tr className='text-left text-xs text-muted-foreground'>
                            <th className='pb-1'>Thành phần</th>
                            <th className='pb-1'>Loại</th>
                            <th className='pb-1 text-right'>Số lượng M</th>
                            <th className='pb-1 text-right'>Cost M</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.items.map((it) => {
                            let name = '—';
                            let type = '';
                            let unit = '';
                            let itemCost = 0;
                            if (it.ingredient) {
                              name = it.ingredient.name;
                              type = 'Nguyên liệu';
                              unit = it.ingredient.unit;
                              itemCost = it.quantity * it.ingredient.costPerUnit;
                            } else if (it.basePrep) {
                              name = it.basePrep.name;
                              type = 'Nền pha';
                              unit = it.basePrep.yieldUnit;
                              const baseTotal = it.basePrep.ingredients.reduce(
                                (s, bi) => s + bi.quantity * bi.ingredient.costPerUnit,
                                0
                              );
                              itemCost = (baseTotal / it.basePrep.yieldQty) * it.quantity;
                            }
                            return (
                              <tr key={it.id} className='border-t'>
                                <td className='py-1.5'>{name}</td>
                                <td className='text-xs text-muted-foreground'>{type}</td>
                                <td className='text-right'>{it.quantity} {unit}</td>
                                <td className='text-right'>{priceFmt.format(Math.round(itemCost))}</td>
                              </tr>
                            );
                          })}
                          <tr className='border-t font-semibold'>
                            <td colSpan={3} className='py-2 text-right'>Tổng cost / ly M:</td>
                            <td className='text-right'>{priceFmt.format(cost)}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} className='text-right text-muted-foreground'>Lời / ly M:</td>
                            <td className={`text-right font-medium ${marginM >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {priceFmt.format(marginM)} ({marginPctM.toFixed(0)}%)
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
