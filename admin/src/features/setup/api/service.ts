'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const MIGRATION_SQL = [
  `CREATE TABLE IF NOT EXISTS "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
  );`,

  `CREATE TABLE IF NOT EXISTS "MenuItemOverride" (
    "id" TEXT NOT NULL,
    "kiotvietId" INTEGER NOT NULL,
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "customImage" TEXT,
    "tag" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MenuItemOverride_pkey" PRIMARY KEY ("id")
  );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "MenuItemOverride_kiotvietId_key" ON "MenuItemOverride"("kiotvietId");`,
  `CREATE INDEX IF NOT EXISTS "MenuItemOverride_featured_idx" ON "MenuItemOverride"("featured");`,
  `CREATE INDEX IF NOT EXISTS "MenuItemOverride_highlight_idx" ON "MenuItemOverride"("highlight");`,
];

const SAMPLE_POSTS = [
  {
    slug: 'ca-phe-viet-3-cach-pha',
    title: '3 cách pha cà phê Việt được yêu thích nhất quán chúng tôi',
    excerpt:
      'Từ cà phê phin truyền thống đến bạc xỉu, mỗi ly cà phê là một câu chuyện của người pha và người thưởng thức.',
    coverImage:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    content: `Cà phê Việt Nam nổi tiếng thế giới không chỉ nhờ hương vị đậm đà mà còn ở cách thưởng thức đầy tinh tế. Ở quán, chúng tôi giữ nguyên tinh thần cà phê phin truyền thống nhưng cũng luôn thử nghiệm để chiều lòng khẩu vị mới.

## 1. Cà phê sữa đá — món quốc dân

Chọn hạt **Robusta Đắk Lắk** rang mộc, phin nhôm truyền nhiệt đều, sữa đặc Ông Thọ. Chờ giọt cuối cùng nhỏ xuống rồi mới đổ đá — vị đắng ngọt hài hòa, hậu vị dài.

## 2. Bạc xỉu — cho ai thích ngọt hơn

Tỷ lệ sữa nhiều gấp đôi cà phê, thêm chút muối tinh để cân vị. Người Sài Gòn xưa gọi đây là *"cà phê cho phái yếu"* — nhưng ai uống rồi cũng nghiện.

## 3. Cold brew Robusta — cách pha hiện đại

Lạnh từ đầu đến cuối. Ngâm cà phê xay thô trong nước lạnh 14 giờ, không đá loãng, giữ trọn hương thơm của hạt. Khách sáng nào cũng ghé mua mang đi.

---

Ghé quán, thử cả ba và cho chúng tôi biết ly nào là **"chân ái"** của bạn nhé!`,
  },
  {
    slug: 'menu-mua-he-2026',
    title: 'Ra mắt menu mùa hè 2026: mát lạnh, ít đường, nhiều trái cây',
    excerpt:
      'Sáu món mới lấy cảm hứng từ trái cây Việt: xoài cát Hòa Lộc, dứa Cầu Đúc, thanh long ruột đỏ...',
    coverImage:
      'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1200&q=80',
    content: `Mùa hè năm nay, quán ra mắt **6 món mới** lấy cảm hứng từ trái cây Việt Nam theo mùa. Tất cả đều **giảm 30% đường mặc định** — khách có thể xin thêm nếu thích ngọt.

## Danh sách món mới

- **Xoài cát Hòa Lộc xay** — nguyên trái xoài chín tự nhiên, không siro, không màu. *42.000đ*
- **Dứa Cầu Đúc — chanh dây** — dứa Hậu Giang tươi ép, kết hợp chanh dây và mật ong rừng U Minh. *39.000đ*
- **Thanh long ruột đỏ đá xay** — ngọt dịu, màu tự nhiên rất hồng, chụp hình cực xinh. *45.000đ*
- **Ổi hồng — trà xanh** — kết hợp bất ngờ, ổi bơm chín xay với trà xanh Thái Nguyên. *38.000đ*
- **Sấu ngâm đường phèn** — món giải nhiệt Hà Nội mà miền Nam ít quán làm. *32.000đ*
- **Cam ép nguyên chất** — cam sành Bến Tre, ép trực tiếp trước mặt khách. *30.000đ*

## Thời gian bán và ưu đãi

Menu mùa hè bán từ **15/06 tới hết tháng 09/2026**. Ưu đãi **20% cho khách đi từ 3 người** trong tuần đầu ra mắt.`,
  },
  {
    slug: 'tuyen-dung-nhan-vien-pha-che',
    title: 'Tuyển dụng nhân viên pha chế và phục vụ ca chiều — tháng 07/2026',
    excerpt:
      'Quán mở rộng chi nhánh mới, cần thêm 2 pha chế và 3 phục vụ. Ưu tiên bạn có kinh nghiệm F&B.',
    coverImage: null,
    content: `Sau 2 năm hoạt động, quán mở **chi nhánh thứ hai** vào tháng 8. Vì vậy chúng tôi cần thêm nhân sự cho cả 2 điểm bán.

## Vị trí cần tuyển

- **2 nhân viên pha chế (Barista)**: ca sáng hoặc ca chiều, lương *8-12tr/tháng* tùy kinh nghiệm.
- **3 nhân viên phục vụ**: ca chiều 14h-22h, lương *6-8tr/tháng + tip*.

## Yêu cầu chung

Nhanh nhẹn, thân thiện với khách, đi làm đúng giờ. **Ưu tiên** bạn có kinh nghiệm 6 tháng trở lên ở các quán cà phê / trà sữa.

## Quyền lợi

- Đóng BHXH sau 2 tháng thử việc
- Ăn ca miễn phí
- Thưởng doanh số theo tháng
- Nghỉ luân phiên 4 ngày/tháng

## Cách ứng tuyển

Nhắn Zalo **090x.xxx.xxx** (chị Hương — Quản lý) kèm CV ngắn 1 trang. Chúng tôi phản hồi trong 48h.

> **Hạn ứng tuyển:** 25/07/2026 · **Bắt đầu làm việc:** 01/08/2026`,
  },
];

