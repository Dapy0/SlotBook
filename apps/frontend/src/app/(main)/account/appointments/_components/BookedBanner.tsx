"use client";
import { Button } from "@/components/ui/button";
import { CircleCheck, X } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

// Stays until the client dismisses it: this is the end of the booking journey.
export function BookedBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="flex enter items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4"
    >
      <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
      <div className="flex-1">
        <p className="font-semibold">Your time is reserved</p>
        <p className="text-sm text-muted-foreground">
          The venue will confirm it soon. You&apos;ll see the status change here.
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Dismiss"
        onClick={() => {
          setVisible(false);
          router.replace(pathname as Route, { scroll: false });
        }}
      >
        <X />
      </Button>
    </div>
  );
}
