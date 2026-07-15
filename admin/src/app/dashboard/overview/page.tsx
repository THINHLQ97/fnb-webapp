import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getKiotVietClient } from '@/lib/kiotviet/client';
import { getDoanhSoHomNay, getHangSapHet } from '@/lib/kiotviet/dashboard';

const vndFmt = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export const metadata = {
  title: 'Dashboard: Bảng điều khiển',
};

export const dynamic = 'force-dynamic';

async function loadStats() {
  const defaults = {
    postPublished: 0,
    postDraft: 0,
    employeeActive: 0,
    shiftsThisWeek: 0,
    userCount: 0,
    tablesReady: false,
  };
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const [postPublished, postDraft, employeeActive, shiftsThisWeek, userCount] = await Promise.all([
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.employee.count({ where: { active: true } }),
      prisma.shiftAssignment.count({
        where: { date: { gte: startOfWeek, lt: endOfWeek } },
      }),
      prisma.user.count(),
    ]);

    return {
      postPublished,
      postDraft,
      employeeActive,
      shiftsThisWeek,
      userCount,
      tablesReady: true,
    };
  } catch {
    return defaults;
  }
}

type KiotStats = {
  ok: boolean;
  doanhSo: number;
  soDon: number;
  lowStock: Array<{ ten: string; ma: string; tonKho: number }>;
  reason?: string;
};

