import type { Metadata } from 'next';
import { getMenu } from '@/lib/menu';
import { MenuFilter } from '@/components/menu-filter';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Khám phá menu thức uống phong phú tại F&B Store.',
};

// Cache 60s: menu đổi không thường xuyên, admin lưu là revalidate ngay.
export const revalidate = 60;

const priceFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export default async function MenuPage() {
  const { categories, items, error } = await getMenu();

  return (
    <div className='py-12'>
      <div className='container-main'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold sm:text-4xl'>Menu</h1>
          <p className='mt-2 text-muted'>
            Đa dạng thức uống, phục vụ mọi sở thích
          </p>
        </div>

        {items.length === 0 ? (
          <p className='mt-12 text-center text-muted'>
            Chưa có món nào trong menu.
          </p>
        ) : (
          <MenuFilter
            categories={categories}
            items={items.map((i) => ({
              ...i,
              priceLabel: priceFormatter.format(i.price),
            }))}
          />
        )}

        {error && process.env.NODE_ENV !== 'production' && (
          <pre className='mt-4 rounded bg-red-50 p-3 text-xs text-red-700'>{error}</pre>
        )}
      </div>
    </div>
  );
}
