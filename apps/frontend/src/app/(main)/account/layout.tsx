'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CameraIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/account/appointments', label: 'Bookings' },
  { href: '/account/gift-cards', label: 'Gift Cards' },
  { href: '/account/loyalty', label: 'Loyalty Cards' },
  { href: '/account/favorites', label: 'Favorites' },
  { href: '/account/settings', label: 'Account Settings' },
  { href: '/account/reviews', label: 'Reviews' },
  { href: '/account/payments', label: 'Payments' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex w-full gap-10 px-6 py-8">
      <aside className="w-64 shrink-0 border-r border-gray-100 pr-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex size-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="size-7">
              <circle cx="12" cy="8" r="4" strokeWidth={1.5} />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" strokeWidth={1.5} />
            </svg>
            <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-white text-gray-500 shadow ring-1 ring-gray-200">
              <CameraIcon size={12} />
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Daniel Pyzinski</p>
            <p className="text-xs text-gray-500">+48 572 527 627</p>
          </div>
        </div>

        <nav className="flex flex-col mb-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-l-2 px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'border-primary font-medium text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button className={'w-full py-5'}>
          <Link href={'/create'}>Create a venue</Link>
        </Button>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
