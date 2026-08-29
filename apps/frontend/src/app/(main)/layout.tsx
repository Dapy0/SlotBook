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
      {children}
    </div>
  );
}
