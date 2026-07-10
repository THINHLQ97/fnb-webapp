import PageContainer from '@/components/layout/page-container';
import { MenuOverlayListing } from '@/features/menu-overlay/components/menu-overlay-listing';
import { getMenuOverlay } from '@/features/menu-overlay/api/service';

export const metadata = {
  title: 'Dashboard: Menu KiotViet',
};

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const { items, error } = await getMenuOverlay();

  return (
    <PageContainer
      pageTitle='Menu KiotViet'
      pageDescription='Đè overlay lên sản phẩm KiotViet: đánh dấu Best seller, ghim đầu menu, ảnh custom, tag riêng.'
    >
      <MenuOverlayListing initialItems={items} initialError={error} />
    </PageContainer>
  );
}
