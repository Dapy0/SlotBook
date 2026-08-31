'use client';
import ProfileMenu from '@/components/layout/ProfileMenu';
import { Button, type buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/lib/authContext';
import type { VariantProps } from 'class-variance-authority';
import Link from 'next/link';

export function Header({
  navBtns,
  rightBtns,
}: {
  navBtns?: (VariantProps<typeof buttonVariants> & { linkHref: string | null; value: string })[];
  rightBtns?: (VariantProps<typeof buttonVariants> & { linkHref: string | null; value: string })[];
}) {
  const { user, isLoading, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 bg-background border-border  border-b">
      <div className="flex justify-between align-center gap-4 p-4 max-w-7xl my-0 mx-auto">
        <button className=" bg-none border-0 p-0 cursor-pointer font-sans font-bold text-xl tracking-tight text-">
          <Link href={'/'}>
            slot
            <span className="text-primary">book</span>
          </Link>
        </button>
        <nav className="flex gap-4 ml-auto ">
          {navBtns?.map((btn) => (
            <Button key={btn.linkHref} variant={btn.variant}>
              {' '}
              <Link href={btn.linkHref ?? ''}>{btn.value}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex gap-2 ml-auto items-center">
          {!isLoading && user ? (
            <ProfileMenu user={user} profilePicture={''} onLogout={logout} />
          ) : (
            rightBtns?.map((btn) => (
              <Button key={btn.linkHref} variant={btn.variant}>
                {' '}
                <Link href={btn.linkHref ?? ''}>{btn.value}</Link>
              </Button>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
