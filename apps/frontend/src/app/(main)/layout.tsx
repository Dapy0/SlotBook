import { Header } from '@/components/layout/Header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-dvh flex-col">
      <Header
        navBtns={[{ variant: 'link', linkHref: '/categories', value: 'Categories' }]}
        rightBtns={[
          { variant: 'ghost', linkHref: '/login', value: 'Login In' },
          { variant: 'outline', linkHref: '/register', value: 'Register' },
        ]}
      />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl p-8">{children}</div>
      </main>
    </div>
  );
}
