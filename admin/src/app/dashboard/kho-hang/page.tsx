import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { InventoryPage } from '@/features/inventory/components/inventory-page';
import {
  isInventoryReady,
  listIngredients,
  listRecipes,
  listDailyCloses,
} from '@/features/inventory/api/service';

export const metadata = {
  title: 'Dashboard: Kho hàng & Công thức',
};

export const dynamic = 'force-dynamic';

export default async function KhoHangPage() {
  const ready = await isInventoryReady();

  if (!ready) {
    return (
      <PageContainer
        pageTitle='Kho hàng & Công thức'
        pageDescription='Quản lý nguyên liệu, công thức pha chế, nhập bán ngày và tính lợi nhuận'
      >
        <div className='max-w-2xl rounded-md border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900'>
          <p className='font-medium'>Chưa sẵn sàng — các bảng Ingredient / DrinkRecipe / DailySale chưa có.</p>
          <p className='mt-2'>
            Vào{' '}
            <Link href='/dashboard/setup' className='underline font-medium'>
              Khởi tạo hệ thống
            </Link>{' '}
            → bấm <strong>Chạy migration</strong> để tạo bảng, sau đó bấm{' '}
            <strong>Thêm dữ liệu KHO mẫu</strong> để có data demo.
          </p>
        </div>
      </PageContainer>
    );
  }

  const [ingredients, recipes, closes] = await Promise.all([
    listIngredients(),
    listRecipes(),
    listDailyCloses(30),
  ]);

  // simpleRecipes cho tab Sales — không cần include items nặng
  const simpleRecipes = recipes.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    priceRegular: r.priceRegular,
    priceLarge: r.priceLarge,
  }));

  return (
    <PageContainer
      pageTitle='Kho hàng & Công thức'
      pageDescription='Nhập số ly bán / ngày → app tự trừ nguyên liệu, tính cost và lợi nhuận'
    >
      <InventoryPage
        ingredients={ingredients}
        recipes={recipes}
        simpleRecipes={simpleRecipes}
        closes={closes}
      />
    </PageContainer>
  );
}
