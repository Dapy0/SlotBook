import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-6 py-14">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
