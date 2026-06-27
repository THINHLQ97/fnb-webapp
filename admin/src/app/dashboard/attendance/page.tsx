import PageContainer from '@/components/layout/page-container';
import { AttendanceListing } from '@/features/attendance/components/attendance-listing';

export const metadata = {
  title: 'Dashboard: Chấm công',
};

export default function AttendancePage() {
  return (
    <PageContainer
      pageTitle='Chấm công'
      pageDescription='Quản lý chấm công nhân viên'
    >
      <AttendanceListing />
    </PageContainer>
  );
}
