import { Header } from '@/components/layout/Header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div lang="en">
      <Header
        navBtns={[{ variant: 'link', linkHref: '/categories', value: 'Categories' }]}
        rightBtns={[
          { variant: 'ghost', linkHref: '/login', value: 'Login In' },
          { variant: 'outline', linkHref: '/register', value: 'Register' },
        ]}
      />
      <div className="flex flex-1 items-center justify-center p-8 w-full max-w-6xl mx-auto ">
        {children}
      </div>
    </div>
  );
}
