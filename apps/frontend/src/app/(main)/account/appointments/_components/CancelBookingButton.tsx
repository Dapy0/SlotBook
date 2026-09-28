"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { updateBookingStatus } from "@/services/booking";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!window.confirm("Cancel Booking?")) return;
    setIsPending(true);
    setError(null);
    try {
      await updateBookingStatus(bookingId, "canceled");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось отменить");
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <Button
        variant="outline"
        className="font-medium text-red-500"
        disabled={isPending}
        onClick={handleCancel}
      >
        {isPending ? "Canceling…" : "Cancel"}
      </Button>
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
}
