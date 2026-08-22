'use client';

import { Badge } from '@/components/ui/badge';

const priceFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

type Close = {
  id: string;
  date: Date;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  itemsSold: number;
};

export function ReportsTab({ closes }: { closes: Close[] }) {
  if (closes.length === 0) {
    return (
      <div className='rounded-md border border-dashed p-8 text-center text-muted-foreground'>
        Chưa có ngày nào được chốt sổ. Vào tab <strong>Bán trong ngày</strong> để nhập và chốt.
      </div>
    );
  }

  const totalRev = closes.reduce((s, c) => s + c.totalRevenue, 0);
  const totalCost = closes.reduce((s, c) => s + c.totalCost, 0);
  const totalProfit = totalRev - totalCost;
  const totalItems = closes.reduce((s, c) => s + c.itemsSold, 0);
  const avgMargin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;

  return (
    <div className='space-y-4'>
      <div className='grid gap-3 md:grid-cols-4'>
        <StatCard label={`Doanh thu ${closes.length} ngày`} value={priceFmt.format(totalRev)} />
        <StatCard label='Cost nguyên liệu' value={priceFmt.format(totalCost)} />
        <StatCard
          label='Lợi nhuận'
          value={priceFmt.format(totalProfit)}
          hint={`${avgMargin.toFixed(1)}% margin TB`}
          positive={totalProfit >= 0}
        />
        <StatCard label='Ly bán ra' value={String(totalItems)} />
      </div>

      <div className='rounded-md border'>
        <table className='w-full'>
          <thead>
            <tr className='border-b bg-muted/40 text-left text-sm'>
              <th className='p-2'>Ngày</th>
              <th className='p-2 text-right'>Doanh thu</th>
              <th className='p-2 text-right'>Cost NL</th>
              <th className='p-2 text-right'>Lợi nhuận</th>
              <th className='p-2 text-right'>Margin</th>
              <th className='p-2 text-right'>Số ly</th>
            </tr>
          </thead>
          <tbody>
            {closes.map((c) => {
              const margin = c.totalRevenue > 0 ? (c.netProfit / c.totalRevenue) * 100 : 0;
              return (
                <tr key={c.id} className='border-b text-sm'>
                  <td className='p-2'>{dateFmt.format(new Date(c.date))}</td>
                  <td className='p-2 text-right'>{priceFmt.format(c.totalRevenue)}</td>
                  <td className='p-2 text-right text-muted-foreground'>{priceFmt.format(c.totalCost)}</td>
                  <td className={`p-2 text-right font-medium ${c.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {priceFmt.format(c.netProfit)}
                  </td>
                  <td className='p-2 text-right'>
                    <Badge variant={margin >= 60 ? 'default' : margin >= 40 ? 'secondary' : 'destructive'}>
                      {margin.toFixed(0)}%
                    </Badge>
                  </td>
                  <td className='p-2 text-right'>{c.itemsSold}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  positive,
}: {
  label: string;
  value: string;
  hint?: string;
  positive?: boolean;
}) {
  return (
    <div className='rounded-lg border p-3'>
      <p className='text-xs uppercase text-muted-foreground'>{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${positive === false ? 'text-red-700' : ''}`}>
        {value}
      </p>
      {hint && <p className='mt-1 text-xs text-muted-foreground'>{hint}</p>}
    </div>
  );
}
