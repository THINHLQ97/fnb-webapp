import Link from 'next/link';
import { Coffee, MapPin, Phone, Mail } from 'lucide-react';
import { getContact, getFooter } from '@/lib/site-settings';

export async function Footer() {
  const [contact, footer] = await Promise.all([getContact(), getFooter()]);

  return (
    <footer className='border-t border-border bg-section'>
      <div className='container-main py-12'>
        <div className='grid gap-8 md:grid-cols-3'>
          <div>
            <Link href='/' className='flex items-center gap-2 text-xl font-bold text-primary'>
              <Coffee className='h-6 w-6' />
              <span>{footer.storeName}</span>
            </Link>
            <p className='mt-3 text-sm text-muted'>{footer.tagline}</p>
          </div>

          <div>
            <h3 className='mb-3 font-semibold'>Liên kết</h3>
            <ul className='space-y-2 text-sm text-muted'>
              <li><Link href='/menu' className='hover:text-primary'>Menu</Link></li>
              <li><Link href='/about' className='hover:text-primary'>Giới thiệu</Link></li>
              <li><Link href='/contact' className='hover:text-primary'>Liên hệ</Link></li>
              <li><Link href='/blog' className='hover:text-primary'>Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className='mb-3 font-semibold'>Liên hệ</h3>
            <ul className='space-y-2 text-sm text-muted'>
              <li className='flex items-center gap-2'>
                <MapPin className='h-4 w-4 shrink-0' />
                <span>{contact.address}</span>
              </li>
              <li className='flex items-center gap-2'>
                <Phone className='h-4 w-4 shrink-0' />
                <span>{contact.phone}</span>
              </li>
              <li className='flex items-center gap-2'>
                <Mail className='h-4 w-4 shrink-0' />
                <span>{contact.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-8 border-t border-border pt-6 text-center text-xs text-muted'>
          &copy; {new Date().getFullYear()} {footer.storeName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
