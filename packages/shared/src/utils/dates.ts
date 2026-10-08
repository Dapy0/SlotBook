import { formatInTimeZone } from "date-fns-tz";
export function addDaysToIso(isoDate: string, amount: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + amount)).toISOString().slice(0, 10);
}
export function todayInTimeZone(timeZone: string, now = new Date()): string {
  return formatInTimeZone(now, timeZone, "yyyy-MM-dd");
}
export function formatCalendarDate(isoDate: string, pattern = "EEE, d MMM"): string {
  return formatInTimeZone(new Date(`${isoDate}T12:00:00Z`), "UTC", pattern);
}