async function loadKiotViet(): Promise<KiotStats> {
  const client = getKiotVietClient();
  if (!client) {
    return { ok: false, doanhSo: 0, soDon: 0, lowStock: [], reason: 'Chưa cấu hình KiotViet' };
  }
  try {
    const [ds, low] = await Promise.all([
      getDoanhSoHomNay().catch(() => ({ doanhSo: 0, soDon: 0 })),
      getHangSapHet(5).catch(() => []),
    ]);
    return { ok: true, doanhSo: ds.doanhSo, soDon: ds.soDon, lowStock: low };
  } catch (err) {
    return {
      ok: false,
      doanhSo: 0,
      soDon: 0,
      lowStock: [],
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

export default async function OverviewPage() {
  const session = await auth();
  const [stats, kiot] = await Promise.all([loadStats(), loadKiotViet()]);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Xin chào{session?.user?.name ? `, ${session.user.name}` : ''} 👋
          </h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            Tổng quan hoạt động cửa hàng — nội dung website, nhân sự và ca làm.
          </p>
        </div>

        {!stats.tablesReady && (
          <div className='rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900'>
            Chưa đọc được database. Có thể do <code>DATABASE_URL</code> chưa cấu hình, hoặc chưa chạy
            migration. Vào{' '}
            <Link href='/dashboard/setup' className='underline font-medium'>
              Khởi tạo hệ thống
            </Link>{' '}
            để bootstrap.
          </div>
        )}

        {/* KiotViet — doanh số & tồn kho */}
        <section>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Bán hàng hôm nay (KiotViet)</h3>
            <Badge variant={kiot.ok ? 'default' : 'secondary'}>
              {kiot.ok ? 'Kết nối OK' : 'Chưa kết nối'}
            </Badge>
          </div>

          {!kiot.ok ? (
            <div className='rounded-md border border-dashed p-4 text-sm text-muted-foreground'>
              {kiot.reason ?? 'Không lấy được dữ liệu KiotViet'}. Vào{' '}
              <Link href='/dashboard/setup' className='underline'>
                Khởi tạo
              </Link>{' '}
              để xem hướng dẫn cấu hình KIOTVIET_* env vars.
            </div>
          ) : (
            <div className='grid gap-4 md:grid-cols-3'>
              <Card>
                <CardHeader>
                  <CardDescription className='flex items-center gap-2'>
                    <Icons.trendingUp className='h-4 w-4' />
                    Doanh số hôm nay
                  </CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums'>
                    {vndFmt.format(kiot.doanhSo)}
                  </CardTitle>
                </CardHeader>
                <CardFooter>
                  <Badge variant='outline'>{kiot.soDon} hóa đơn</Badge>
                </CardFooter>
              </Card>

              <Card className='md:col-span-2'>
                <CardHeader>
                  <CardDescription className='flex items-center gap-2'>
                    <Icons.warning className='h-4 w-4' />
                    Hàng sắp hết (tồn ≤ 10)
                  </CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums'>
                    {kiot.lowStock.length}
                  </CardTitle>
                </CardHeader>
                <CardFooter>
                  {kiot.lowStock.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>Không có sản phẩm nào sắp hết.</p>
                  ) : (
                    <ul className='w-full space-y-1 text-sm'>
                      {kiot.lowStock.map((p) => (
                        <li key={p.ma} className='flex items-center justify-between'>
                          <span className='truncate' title={p.ten}>
                            <span className='font-mono text-xs text-muted-foreground'>
                              {p.ma}
                            </span>{' '}
                            {p.ten}
                          </span>
                          <span className='shrink-0 font-medium text-red-600'>còn {p.tonKho}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardFooter>
              </Card>
            </div>
          )}
        </section>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            title='Bài viết đã đăng'
            value={stats.postPublished}
            hint={`${stats.postDraft} bản nháp`}
            href='/dashboard/posts'
            icon={<Icons.post className='h-4 w-4' />}
          />
          <StatCard
            title='Nhân viên đang làm'
            value={stats.employeeActive}
            hint='đang hoạt động'
            href='/dashboard/employees'
            icon={<Icons.teams className='h-4 w-4' />}
          />
          <StatCard
            title='Ca trong tuần này'
            value={stats.shiftsThisWeek}
            hint='đã phân công'
            href='/dashboard/shifts'
            icon={<Icons.calendar className='h-4 w-4' />}
          />
          <StatCard
            title='Tài khoản hệ thống'
            value={stats.userCount}
            hint='user đăng nhập'
            href='/dashboard/users'
            icon={<Icons.teams className='h-4 w-4' />}
          />
        </div>

        <div>
          <h3 className='mb-3 text-lg font-semibold'>Thao tác nhanh</h3>
          <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
            <QuickAction
              href='/dashboard/posts'
              title='Viết bài mới'
              description='Đăng blog cho khách xem trên website'
              icon={<Icons.post className='h-5 w-5' />}
            />
            <QuickAction
              href='/dashboard/menu'
              title='Cập nhật menu'
              description='Đánh dấu Best seller, thêm tag cho sản phẩm KiotViet'
              icon={<Icons.product className='h-5 w-5' />}
            />
            <QuickAction
              href='/dashboard/settings'
              title='Cấu hình website'
              description='Sửa hero, liên hệ, footer trang public'
              icon={<Icons.settings className='h-5 w-5' />}
            />
            <QuickAction
              href='/dashboard/attendance'
              title='Chấm công hôm nay'
              description='Ghi nhận check-in / check-out của nhân viên'
              icon={<Icons.clock className='h-5 w-5' />}
            />
            <QuickAction
              href='/dashboard/shifts'
              title='Xếp lịch trực'
              description='Phân công ca sáng / chiều / tối'
              icon={<Icons.calendar className='h-5 w-5' />}
            />
            <QuickAction
              href='/dashboard/employees'
              title='Thêm nhân viên'
              description='Thêm mới hoặc chỉnh sửa thông tin nhân sự'
              icon={<Icons.teams className='h-5 w-5' />}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function StatCard({
  title,
  value,
  hint,
  href,
  icon,
}: {
  title: string;
  value: number;
  hint: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className='block'>
      <Card className='transition-shadow hover:shadow-md'>
        <CardHeader>
          <CardDescription className='flex items-center gap-2'>
            {icon}
            {title}
          </CardDescription>
          <CardTitle className='text-3xl font-semibold tabular-nums'>{value}</CardTitle>
        </CardHeader>
        <CardFooter>
          <Badge variant='outline'>{hint}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className='group rounded-lg border p-4 transition-all hover:border-primary hover:shadow-sm'
    >
      <div className='flex items-start gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'>
          {icon}
        </div>
        <div className='flex-1'>
          <h4 className='font-medium group-hover:text-primary'>{title}</h4>
          <p className='mt-0.5 text-sm text-muted-foreground'>{description}</p>
        </div>
      </div>
    </Link>
  );
}
