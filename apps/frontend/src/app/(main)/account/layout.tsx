"use client";

import { useAuth } from "@/lib/authContext";

// Only pages that exist are linked; reviews, payments and settings are not built yet.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="flex w-full flex-col gap-8">
      {user && (
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-12 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-primary-foreground"
          >
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
