import { Coffee, CupSoda, Citrus, IceCreamCone, LeafyGreen, Wine } from 'lucide-react';
import Link from 'next/link';

const categories = [
  { name: 'Cà phê', icon: Coffee, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { name: 'Trà', icon: LeafyGreen, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { name: 'Nước ép', icon: Citrus, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { name: 'Sinh tố', icon: CupSoda, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  { name: 'Kem & Đá xay', icon: IceCreamCone, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { name: 'Đặc biệt', icon: Wine, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
];

export function FeaturedCategories() {
  return (
    <section className='bg-section py-16'>
      <div className='container-main'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold sm:text-3xl'>Danh mục thức uống</h2>
          <p className='mt-2 text-muted'>Chọn loại thức uống yêu thích của bạn</p>
        </div>

        <div className='mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href='/menu'
              className='group flex flex-col items-center gap-3 rounded-2xl bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md'
            >
              <div className={`rounded-xl p-3 ${cat.color} transition-transform group-hover:scale-110`}>
                <cat.icon className='h-6 w-6' />
              </div>
              <span className='text-sm font-medium'>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