export type SetupStatus = {
  user: { id: string; email: string; name: string | null; role: string } | null;
  adminCount: number;
  postCount: number;
  siteSettingTableExists: boolean;
  menuOverrideTableExists: boolean;
};

async function tableExists(tableName: string): Promise<boolean> {
  try {
    const rows = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      ) AS exists`,
      tableName
    );
    return rows[0]?.exists ?? false;
  } catch {
    return false;
  }
}

export async function getSetupStatus(): Promise<SetupStatus> {
  const session = await auth();
  const userId = session?.user?.id;

  let user: SetupStatus['user'] = null;
  if (userId) {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    if (u) user = { id: u.id, email: u.email, name: u.name, role: u.role };
  }

  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  const [siteSettingTableExists, menuOverrideTableExists] = await Promise.all([
    tableExists('SiteSetting'),
    tableExists('MenuItemOverride'),
  ]);

  let postCount = 0;
  try {
    postCount = await prisma.post.count();
  } catch {
    postCount = 0;
  }

  return { user, adminCount, postCount, siteSettingTableExists, menuOverrideTableExists };
}

export async function runMigration(): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: 'Chưa đăng nhập' };

  try {
    for (const sql of MIGRATION_SQL) {
      await prisma.$executeRawUnsafe(sql);
    }
    return { ok: true, message: 'Đã tạo 2 bảng SiteSetting và MenuItemOverride (nếu chưa có).' };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

export async function promoteMeToAdmin(): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: 'Chưa đăng nhập' };

  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount > 0) {
    const me = await prisma.user.findUnique({ where: { id: userId } });
    if (me?.role !== 'ADMIN') {
      return {
        ok: false,
        message:
          'Đã có ADMIN khác trong hệ thống. Nhờ ADMIN hiện tại nâng quyền cho bạn qua trang /dashboard/users.',
      };
    }
    return { ok: true, message: 'Bạn đã là ADMIN rồi.' };
  }

  await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } });
  return {
    ok: true,
    message: 'Đã nâng bạn thành ADMIN đầu tiên. Vui lòng đăng xuất/đăng nhập lại để RBAC cập nhật.',
  };
}

export async function seedSamplePosts(): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: 'Chưa đăng nhập' };

  try {
    let created = 0;
    let skipped = 0;
    for (const p of SAMPLE_POSTS) {
      const existing = await prisma.post.findUnique({ where: { slug: p.slug } });
      if (existing) {
        skipped++;
        continue;
      }
      await prisma.post.create({
        data: {
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          coverImage: p.coverImage ?? null,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          authorId: userId,
        },
      });
      created++;
    }
    return {
      ok: true,
      message: `Đã thêm ${created} bài viết. Bỏ qua ${skipped} bài đã tồn tại (theo slug).`,
    };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}
