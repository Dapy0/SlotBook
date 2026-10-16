"use client";
import { useState } from "react";
import { CANCEL_REASON_PRESETS } from "@slotbook/shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { CANCEL_REASON_LABELS } from "@/lib/cancelReasons";
import { updateBookingStatus } from "@/services/booking";

type CancelReasonPreset = (typeof CANCEL_REASON_PRESETS)[number];

const MAX_REASON = 200;

type Props = {
  bookingId: string;
  clientName: string;
  onDone: () => void;
  onClose: () => void;
};

export function CancelBookingDialog({ bookingId, clientName, onDone, onClose }: Props) {
  const [preset, setPreset] = useState<CancelReasonPreset | null>(null);
  const [text, setText] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = text.trim();
  const presetLabel = preset ? CANCEL_REASON_LABELS[preset] : null;
  const reason = trimmed ? (presetLabel ? `${presetLabel}. ${trimmed}` : trimmed) : (preset ?? "");
  const canSubmit = reason.length > 0;

  async function handleCancel() {
    if (!canSubmit || isPending) return;
    setIsPending(true);
    setError(null);
    try {
      await updateBookingStatus(bookingId, { status: "canceled", reason });
      onDone();
    } catch (err) {
      if (err instanceof ApiError) {
        setError("Add a reason so the client knows why.");
      } else if (err instanceof ApiError && err.code === "CONFLICT") {
        setError("This booking can't be canceled anymore. The list will refresh.");
        onDone();
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't cancel. Check your connection and try again.",
        );
      }
      setIsPending(false);
    }
  }

  return (
    <div
      role="group"
      aria-labelledby="cancel-title"
      onKeyDown={(e) => {
        if (e.key === "Escape" && !isPending) onClose();
      }}
      className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 id="cancel-title" className="font-heading text-lg font-semibold">
          Cancel booking for {clientName}?
        </h2>
        <p className="text-sm text-muted-foreground">The client will see the reason.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CANCEL_REASON_PRESETS.map((key, i) => (
          <Button
            key={key}
            type="button"
            size="sm"
            autoFocus={i === 0}
            variant={preset === key ? "default" : "outline"}
            aria-pressed={preset === key}
            onClick={() => setPreset(preset === key ? null : key)}
          >
            {CANCEL_REASON_LABELS[key]}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cancel-reason">Message to the client (optional)</Label>
        <textarea
          id="cancel-reason"
          value={text}
          maxLength={MAX_REASON}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <span className="self-end text-xs text-muted-foreground">
          {text.length}/{MAX_REASON}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={isPending}>
          Keep booking
        </Button>
        <Button variant="destructive" onClick={handleCancel} disabled={!canSubmit || isPending}>
          {isPending ? "Canceling…" : "Cancel booking"}
        </Button>
      </div>
    </div>
  );
}
