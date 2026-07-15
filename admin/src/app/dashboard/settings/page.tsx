import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { SettingsForm } from '@/features/settings/components/settings-form';
import {
  getHero,
  getContact,
  getFooter,
  isSiteSettingReady,
} from '@/features/settings/api/service';

export const metadata = {
  title: 'Dashboard: Cấu hình website',
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const ready = await isSiteSettingReady();

  if (!ready) {
    return (
      <PageContainer
        pageTitle='Cấu hình website'
        pageDescription='Nội dung hero, thông tin liên hệ và footer trên fnb-webapp.vibe.matbao.net'
      >
        <div className='max-w-2xl rounded-md border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900'>
          <p className='font-medium'>Chưa sẵn sàng — bảng SiteSetting chưa được tạo.</p>
          <p className='mt-2'>
            Vào{' '}
            <Link href='/dashboard/setup' className='underline font-medium'>
              Khởi tạo hệ thống
            </Link>{' '}
            và bấm nút <strong>Chạy migration</strong> ở Bước 1. Sau khi bảng được tạo, quay lại
            đây để điền nội dung.
          </p>
        </div>
      </PageContainer>
    );
  }

  const [hero, contact, footer] = await Promise.all([getHero(), getContact(), getFooter()]);

  return (
    <PageContainer
      pageTitle='Cấu hình website'
      pageDescription='Nội dung hero, thông tin liên hệ và footer trên fnb-webapp.vibe.matbao.net'
    >
      <SettingsForm initialHero={hero} initialContact={contact} initialFooter={footer} />
    </PageContainer>
  );
}
