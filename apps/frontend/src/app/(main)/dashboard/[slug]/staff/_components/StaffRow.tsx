import type { ManagedStaffMemberResponse, Weekday } from "@slotbook/shared";
import { Badge } from "@/components/ui/badge";
import { StaffActions } from "./StaffActions";

const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 1, label: "Mo" },
  { value: 2, label: "Tu" },
  { value: 3, label: "We" },
  { value: 4, label: "Th" },
  { value: 5, label: "Fr" },
  { value: 6, label: "Sa" },
  { value: 7, label: "Su" },
];

type Props = {
  facilityId: string;
  member: ManagedStaffMemberResponse;
  serviceNames: string[];
  onOpenServices: () => void;
  onOpenSchedule: () => void;
};

export function StaffRow({
  facilityId,
  member,
  serviceNames,
  onOpenServices,
  onOpenSchedule,
}: Props) {
  const { id, name, email, isActive, workDays } = member;
  const workDaySet = new Set(workDays);

  return (
    <div
      className={`grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center ${
        isActive ? "" : "bg-muted/50"
      }`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`m-0 font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
            {name}
          </p>
          {!isActive && (
            <Badge variant="outline" className="border-border bg-muted text-xs text-muted-foreground">
              Former staff
            </Badge>
          )}
        </div>
        <p className="m-0 truncate text-sm text-muted-foreground">{email}</p>
        <p className="m-0 line-clamp-1 text-sm text-muted-foreground">
          {serviceNames.length === 0 ? (
            <span className="text-muted-foreground">No services assigned</span>
          ) : (
            serviceNames.join(" · ")
          )}
        </p>
        <ul className="mt-1 flex gap-1" aria-label="Work days">
          {WEEKDAYS.map((day) => {
            const works = workDaySet.has(day.value);
            return (
              <li
                key={day.value}
                title={works ? "Working day" : "Day off"}
                className={`flex size-7 items-center justify-center rounded-md text-xs font-medium ${
                  works ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {day.label}
                <span className="sr-only">{works ? ": working" : ": day off"}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <StaffActions
        facilityId={facilityId}
        staffId={id}
        name={name}
        isActive={isActive}
        onOpenServices={onOpenServices}
        onOpenSchedule={onOpenSchedule}
      />
    </div>
  );
}
