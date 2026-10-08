import { cn } from "@/lib/utils";
import type { BookingStatus } from "@slotbook/shared";

type DisplayStatus = BookingStatus | "completed";

// Status colors follow DESIGN.md: pending = warning, confirmed = success, canceled = muted.
const STATUS: Record<DisplayStatus, { label: string; className: string }> = {
  pending: {
    label: "Waiting for confirmation",
    className: "border-warning/30 bg-warning/10 text-warning",
  },
  confirmed: { label: "Confirmed", className: "border-success/30 bg-success/10 text-success" },
  canceled: { label: "Canceled", className: "border-border bg-muted text-muted-foreground" },
  completed: { label: "Completed", className: "border-border bg-card text-foreground" },
};

export function StatusBadge({
  status,
  short = false,
  className,
}: {
  status: DisplayStatus;
  short?: boolean;
  className?: string;
}) {
  const { label, className: tone } = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold whitespace-nowrap",
        tone,
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {short && status === "pending" ? "Pending" : label}
    </span>
  );
}
