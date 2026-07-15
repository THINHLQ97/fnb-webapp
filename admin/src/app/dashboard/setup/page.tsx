import { redirect } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { auth } from '@/lib/auth';
import { getSetupStatus } from '@/features/setup/api/service';
import { SetupPanel } from '@/features/setup/components/setup-panel';

export const metadata = {
  title: 'Dashboard: Khởi tạo hệ thống',
};

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  const status = await getSetupStatus();

  return (
    <PageContainer
      pageTitle='Khởi tạo hệ thống'
      pageDescription='Chạy migration DB, tạo ADMIN đầu tiên, và thêm bài viết mẫu. Trang này chỉ dùng lần đầu.'
    >
      <SetupPanel initialStatus={status} />
    </PageContainer>
  );
}
