'use client';
import ProfileMenu from '@/components/layout/ProfileMenu';
import { Button, type buttonVariants } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { getCookie, getLocation } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { Suspense, use, useEffect, useState } from 'react';

const supportedCounties = [
  { label: '🌍', value: null },
  { label: 'Poland', value: 'PL' },
  { label: 'Germany', value: 'GE' },
  { label: 'Moldova', value: 'MD' },
  { label: 'Romania', value: 'RO' },
];

export function Header({
  navBtns,
  rightBtns,
}: {
  navBtns?: (VariantProps<typeof buttonVariants> & { linkHref: string | null; value: string })[];
  rightBtns?: (VariantProps<typeof buttonVariants> & { linkHref: string | null; value: string })[];
}) {
  const { user, isLoading, logout } = useAuth();
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    getLocation().then((vale) => setLocation(vale.country));
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-background border-border  border-b">
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
          <Suspense fallback={<div>Loading...</div>}>
            <Select
              items={supportedCounties}
              onValueChange={(val) => {
                if (!val) return;
                document.cookie = `_sb_country=${val}`;
              }}
              value={location ?? null}
            >
              <SelectTrigger className="w-full max-w-48 [&_svg]:hidden!">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  {supportedCounties.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Suspense>
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
