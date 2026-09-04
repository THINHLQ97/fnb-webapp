import PageContainer from '@/components/layout/page-container';
import { MenuDisplayListing } from '@/features/menu-display/components/menu-display-listing';
import { getMenuDisplay } from '@/features/menu-display/api/service';

export const metadata = {
  title: 'Dashboard: Menu website',
};

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const { items, error } = await getMenuDisplay();

  return (
    <PageContainer
      pageTitle='Menu website'
      pageDescription='Trình bày món trên website: đánh dấu Best seller, ghim đầu menu, ảnh và mô tả.'
    >
      <MenuDisplayListing initialItems={items} initialError={error} />
    </PageContainer>
  );
}
