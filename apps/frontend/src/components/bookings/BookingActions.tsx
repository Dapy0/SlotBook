"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BookingStatus } from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { updateBookingStatus } from "@/services/booking";
import { ApiError } from "@/lib/api";

type Props = {
  bookingId: string;
  status: BookingStatus;
};

export function BookingActions({ bookingId, status }: Props) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<"confirmed" | "canceled" | null>(null);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(to: "confirmed" | "canceled") {
    setPendingAction(to);
    setError(null);

    try {
      await updateBookingStatus(bookingId, to);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update the booking. Try again.");
    } finally {
      setPendingAction(null);
      setIsConfirmingCancel(false);
      router.refresh();
    }
  }

  const isBusy = pendingAction !== null;

  return (
    <div className="flex flex-col items-end gap-1">
      {isConfirmingCancel ? (
        <div
          className="flex enter flex-wrap items-center justify-end gap-2"
          role="group"
          aria-label="Confirm cancellation"
        >
          <span className="text-sm font-medium">Cancel for the client?</span>
          <Button
            size="sm"
            variant="outline"
            disabled={isBusy}
            onClick={() => setIsConfirmingCancel(false)}
          >
            Keep
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={isBusy}
            onClick={() => change("canceled")}
          >
            {pendingAction === "canceled" ? "Canceling…" : "Yes, cancel"}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={isBusy}
            onClick={() => setIsConfirmingCancel(true)}
          >
            Cancel
          </Button>
          {status === "pending" && (
            <Button size="sm" disabled={isBusy} onClick={() => change("confirmed")}>
              {pendingAction === "confirmed" ? "Confirming…" : "Confirm"}
            </Button>
          )}
        </div>
      )}
      {error && (
        <span role="alert" className="text-sm text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
