import type { Metadata } from 'next';
import { Star, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Khám phá menu thức uống phong phú tại F&B Store.',
};

const menuItems = [
  { id: 1, name: 'Cà phê sữa đá', price: '29.000đ', category: 'Cà phê', description: 'Cà phê phin truyền thống với sữa đặc, đá lạnh' },
  { id: 2, name: 'Bạc xỉu', price: '32.000đ', category: 'Cà phê', description: 'Cà phê nhẹ nhàng với nhiều sữa, thơm béo' },
  { id: 3, name: 'Espresso', price: '25.000đ', category: 'Cà phê', description: 'Cà phê đậm đặc nguyên chất' },
  { id: 4, name: 'Americano', price: '30.000đ', category: 'Cà phê', description: 'Espresso pha loãng với nước nóng' },
  { id: 5, name: 'Latte', price: '39.000đ', category: 'Cà phê', description: 'Espresso với sữa tươi steamed' },
  { id: 6, name: 'Cappuccino', price: '39.000đ', category: 'Cà phê', description: 'Espresso, sữa tươi và foam mịn' },
  { id: 7, name: 'Trà đào cam sả', price: '35.000đ', category: 'Trà', description: 'Trà hoa cúc, đào tươi, cam và sả thơm' },
  { id: 8, name: 'Trà vải', price: '32.000đ', category: 'Trà', description: 'Trà xanh kết hợp vải tươi mát lạnh' },
  { id: 9, name: 'Trà sữa trân châu', price: '35.000đ', category: 'Trà', description: 'Trà sữa đậm đà với trân châu đen dẻo' },
  { id: 10, name: 'Matcha latte', price: '42.000đ', category: 'Trà', description: 'Bột matcha Nhật Bản với sữa tươi' },
  { id: 11, name: 'Nước ép cam', price: '30.000đ', category: 'Nước ép', description: 'Cam tươi ép nguyên chất 100%' },
  { id: 12, name: 'Nước ép dưa hấu', price: '28.000đ', category: 'Nước ép', description: 'Dưa hấu tươi xay mát lạnh' },
  { id: 13, name: 'Sinh tố bơ', price: '39.000đ', category: 'Sinh tố', description: 'Bơ sáp béo ngậy với sữa đặc' },
  { id: 14, name: 'Sinh tố xoài', price: '35.000đ', category: 'Sinh tố', description: 'Xoài cát Hòa Lộc chín mọng' },
  { id: 15, name: 'Matcha đá xay', price: '42.000đ', category: 'Đá xay', description: 'Matcha Nhật xay đá mịn, cream béo' },
  { id: 16, name: 'Cookies & Cream', price: '45.000đ', category: 'Đá xay', description: 'Kem vanilla, bánh cookies xay nhuyễn' },
];

const allCategories = [...new Set(menuItems.map((i) => i.category))];

export default function MenuPage() {
  return (
    <div className='py-12'>
      <div className='container-main'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold sm:text-4xl'>Menu</h1>
          <p className='mt-2 text-muted'>
            Đa dạng thức uống, phục vụ mọi sở thích
          </p>
        </div>

        <div className='mt-8 flex flex-wrap items-center justify-center gap-2'>
          <span className='rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white'>
            Tất cả
          </span>
          {allCategories.map((cat) => (
            <span
              key={cat}
              className='cursor-pointer rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-primary'
            >
              {cat}
            </span>
          ))}
        </div>

        <div className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {menuItems.map((item) => (
            <div
              key={item.id}
              className='group overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md'
            >
              <div className='flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10'>
                <Star className='h-12 w-12 text-primary/20' />
              </div>
              <div className='p-4'>
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <span className='text-xs font-medium text-muted'>{item.category}</span>
                    <h3 className='mt-0.5 font-semibold'>{item.name}</h3>
                  </div>
                  <span className='shrink-0 text-lg font-bold text-primary'>{item.price}</span>
                </div>
                <p className='mt-2 text-sm text-muted line-clamp-2'>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className='mt-12 text-center text-sm text-muted'>
          Menu sẽ được cập nhật tự động từ hệ thống KiotViet khi kết nối API.
        </p>
      </div>
    </div>
  );
}
