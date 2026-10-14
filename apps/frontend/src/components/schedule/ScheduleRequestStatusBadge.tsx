import type { ScheduleRequestStatus } from "@slotbook/shared";

const TONE: Record<ScheduleRequestStatus, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  withdrawn: "bg-muted text-muted-foreground",
};

export function ScheduleRequestStatusBadge({ status }: { status: ScheduleRequestStatus }) {
  return (
    <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[status]}`}>
      {status}
    </span>
  );
}
