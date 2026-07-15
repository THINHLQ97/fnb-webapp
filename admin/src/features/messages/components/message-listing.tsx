'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  markAsRead,
  markAllAsRead,
  deleteMessage,
  saveMessageNote,
} from '../api/service';

export type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  note: string | null;
  createdAt: Date;
};

type Props = {
  initialMessages: Message[];
  initialUnreadCount: number;
  total: number;
};

const dateFmt = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function MessageListing({ initialMessages, initialUnreadCount, total }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function toggleExpand(id: string) {
    setExpanded(expanded === id ? null : id);
  }

  function handleToggleRead(m: Message) {
    startTransition(async () => {
      await markAsRead(m.id, !m.read);
      setMessages((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, read: !m.read } : x))
      );
      setUnreadCount((n) => (m.read ? n + 1 : Math.max(0, n - 1)));
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllAsRead();
      setMessages((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Xóa tin nhắn này? Thao tác không thể hoàn tác.')) return;
    startTransition(async () => {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((x) => x.id !== id));
    });
  }

  function handleSaveNote(id: string) {
    const note = noteDraft[id] ?? '';
    startTransition(async () => {
      await saveMessageNote(id, note);
      setMessages((prev) => prev.map((x) => (x.id === id ? { ...x, note: note || null } : x)));
    });
  }

  if (messages.length === 0) {
    return (
      <div className='rounded-md border border-dashed p-8 text-center text-muted-foreground'>
        Chưa có tin nhắn nào từ khách. Khi có khách gửi form ở{' '}
        <code>fnb-webapp.vibe.matbao.net/contact</code>, tin nhắn sẽ xuất hiện ở đây.
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          {total} tin nhắn · <strong>{unreadCount} chưa đọc</strong>
        </p>
        {unreadCount > 0 && (
          <Button variant='outline' size='sm' onClick={handleMarkAllRead} disabled={isPending}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <div className='space-y-2'>
        {messages.map((m) => {
          const isExpanded = expanded === m.id;
          return (
            <div
              key={m.id}
              className={`rounded-lg border transition-colors ${
                m.read ? 'bg-background' : 'bg-blue-50/50 border-blue-200'
              }`}
            >
              <div
                className='flex cursor-pointer items-start justify-between gap-4 p-4'
                onClick={() => toggleExpand(m.id)}
              >
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    {!m.read && <Badge>Mới</Badge>}
                    <span className='font-medium'>{m.name}</span>
                    <span className='text-sm text-muted-foreground truncate'>{m.email}</span>
                    {m.phone && (
                      <span className='text-sm text-muted-foreground'>· {m.phone}</span>
                    )}
                  </div>
                  <p className='mt-1 text-sm text-muted-foreground line-clamp-1'>{m.message}</p>
                </div>
                <div className='shrink-0 text-right'>
                  <p className='text-xs text-muted-foreground'>
                    {dateFmt.format(new Date(m.createdAt))}
                  </p>
                </div>
              </div>

              {isExpanded && (
                <div className='border-t bg-muted/20 p-4 space-y-4'>
                  <div>
                    <p className='mb-1 text-xs font-medium text-muted-foreground uppercase'>
                      Nội dung
                    </p>
                    <p className='whitespace-pre-wrap text-sm'>{m.message}</p>
                  </div>

                  <div>
                    <p className='mb-1 text-xs font-medium text-muted-foreground uppercase'>
                      Ghi chú nội bộ
                    </p>
                    <textarea
                      className='w-full rounded border border-border bg-background p-2 text-sm outline-none focus:border-primary'
                      rows={2}
                      value={noteDraft[m.id] ?? m.note ?? ''}
                      onChange={(e) => setNoteDraft({ ...noteDraft, [m.id]: e.target.value })}
                      placeholder='VD: Đã gọi lại 10h30 — hẹn tuần sau'
                    />
                    <div className='mt-1 flex justify-end'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleSaveNote(m.id)}
                        disabled={isPending}
                      >
                        Lưu ghi chú
                      </Button>
                    </div>
                  </div>

                  <div className='flex items-center justify-between gap-2 border-t pt-3'>
                    <div className='flex gap-2'>
                      <a
                        href={`mailto:${m.email}`}
                        className='inline-flex items-center gap-1 text-sm text-primary hover:underline'
                      >
                        <Icons.mail className='h-4 w-4' />
                        Reply email
                      </a>
                      {m.phone && (
                        <a
                          href={`tel:${m.phone}`}
                          className='inline-flex items-center gap-1 text-sm text-primary hover:underline'
                        >
                          <Icons.phone className='h-4 w-4' />
                          Gọi
                        </a>
                      )}
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleToggleRead(m)}
                        disabled={isPending}
                      >
                        {m.read ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDelete(m.id)}
                        disabled={isPending}
                      >
                        <Icons.trash className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
