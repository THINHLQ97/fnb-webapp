'use server';

import { prisma } from './prisma';

export type ContactFormState = {
  ok: boolean;
  message: string;
} | null;

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  if (!name || !email || !message) {
    return { ok: false, message: 'Vui lòng nhập họ tên, email và nội dung tin nhắn.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: 'Email không hợp lệ.' };
  }
  if (message.length > 2000) {
    return { ok: false, message: 'Nội dung quá dài (giới hạn 2000 ký tự).' };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        message,
      },
    });
    return {
      ok: true,
      message: 'Đã gửi tin nhắn! Chúng tôi sẽ liên hệ lại sớm nhất có thể.',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('does not exist') || msg.includes('relation')) {
      return {
        ok: false,
        message:
          'Hệ thống chưa sẵn sàng nhận tin nhắn. Vui lòng gọi điện trực tiếp hoặc thử lại sau.',
      };
    }
    console.error('[contact/submit]', msg);
    return { ok: false, message: 'Có lỗi khi gửi tin nhắn. Vui lòng thử lại.' };
  }
}
