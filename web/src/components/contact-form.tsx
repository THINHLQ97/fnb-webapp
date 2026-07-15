'use client';

import { useActionState } from 'react';
import { submitContactMessage, type ContactFormState } from '@/lib/contact';

const initial: ContactFormState = null;

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactMessage, initial);

  return (
    <form action={formAction} className='mt-6 space-y-4'>
      <div>
        <label htmlFor='name' className='mb-1 block text-sm font-medium'>
          Họ tên <span className='text-red-500'>*</span>
        </label>
        <input
          id='name'
          name='name'
          type='text'
          required
          className='w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary'
          placeholder='Nguyễn Văn A'
        />
      </div>

      <div>
        <label htmlFor='email' className='mb-1 block text-sm font-medium'>
          Email <span className='text-red-500'>*</span>
        </label>
        <input
          id='email'
          name='email'
          type='email'
          required
          className='w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary'
          placeholder='email@example.com'
        />
      </div>

      <div>
        <label htmlFor='phone' className='mb-1 block text-sm font-medium'>
          Số điện thoại
        </label>
        <input
          id='phone'
          name='phone'
          type='tel'
          className='w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary'
          placeholder='09xx xxx xxx (tùy chọn)'
        />
      </div>

      <div>
        <label htmlFor='message' className='mb-1 block text-sm font-medium'>
          Tin nhắn <span className='text-red-500'>*</span>
        </label>
        <textarea
          id='message'
          name='message'
          rows={4}
          required
          maxLength={2000}
          className='w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary'
          placeholder='Nội dung tin nhắn...'
        />
      </div>

      {state && (
        <p
          className={`rounded-md p-3 text-sm ${
            state.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type='submit'
        disabled={isPending}
        className='w-full rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60'
      >
        {isPending ? 'Đang gửi...' : 'Gửi tin nhắn'}
      </button>
    </form>
  );
}
