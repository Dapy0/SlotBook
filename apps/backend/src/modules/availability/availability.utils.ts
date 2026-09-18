import { fromZonedTime } from 'date-fns-tz';

export type Interval = { start: Date; end: Date };
export type ScheduleRow = { dayOfTheWeek: number; startTime: string; endTime: string };


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
  stepMinutes = 30,
): Interval[] {
  const slots: Interval[] = [];
  const durationMs = durationMinutes * 60_000;
  const stepMs = stepMinutes * 60_000;
  const lastStart = interval.end.getTime() - durationMs;

  for (let t = interval.start.getTime(); t <= lastStart; t += stepMs) {
    slots.push({ start: new Date(t), end: new Date(t + durationMs) });
    if (slots.length > 1000) {
      throw new Error(
        `sliceIntoSlots runaway: step=${stepMs}ms, interval=${interval.start.toISOString()}..${interval.end.toISOString()}`,
      );
    }
  }

  return slots;
}
