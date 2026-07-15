import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { MessageListing, type Message } from '@/features/messages/components/message-listing';
import { getMessages, isMessagesReady } from '@/features/messages/api/service';

export const metadata = {
  title: 'Dashboard: Tin nhắn từ khách',
};

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const ready = await isMessagesReady();

  if (!ready) {
    return (
      <PageContainer
        pageTitle='Tin nhắn từ khách'
        pageDescription='Tin nhắn khách gửi qua form /contact trên website'
      >
        <div className='max-w-2xl rounded-md border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900'>
          <p className='font-medium'>Chưa sẵn sàng — bảng ContactMessage chưa được tạo.</p>
          <p className='mt-2'>
            Vào{' '}
            <Link href='/dashboard/setup' className='underline font-medium'>
              Khởi tạo hệ thống
            </Link>{' '}
            → bấm <strong>Chạy migration</strong> để tạo bảng.
          </p>
        </div>
      </PageContainer>
    );
  }

  const { messages, total, unreadCount } = await getMessages({ limit: 50 });

  return (
    <PageContainer
      pageTitle='Tin nhắn từ khách'
      pageDescription='Tin nhắn khách gửi qua form /contact trên website'
    >
      <MessageListing
        initialMessages={messages as Message[]}
        initialUnreadCount={unreadCount}
        total={total}
      />
    </PageContainer>
  );
}
