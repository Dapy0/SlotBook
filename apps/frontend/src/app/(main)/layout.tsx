import { Header } from '@/components/header/Header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div lang="en">
      <Header />
      {children}
    </div>
  );
}
