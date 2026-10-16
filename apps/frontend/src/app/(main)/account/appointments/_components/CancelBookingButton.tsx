"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { formatTimeToTimezone } from "@/lib/format";
import { updateBookingStatus } from "@/services/booking";

// TODO K1: details с бэка имеет тип unknown. Опиши схему { cancelableUntil } и разбирай через safeParse.
//   Почему не `err.details as { cancelableUntil: string }`?
//   Что лежит в JSON на самом деле: строка или Date?
const windowClosedDetailsSchema = z.object({});

type Props = {
  bookingId: string;
  facilityTimezone: string;
};

// Inline two-step confirmation instead of a browser dialog.
export function CancelBookingButton({ bookingId, facilityTimezone }: Props) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setIsPending(true);
    setError(null);
    try {
      await updateBookingStatus(bookingId, { status: "canceled" });
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
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
