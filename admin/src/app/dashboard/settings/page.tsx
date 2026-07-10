import PageContainer from '@/components/layout/page-container';
import { SettingsForm } from '@/features/settings/components/settings-form';
import { getHero, getContact, getFooter } from '@/features/settings/api/service';

export const metadata = {
  title: 'Dashboard: Cấu hình website',
};

export default async function SettingsPage() {
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
