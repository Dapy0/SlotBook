import { fromZonedTime } from 'date-fns-tz';

export type Interval = { start: Date; end: Date };
export type ScheduleRow = { dayOfTheWeek: number; startTime: string; endTime: string };

export function addDaysToIso(isoDate: string, amount: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + amount)).toISOString().slice(0, 10);
}
export function getIsoWeekDay(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  const UTCWeekDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return UTCWeekDay === 0 ? 8 : UTCWeekDay;
}
export function todayInTimeZone(timeZone: string, now = new Date()): string {
  return Intl.DateTimeFormat("sv-SE", { timeZone }).format(now);
}
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
