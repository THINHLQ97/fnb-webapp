'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Coffee } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Giới thiệu', href: '/about' },
  { label: 'Liên hệ', href: '/contact' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className='sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md'>
      <div className='container-main flex h-16 items-center justify-between'>
        <Link href='/' className='flex items-center gap-2 text-xl font-bold text-primary'>
          <Coffee className='h-6 w-6' />
          <span>F&B Store</span>
        </Link>

        <nav className='hidden items-center gap-1 md:flex'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-border',
                pathname === item.href
                  ? 'text-primary'
                  : 'text-foreground/70 hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        <div className='flex items-center gap-2 md:hidden'>
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className='rounded-lg p-2 text-foreground/70 hover:bg-border'
            aria-label='Toggle menu'
          >
            {mobileOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className='border-t border-border bg-background px-4 pb-4 md:hidden'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/70 hover:bg-border'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
