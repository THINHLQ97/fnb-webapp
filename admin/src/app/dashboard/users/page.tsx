import PageContainer from '@/components/layout/page-container';
import { UserListing } from '@/features/users/components/user-listing';

export const metadata = {
  title: 'Dashboard: Người dùng',
};

export default function UsersPage() {
  return (
    <PageContainer
      pageTitle='Người dùng'
      pageDescription='Quản lý tài khoản đăng nhập dashboard và phân quyền'
    >
      <UserListing />
    </PageContainer>
  );
}
