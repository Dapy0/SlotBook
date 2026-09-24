// app/(main)/account/appointments/_components/BookedBanner.tsx
"use client";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function BookedBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      router.replace(pathname as Route, { scroll: false });
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
      Booking created! It is waiting for confirmation from the venue.
    </div>
  );
}
