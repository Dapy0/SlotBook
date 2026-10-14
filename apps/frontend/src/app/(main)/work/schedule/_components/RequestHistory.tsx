import type { ScheduleRequestResponse, StaffScheduleEntryResponse } from "@slotbook/shared";
import { ScheduleRequestStatusBadge } from "@/components/schedule/ScheduleRequestStatusBadge";
import { formatDayShifts, WEEKDAYS } from "@/lib/schedule";

const DECIDED_LABEL = {
  approved: "Approved",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  pending: "Sent",
} as const;

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
type Props = {
  requests: ScheduleRequestResponse[];
  currentSchedule: StaffScheduleEntryResponse[];
};

export function RequestHistory({ requests, currentSchedule }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-muted-foreground">Past requests</h3>

      <ul className="divide-y rounded-xl border bg-card">
        {requests.map((r) => {
          const workingDays = new Set(r.entries.map((e) => e.dayOfTheWeek)).size;
          const changedDays = WEEKDAYS.map((day) => ({
            day,
            now: formatDayShifts(currentSchedule, day.value),
            requested: formatDayShifts(r.entries, day.value),
          })).filter((d) => d.now !== d.requested);
          return (
            <li key={r.id} className="flex flex-col gap-2 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ScheduleRequestStatusBadge status={r.status} />
                  <span className="text-sm text-muted-foreground nums">
                    {workingDays} working {workingDays === 1 ? "day" : "days"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground nums">
                  Sent {formatDate(r.createdAt)}
                  {r.decidedAt && ` · ${DECIDED_LABEL[r.status]} ${formatDate(r.decidedAt)}`}
                </p>
              </div>

              {r.status === "rejected" && r.ownerComment && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
                  <span className="font-medium">Owner: </span>
                  {r.ownerComment}
                </p>
              )}

              {r.staffNote && (
                <p className="text-sm text-muted-foreground">Your note: {r.staffNote}</p>
              )}

              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Show requested hours
                </summary>
                {changedDays.length === 0 ? (
                  <p className="mt-2 text-muted-foreground">Same as your current hours.</p>
                ) : (
                  <dl className="mt-2 grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-1">
                    <dt className="text-xs text-muted-foreground">Day</dt>
                    <dd className="text-xs text-muted-foreground">Now</dd>
                    <dd className="text-xs text-muted-foreground">Requested</dd>
                    {changedDays.map(({ day, now, requested }) => (
                      <div key={day.value} className="contents">
                        <dt>{day.label}</dt>
                        <dd className="text-muted-foreground nums">{now ?? "Off"}</dd>
                        <dd className="font-semibold nums">{requested ?? "Off"}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
