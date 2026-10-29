import { CANCEL_REASON_PRESETS } from "@slotbook/shared";

type CancelReasonPreset = (typeof CANCEL_REASON_PRESETS)[number];

export const CANCEL_REASON_LABELS: Record<CancelReasonPreset, string> = {
  STAFF_UNAVAILABLE: "Staff is unavailable",
  VENUE_CLOSED: "Venue is closed",
  DOUBLE_BOOKING: "Double booking",
  CLIENT_REQUEST: "Client asked to cancel",
};

function isCancelReasonPreset(value: string): value is CancelReasonPreset {
  return value in CANCEL_REASON_LABELS;
}
export function formatCancelReason(reason: string | null): string | null {
  if (!reason) return null;
  if (!isCancelReasonPreset(reason)) return reason;

  return CANCEL_REASON_LABELS[reason];
}
