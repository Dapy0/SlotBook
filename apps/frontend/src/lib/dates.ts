import { formatInTimeZone } from "date-fns-tz";
export function groupByLocalDate<T extends { startsAt: Date }>(
  items: T[],
  timeZone: string,
): { date: string; bookings: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const date = formatInTimeZone(item.startsAt, timeZone, "yyyy-MM-dd");
    const list = groups.get(date) ?? [];
    list.push(item);
    groups.set(date, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, bookings]) => ({ date, bookings }));
}
