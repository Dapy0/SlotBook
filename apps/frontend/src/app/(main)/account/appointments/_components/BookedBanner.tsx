"use client";
import type { BookingStatus } from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { CircleCheck, X } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function BookedBanner({ status }: { status: BookingStatus }) {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  // TODO I7: тексты по status:
  //   confirmed → "Your booking is confirmed" / "See you there."
  //   pending   → "Your time is reserved" / "The venue will confirm it soon. You'll see the status change here."
  const title =
    status === "confirmed"
      ? "Your booking is confirmed"
      : status === "pending"
        ? "Your time is reserved"
        : "";
  const hint =
    status === "confirmed"
      ? "See you there"
      : status === "pending"
        ? "The venue will confirm it soon. You'll see the status change here."
        : "";

  if (!visible) return null;

  return (
    <div
      role="status"
      className="flex enter items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4"
    >
      <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{hint}</p>
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
