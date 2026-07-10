import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';
import { getContact } from '@/lib/site-settings';

export async function CtaSection() {
  const contact = await getContact();

  return (
    <section className='bg-gradient-to-r from-primary to-primary-dark py-16 text-white'>
      <div className='container-main text-center'>
        <h2 className='text-2xl font-bold sm:text-3xl'>Ghé thăm quán ngay hôm nay</h2>
        <p className='mx-auto mt-3 max-w-md text-white/80'>
          Chúng tôi luôn sẵn sàng phục vụ bạn những ly thức uống tuyệt vời nhất.
        </p>

        <div className='mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row'>
          <div className='flex items-center gap-2'>
            <MapPin className='h-5 w-5' />
            <span>{contact.address}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            <span>{contact.hoursShort}</span>
          </div>
        </div>

        <Link
          href='/contact'
          className='mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-primary shadow-lg transition-all hover:shadow-xl'
        >
          Xem chỉ đường
        </Link>
      </div>
    </section>
  );
}
