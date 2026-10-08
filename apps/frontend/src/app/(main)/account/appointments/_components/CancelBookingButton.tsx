"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { updateBookingStatus } from "@/services/booking";

// Inline two-step confirmation instead of a browser dialog.
export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setIsPending(true);
    setError(null);
    try {
      await updateBookingStatus(bookingId, "canceled");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't cancel the booking. Check your connection and try again.",
      );
      setIsPending(false);
    }
  }

  if (!isConfirming) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setIsConfirming(true)}>
        Cancel booking
      </Button>
    );
  }

  return (
    <div
      className="flex enter flex-col items-end gap-1.5"
      role="group"
      aria-label="Confirm cancellation"
    >
      <p className="text-sm font-medium">Cancel this booking?</p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => setIsConfirming(false)}
        >
          Keep it
        </Button>
        <Button variant="destructive" size="sm" disabled={isPending} onClick={handleCancel}>
          {isPending ? "Canceling…" : "Yes, cancel"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="max-w-56 text-right text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
