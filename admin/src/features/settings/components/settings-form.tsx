'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  saveHero,
  saveContact,
  saveFooter,
  type HeroSettings,
  type ContactSettings,
  type FooterSettings,
} from '../api/service';

type Props = {
  initialHero: HeroSettings;
  initialContact: ContactSettings;
  initialFooter: FooterSettings;
};

export function SettingsForm({ initialHero, initialContact, initialFooter }: Props) {
  const [hero, setHero] = useState(initialHero);
  const [contact, setContact] = useState(initialContact);
  const [footer, setFooter] = useState(initialFooter);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavedMsg(null);
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await Promise.all([saveHero(hero), saveContact(contact), saveFooter(footer)]);
        setSavedMsg('Đã lưu. Website sẽ cập nhật trong ~1 phút.');
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi lưu');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8 max-w-3xl'>
      {/* HERO */}
      <section className='rounded-lg border p-6 space-y-4'>
        <div>
          <h2 className='text-lg font-semibold'>Hero trang chủ</h2>
          <p className='text-sm text-muted-foreground'>Phần banner lớn ở trang chủ.</p>
        </div>

        <div className='space-y-2'>
          <Label>Nhãn (badge)</Label>
          <Input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Tiêu đề — phần đầu</Label>
            <Input value={hero.titlePrefix} onChange={(e) => setHero({ ...hero, titlePrefix: e.target.value })} />
          </div>
          <div className='space-y-2'>
            <Label>Tiêu đề — phần nhấn</Label>
            <Input value={hero.titleHighlight} onChange={(e) => setHero({ ...hero, titleHighlight: e.target.value })} />
          </div>
        </div>

        <div className='space-y-2'>
          <Label>Mô tả</Label>
          <Textarea rows={3} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Nút chính</Label>
            <Input value={hero.primaryCta} onChange={(e) => setHero({ ...hero, primaryCta: e.target.value })} />
          </div>
          <div className='space-y-2'>
            <Label>Nút phụ</Label>
            <Input value={hero.secondaryCta} onChange={(e) => setHero({ ...hero, secondaryCta: e.target.value })} />
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className='rounded-lg border p-6 space-y-4'>
        <div>
          <h2 className='text-lg font-semibold'>Thông tin liên hệ</h2>
          <p className='text-sm text-muted-foreground'>Hiển thị ở footer, trang liên hệ và section CTA.</p>
        </div>

        <div className='space-y-2'>
          <Label>Địa chỉ</Label>
          <Input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Điện thoại</Label>
            <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
          </div>
          <div className='space-y-2'>
            <Label>Email</Label>
            <Input type='email' value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          </div>
        </div>

        <div className='space-y-2'>
          <Label>Giờ mở cửa (ngắn gọn)</Label>
          <Input value={contact.hoursShort} onChange={(e) => setContact({ ...contact, hoursShort: e.target.value })} placeholder='VD: 7:00 - 22:00 hàng ngày' />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Facebook URL</Label>
            <Input type='url' value={contact.socialFacebook ?? ''} onChange={(e) => setContact({ ...contact, socialFacebook: e.target.value })} placeholder='https://facebook.com/...' />
          </div>
          <div className='space-y-2'>
            <Label>Instagram URL</Label>
            <Input type='url' value={contact.socialInstagram ?? ''} onChange={(e) => setContact({ ...contact, socialInstagram: e.target.value })} placeholder='https://instagram.com/...' />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className='rounded-lg border p-6 space-y-4'>
        <div>
          <h2 className='text-lg font-semibold'>Footer</h2>
          <p className='text-sm text-muted-foreground'>Tên thương hiệu và slogan hiển thị ở footer.</p>
        </div>

        <div className='space-y-2'>
          <Label>Tên cửa hàng</Label>
          <Input value={footer.storeName} onChange={(e) => setFooter({ ...footer, storeName: e.target.value })} />
        </div>

        <div className='space-y-2'>
          <Label>Slogan</Label>
          <Textarea rows={2} value={footer.tagline} onChange={(e) => setFooter({ ...footer, tagline: e.target.value })} />
        </div>
      </section>

      {savedMsg && <p className='rounded bg-green-50 p-3 text-sm text-green-700'>{savedMsg}</p>}
      {errorMsg && <p className='rounded bg-red-50 p-3 text-sm text-red-700'>{errorMsg}</p>}

      <div className='flex justify-end gap-2'>
        <Button type='submit' isLoading={isPending}>
          Lưu tất cả
        </Button>
      </div>
    </form>
  );
}
