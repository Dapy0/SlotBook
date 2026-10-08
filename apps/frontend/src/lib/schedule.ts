import type { Weekday } from "@slotbook/shared";

export const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

type Entry = { dayOfTheWeek: Weekday; startTime: string; endTime: string };

// [{1,"15:00:00","19:00:00"},{1,"10:00:00","14:00:00"}], 1 → "10:00–14:00, 15:00–19:00"
export function formatDayShifts(entries: Entry[], day: Weekday): string | null {
  const shifts = entries
    .filter((e) => e.dayOfTheWeek === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((e) => `${e.startTime.slice(0, 5)}–${e.endTime.slice(0, 5)}`);
  return shifts.length > 0 ? shifts.join(", ") : null;
}
