'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  runMigration,
  promoteMeToAdmin,
  seedSamplePosts,
  type SetupStatus,
} from '../api/service';

type StepResult = { ok: boolean; message: string } | null;

export function SetupPanel({ initialStatus }: { initialStatus: SetupStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [migrationResult, setMigrationResult] = useState<StepResult>(null);
  const [promoteResult, setPromoteResult] = useState<StepResult>(null);
  const [seedResult, setSeedResult] = useState<StepResult>(null);
  const [isPending, startTransition] = useTransition();

  function refetchStatus() {
    // Đơn giản: reload trang để đọc lại status server-side
    setTimeout(() => window.location.reload(), 1500);
  }

  function doMigration() {
    setMigrationResult(null);
    startTransition(async () => {
      const r = await runMigration();
      setMigrationResult(r);
      if (r.ok) {
        setStatus({ ...status, siteSettingTableExists: true, menuOverrideTableExists: true });
      }
    });
  }

  function doPromote() {
    setPromoteResult(null);
    startTransition(async () => {
      const r = await promoteMeToAdmin();
      setPromoteResult(r);
      if (r.ok) refetchStatus();
    });
  }

  function doSeed() {
    setSeedResult(null);
    startTransition(async () => {
      const r = await seedSamplePosts();
      setSeedResult(r);
      if (r.ok) refetchStatus();
    });
  }

  const { user, adminCount, postCount, siteSettingTableExists, menuOverrideTableExists } = status;

  const canPromote = adminCount === 0 && !!user;
  const alreadyAdmin = user?.role === 'ADMIN';

  return (
    <div className='space-y-6 max-w-3xl'>
      {/* Status overview */}
      <section className='rounded-lg border p-5 space-y-3'>
        <h2 className='font-semibold'>Trạng thái hệ thống</h2>
        <div className='grid grid-cols-2 gap-3 text-sm'>
          <StatusRow label='Người dùng hiện tại' value={user ? `${user.name ?? user.email}` : '—'} />
          <StatusRow
            label='Vai trò'
            value={<Badge variant={alreadyAdmin ? 'default' : 'secondary'}>{user?.role ?? '—'}</Badge>}
          />
          <StatusRow
            label='Số ADMIN trong hệ thống'
            value={<span className={adminCount === 0 ? 'text-amber-600 font-semibold' : ''}>{adminCount}</span>}
          />
          <StatusRow label='Số bài viết Post' value={postCount} />
          <StatusRow
            label='Bảng SiteSetting'
            value={
              <Badge variant={siteSettingTableExists ? 'default' : 'destructive'}>
                {siteSettingTableExists ? 'Đã tồn tại' : 'Chưa có'}
              </Badge>
            }
          />
          <StatusRow
            label='Bảng MenuItemOverride'
            value={
              <Badge variant={menuOverrideTableExists ? 'default' : 'destructive'}>
                {menuOverrideTableExists ? 'Đã tồn tại' : 'Chưa có'}
              </Badge>
            }
          />
        </div>
      </section>

      {/* Step 1: Migration */}
      <SetupStep
        num={1}
        title='Tạo 2 bảng mới trong Postgres'
        description='Chạy CREATE TABLE IF NOT EXISTS cho SiteSetting + MenuItemOverride. An toàn để bấm nhiều lần.'
        buttonLabel={
          siteSettingTableExists && menuOverrideTableExists ? 'Chạy lại migration' : 'Chạy migration'
        }
        onClick={doMigration}
        disabled={isPending}
        done={siteSettingTableExists && menuOverrideTableExists}
        result={migrationResult}
      />

      {/* Step 2: Promote to ADMIN */}
      <SetupStep
        num={2}
        title='Nâng tài khoản hiện tại lên ADMIN'
        description={
          adminCount === 0
            ? 'Chưa có ADMIN nào — bấm để tự nâng quyền tài khoản đang đăng nhập.'
            : alreadyAdmin
              ? 'Bạn đã là ADMIN.'
              : 'Đã có ADMIN khác. Nhờ họ nâng quyền cho bạn qua /dashboard/users.'
        }
        buttonLabel='Nâng lên ADMIN'
        onClick={doPromote}
        disabled={isPending || !canPromote}
        done={alreadyAdmin}
        result={promoteResult}
      />

      {/* Step 3: Seed sample posts */}
      <SetupStep
        num={3}
        title='Thêm 3 bài viết mẫu'
        description='Insert 3 bài blog F&B mẫu (upsert theo slug, không ghi đè bài có sẵn).'
        buttonLabel='Thêm bài mẫu'
        onClick={doSeed}
        disabled={isPending || !user}
        done={postCount >= 3}
        result={seedResult}
      />

      <div className='rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900'>
        <p className='font-medium'>Sau khi hoàn tất</p>
        <ul className='mt-2 list-disc pl-5 space-y-1'>
          <li>Nếu vừa nâng ADMIN: <strong>đăng xuất và đăng nhập lại</strong> để sidebar hiện đủ nav.</li>
          <li>
            Vào <a href='/dashboard/settings' className='underline'>Cấu hình website</a> để chỉnh hero
            / liên hệ / footer.
          </li>
          <li>
            Vào <a href='/dashboard/menu' className='underline'>Menu KiotViet</a> để thêm tag / Best
            seller cho sản phẩm.
          </li>
          <li>
            Kiểm tra kết quả trên{' '}
            <a
              href='https://fnb-webapp.vibe.matbao.net/blog'
              target='_blank'
              rel='noreferrer'
              className='underline'
            >
              website public
            </a>
            {' '}(ISR 60s, có thể chờ ~1 phút).
          </li>
        </ul>
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-center justify-between rounded bg-muted/30 px-3 py-2'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-medium'>{value}</span>
    </div>
  );
}

function SetupStep({
  num,
  title,
  description,
  buttonLabel,
  onClick,
  disabled,
  done,
  result,
}: {
  num: number;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  disabled: boolean;
  done: boolean;
  result: StepResult;
}) {
  return (
    <section className='rounded-lg border p-5 space-y-3'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                done ? 'bg-green-600' : 'bg-neutral-500'
              }`}
            >
              {done ? '✓' : num}
            </span>
            <h3 className='font-semibold'>{title}</h3>
          </div>
          <p className='mt-2 text-sm text-muted-foreground'>{description}</p>
        </div>
        <Button onClick={onClick} disabled={disabled} variant={done ? 'outline' : 'default'}>
          {buttonLabel}
        </Button>
      </div>

      {result && (
        <p
          className={`rounded p-2 text-sm ${
            result.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {result.message}
        </p>
      )}
    </section>
  );
}
