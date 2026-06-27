import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Liên hệ',
  description: 'Liên hệ F&B Store — địa chỉ, số điện thoại và giờ mở cửa.',
};

const info = [
  { icon: MapPin, label: 'Địa chỉ', value: '123 Đường ABC, Quận 1, TP.HCM' },
  { icon: Phone, label: 'Điện thoại', value: '0909 123 456' },
  { icon: Mail, label: 'Email', value: 'hello@fnbstore.vn' },
  { icon: Clock, label: 'Giờ mở cửa', value: '7:00 – 22:00 hàng ngày' },
];

export default function ContactPage() {
  return (
    <div className='py-12'>
      <div className='container-main'>
        <div className='mx-auto max-w-2xl text-center'>
          <h1 className='text-3xl font-bold sm:text-4xl'>Liên hệ</h1>
          <p className='mt-2 text-muted'>
            Hãy đến thăm quán hoặc liên hệ với chúng tôi bất cứ lúc nào.
          </p>
        </div>

        <div className='mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2'>
          <div className='space-y-6'>
            <h2 className='text-xl font-bold'>Thông tin liên hệ</h2>
            {info.map((item) => (
              <div key={item.label} className='flex items-start gap-4'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                  <item.icon className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-sm font-medium text-muted'>{item.label}</p>
                  <p className='font-medium'>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className='rounded-2xl bg-card p-6 shadow-sm'>
            <h2 className='text-xl font-bold'>Gửi tin nhắn</h2>
            <p className='mt-1 text-sm text-muted'>Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
            <form className='mt-6 space-y-4'>
              <div>
                <label className='mb-1 block text-sm font-medium'>Họ tên</label>
                <input
                  type='text'
                  className='w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary'
                  placeholder='Nguyễn Văn A'
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium'>Email</label>
                <input
                  type='email'
                  className='w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary'
                  placeholder='email@example.com'
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium'>Tin nhắn</label>
                <textarea
                  rows={4}
                  className='w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary'
                  placeholder='Nội dung tin nhắn...'
                />
              </div>
              <button
                type='submit'
                className='w-full rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark'
              >
                Gửi tin nhắn
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
