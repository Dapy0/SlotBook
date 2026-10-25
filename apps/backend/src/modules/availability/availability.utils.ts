import { fromZonedTime } from "date-fns-tz";

export type Interval = { start: Date; end: Date };
export type ScheduleRow = { dayOfTheWeek: number; startTime: string; endTime: string };

export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}
export function mergeIntervals(intervals: Interval[]): Interval[] {
  const valid = intervals.filter((i) => i.start < i.end);
  const sorted = [...valid].sort((x, y) => x.start.getTime() - y.start.getTime());

  const result: Interval[] = [];
  for (const current of sorted) {
    const last = result[result.length - 1];

    if (last !== undefined && current.start < last.end) {
      if (current.end > last.end) last.end = current.end;
    } else {
      result.push({ start: current.start, end: current.end });
    }
  }
  return result;
}
export function intersectIntervals(a: Interval[], b: Interval[]): Interval[] {
  const left = mergeIntervals(a);
  const right = mergeIntervals(b);

  const result: Interval[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    const x = left[i];
    const y = right[j];

    const start = x.start > y.start ? x.start : y.start;
    const end = x.end < y.end ? x.end : y.end;
    if (start < end) result.push({ start, end });

    if (x.end < y.end) i++;
    else j++;
  }
  return result;
}
export function subtractIntervals(from: Interval[], remove: Interval[]): Interval[] {
  const free = mergeIntervals(from);
  const busy = mergeIntervals(remove);

  const result: Interval[] = [];
  let j = 0;

  for (const f of free) {
    while (j < busy.length && busy[j].end <= f.start) j++;

    let cursor = f.start;
    let k = j;

    while (k < busy.length && busy[k].start < f.end) {
      const b = busy[k];
      if (b.start > cursor) result.push({ start: cursor, end: b.start });
      if (b.end > cursor) cursor = b.end;
      k++;
    }

    if (cursor < f.end) result.push({ start: cursor, end: f.end });
  }
  return result;
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
