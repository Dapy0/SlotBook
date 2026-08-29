import { Header } from '@/components/layout/Header';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header rightBtns={[{ variant: 'outline', linkHref: '/categories', value: 'Categories' }]} />
      <div className="flex flex-1 items-center justify-center p-8 w-full max-w-7xl mx-auto ">{children}</div>
    </div>
  );
}
