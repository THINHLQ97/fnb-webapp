import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { getContact } from '@/lib/site-settings';
import { ContactForm } from '@/components/contact-form';

export const metadata: Metadata = {
  title: 'Liên hệ',
  description: 'Liên hệ F&B Store — địa chỉ, số điện thoại và giờ mở cửa.',
};

export const revalidate = 60;

export default async function ContactPage() {
  const contact = await getContact();

  const info = [
    { icon: MapPin, label: 'Địa chỉ', value: contact.address },
    { icon: Phone, label: 'Điện thoại', value: contact.phone },
    { icon: Mail, label: 'Email', value: contact.email },
    { icon: Clock, label: 'Giờ mở cửa', value: contact.hoursShort },
  ];

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
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
