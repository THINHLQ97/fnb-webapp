'use client';

import { useMemo, useState } from 'react';
import { Star } from 'lucide-react';

type Item = {
  id: number;
  code: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string | null;
  image: string | null;
  categoryId: number | null;
  categoryName: string;
  tag: string | null;
  highlight: boolean;
  featured: boolean;
};

type Category = { id: number; name: string };

const ALL = '__all__';

export function MenuFilter({
  categories,
  items,
}: {
  categories: Category[];
  items: Item[];
}) {
  const [active, setActive] = useState<string>(ALL);

  const filtered = useMemo(() => {
    if (active === ALL) return items;
    const id = Number(active);
    return items.filter((i) => i.categoryId === id);
  }, [active, items]);

  return (
    <>
      <div className='mt-8 flex flex-wrap items-center justify-center gap-2'>
        <button
          type='button'
          onClick={() => setActive(ALL)}
          className={
            active === ALL
              ? 'rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white'
              : 'cursor-pointer rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-primary'
          }
        >
          Tất cả
        </button>
        {categories.map((cat) => {
          const key = String(cat.id);
          const on = active === key;
          return (
            <button
              key={key}
              type='button'
              onClick={() => setActive(key)}
              className={
                on
                  ? 'rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white'
                  : 'cursor-pointer rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-primary'
              }
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      <div className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {filtered.map((item) => (
          <div
            key={item.id}
            className='group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md'
          >
            {/* Badges overlay */}
            <div className='absolute left-3 top-3 z-10 flex flex-col gap-1'>
              {item.tag && (
                <span className='rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow'>
                  {item.tag}
                </span>
              )}
              {item.highlight && (
                <span className='rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-white shadow flex items-center gap-1'>
                  <Star className='h-3 w-3' fill='currentColor' />
                  Best seller
                </span>
              )}
            </div>

            <div className='flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 to-accent/10'>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className='h-full w-full object-cover transition-transform group-hover:scale-105'
                />
              ) : (
                <Star className='h-12 w-12 text-primary/20' />
              )}
            </div>
            <div className='p-4'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <span className='text-xs font-medium text-muted'>{item.categoryName}</span>
                  <h3 className='mt-0.5 font-semibold'>{item.name}</h3>
                </div>
                <span className='shrink-0 text-lg font-bold text-primary'>{item.priceLabel}</span>
              </div>
              {item.description && (
                <p className='mt-2 text-sm text-muted line-clamp-2'>{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
