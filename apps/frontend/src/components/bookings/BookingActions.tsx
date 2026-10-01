"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BookingStatus } from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { updateBookingStatus } from "@/services/booking";
import { ApiError } from '@/lib/api';

type Props = {
  bookingId: string;
  status: BookingStatus;
};

export function BookingActions({ bookingId, status }: Props) {
  const router = useRouter();
  console.log(status);
  const [pendingAction, setPendingAction] = useState<"confirmed" | "canceled" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function change(to: "confirmed" | "canceled") {
    setPendingAction(to);
    setError(null);

    try {
      await updateBookingStatus(bookingId, to);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setPendingAction(null);
      router.refresh();
    }
  }

  const isBusy = pendingAction !== null;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {status === "pending" && (
          <Button size="sm" disabled={isBusy} onClick={() => change("confirmed")}>
            {pendingAction === "confirmed" ? "Confirming…" : "Confirm"}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="text-red-500"
          disabled={isBusy}
          onClick={() => change("canceled")}
        >
          {pendingAction === "canceled" ? "Canceling…" : "Cancel"}
        </Button>
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
