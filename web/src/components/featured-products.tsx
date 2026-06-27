import { Star } from 'lucide-react';
import Link from 'next/link';

const products = [
  { name: 'Cà phê sữa đá', price: '29.000đ', category: 'Cà phê', badge: 'Best seller' },
  { name: 'Trà đào cam sả', price: '35.000đ', category: 'Trà', badge: 'Phổ biến' },
  { name: 'Bạc xỉu', price: '32.000đ', category: 'Cà phê', badge: null },
  { name: 'Sinh tố bơ', price: '39.000đ', category: 'Sinh tố', badge: 'Mới' },
  { name: 'Nước ép cam', price: '30.000đ', category: 'Nước ép', badge: null },
  { name: 'Matcha đá xay', price: '42.000đ', category: 'Đá xay', badge: 'Đặc biệt' },
  { name: 'Trà sữa trân châu', price: '35.000đ', category: 'Trà', badge: 'Best seller' },
  { name: 'Espresso', price: '25.000đ', category: 'Cà phê', badge: null },
];

export function FeaturedProducts() {
  return (
    <section className='py-16'>
      <div className='container-main'>
        <div className='flex items-end justify-between'>
          <div>
            <h2 className='text-2xl font-bold sm:text-3xl'>Thức uống nổi bật</h2>
            <p className='mt-2 text-muted'>Được yêu thích nhất tại quán</p>
          </div>
          <Link href='/menu' className='text-sm font-medium text-primary hover:underline'>
            Xem tất cả →
          </Link>
        </div>

        <div className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {products.map((item) => (
            <div
              key={item.name}
              className='group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md'
            >
              <div className='flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10'>
                <Star className='h-12 w-12 text-primary/20' />
              </div>
              {item.badge && (
                <span className='absolute top-3 left-3 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white'>
                  {item.badge}
                </span>
              )}
              <div className='p-4'>
                <span className='text-xs font-medium text-muted'>{item.category}</span>
                <h3 className='mt-1 font-semibold'>{item.name}</h3>
                <p className='mt-2 text-lg font-bold text-primary'>{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
