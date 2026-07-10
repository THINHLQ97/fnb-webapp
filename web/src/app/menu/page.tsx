import type { Metadata } from 'next';
import { getMenu } from '@/lib/kiotviet/menu';
import { MenuFilter } from '@/components/menu-filter';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Khám phá menu thức uống phong phú tại F&B Store.',
};

// Cache 60s: KiotViet có rate limit, đủ tươi cho khách xem menu
export const revalidate = 60;

const priceFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export default async function MenuPage() {
  const { categories, items, source, error } = await getMenu();

  return (
    <div className='py-12'>
      <div className='container-main'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold sm:text-4xl'>Menu</h1>
          <p className='mt-2 text-muted'>
            Đa dạng thức uống, phục vụ mọi sở thích
          </p>
          {source === 'fallback' && (
            <p className='mt-3 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800'>
              Menu mẫu — KiotViet chưa được cấu hình
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <p className='mt-12 text-center text-muted'>
            Chưa có sản phẩm nào trong menu.
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

        <p className='mt-12 text-center text-sm text-muted'>
          {source === 'kiotviet'
            ? 'Menu được đồng bộ tự động từ hệ thống KiotViet.'
            : 'Menu sẽ tự đồng bộ từ KiotViet khi cấu hình đủ.'}
        </p>

        {error && process.env.NODE_ENV !== 'production' && (
          <pre className='mt-4 rounded bg-red-50 p-3 text-xs text-red-700'>{error}</pre>
        )}
      </div>
    </div>
  );
}
