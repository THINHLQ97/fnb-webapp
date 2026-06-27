import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className='relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,var(--color-primary)/0.08,transparent_60%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,var(--color-accent)/0.06,transparent_50%)]' />

      <div className='container-main relative z-10 py-20 text-center'>
        <span className='mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary'>
          Chào mừng đến với F&B Store
        </span>

        <h1 className='mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl'>
          Thức uống ngon,{' '}
          <span className='bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
            mỗi ngày
          </span>
        </h1>

        <p className='mx-auto mt-6 max-w-xl text-lg text-muted'>
          Khám phá menu phong phú với các loại trà, cà phê, nước ép và nhiều thức uống hấp dẫn khác.
          Nguyên liệu tươi ngon, phục vụ tận tâm.
        </p>

        <div className='mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row'>
          <Link
            href='/menu'
            className='inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30'
          >
            Xem Menu
            <ArrowRight className='h-4 w-4' />
          </Link>
          <Link
            href='/contact'
            className='inline-flex items-center gap-2 rounded-full border border-border px-8 py-3 font-semibold transition-colors hover:bg-border'
          >
            Liên hệ
          </Link>
        </div>
      </div>
    </section>
  );
}
