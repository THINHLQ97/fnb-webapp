import Link from 'next/link';
import { Coffee, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className='border-t border-border bg-section'>
      <div className='container-main py-12'>
        <div className='grid gap-8 md:grid-cols-3'>
          <div>
            <Link href='/' className='flex items-center gap-2 text-xl font-bold text-primary'>
              <Coffee className='h-6 w-6' />
              <span>F&B Store</span>
            </Link>
            <p className='mt-3 text-sm text-muted'>
              Thức uống ngon mỗi ngày. Chất lượng là ưu tiên hàng đầu.
            </p>
          </div>

          <div>
            <h3 className='mb-3 font-semibold'>Liên kết</h3>
            <ul className='space-y-2 text-sm text-muted'>
              <li><Link href='/menu' className='hover:text-primary'>Menu</Link></li>
              <li><Link href='/about' className='hover:text-primary'>Giới thiệu</Link></li>
              <li><Link href='/contact' className='hover:text-primary'>Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className='mb-3 font-semibold'>Liên hệ</h3>
            <ul className='space-y-2 text-sm text-muted'>
              <li className='flex items-center gap-2'>
                <MapPin className='h-4 w-4 shrink-0' />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </li>
              <li className='flex items-center gap-2'>
                <Phone className='h-4 w-4 shrink-0' />
                <span>0909 123 456</span>
              </li>
              <li className='flex items-center gap-2'>
                <Mail className='h-4 w-4 shrink-0' />
                <span>hello@fnbstore.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-8 border-t border-border pt-6 text-center text-xs text-muted'>
          &copy; {new Date().getFullYear()} F&B Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
