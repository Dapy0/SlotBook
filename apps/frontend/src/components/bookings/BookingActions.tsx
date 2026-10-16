"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BookingStatus } from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { updateBookingStatus } from "@/services/booking";
import { CancelBookingDialog } from "./CancelBookingDialog";

type Props = {
  bookingId: string;
  status: BookingStatus;
  clientName: string;
};

export function BookingActions({ bookingId, status, clientName }: Props) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setIsConfirming(true);
    try {
      await updateBookingStatus(bookingId, { status: "confirmed" });
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }

    setIsConfirming(false);
  }

  function handleCanceled() {
    setIsCancelOpen(false);
    router.refresh();
  }

  if (isCancelOpen) {
    return (
      <CancelBookingDialog
        bookingId={bookingId}
        clientName={clientName}
        onDone={handleCanceled}
        onClose={() => setIsCancelOpen(false)}
      />
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={isConfirming}
          onClick={() => setIsCancelOpen(true)}
        >
          Cancel
        </Button>
        {status === "pending" && (
          <Button size="sm" disabled={isConfirming} onClick={confirm}>
            {isConfirming ? "Confirming…" : "Confirm"}
          </Button>
        )}
      </div>
      {error && (
        <span role="alert" className="text-sm text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
