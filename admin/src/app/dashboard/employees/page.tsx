import PageContainer from '@/components/layout/page-container';
import { EmployeeListing } from '@/features/employees/components/employee-listing';
import { EmployeeFormDialog } from '@/features/employees/components/employee-form-dialog';
import { AddEmployeeButton } from './add-button';

export const metadata = {
  title: 'Dashboard: Nhân viên',
};

export default function EmployeesPage() {
  return (
    <PageContainer
      pageTitle='Nhân viên'
      pageDescription='Quản lý danh sách nhân viên'
      pageHeaderAction={<AddEmployeeButton />}
    >
      <EmployeeListing />
    </PageContainer>
  );
}
