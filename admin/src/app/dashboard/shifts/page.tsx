import PageContainer from '@/components/layout/page-container';
import { ShiftListing } from '@/features/shifts/components/shift-listing';

export const metadata = {
  title: 'Dashboard: Lịch trực',
};

export default function ShiftsPage() {
  return (
    <PageContainer
      pageTitle='Lịch trực'
      pageDescription='Quản lý ca làm việc'
    >
      <ShiftListing />
    </PageContainer>
  );
}
