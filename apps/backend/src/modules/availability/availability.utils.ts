import { fromZonedTime } from "date-fns-tz";

export type Interval = { start: Date; end: Date };
export type ScheduleRow = { dayOfTheWeek: number; startTime: string; endTime: string };
// [
//   { start: "11:10", end: "12:10" },
//   { start: "12:20", end: "12:40" },
// ];
// {start: "12:00", end: "12:30"}

export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function intersectIntervals(a: Interval[], b: Interval[]): Interval[] {
  const res: Interval[] = [];
  for (const x of a) {
    for (const y of b) {
      const start = x.start > y.start ? x.start : y.start;
      const end = x.end < y.end ? x.end : y.end;
      if (start < end) res.push({ start, end });
    }
  }
  return res;
}
export function deleteIntersectedIntervals(a: Interval[], b: Interval[]): Interval[] {
  const newIntervals = [];
  for (const x of a) {
    for (const y of b) {
      const isOverlapping = x.start >= y.start;
      if (!isOverlapping) newIntervals.push(x);
    }
  }
  return newIntervals;
}
export function scheduleRowsToIntervals(
  rows: ScheduleRow[],
  date: string,
  weekday: number,
  timeZone: string,
): Interval[] {
  return rows
    .filter((row) => row.dayOfTheWeek === weekday)
    .map((row) => ({
      start: fromZonedTime(`${date}T${row.startTime}`, timeZone),
      end: fromZonedTime(`${date}T${row.endTime}`, timeZone),
    }));
}

export function sliceIntoSlots(
  interval: Interval,
  durationMinutes: number,
  stepMinutes: number,
): Interval[] {
  const slots: Interval[] = [];

  const durationMs = durationMinutes * 60_000;
  const stepMs = stepMinutes * 60_000;
  const end = interval.end.getTime();
  for (let t = interval.start.getTime(); t + durationMs <= end; t += stepMs) {
    slots.push({ start: new Date(t), end: new Date(t + durationMs) });
  }
  return slots;
}
