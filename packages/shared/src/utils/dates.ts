import { formatInTimeZone } from "date-fns-tz";
export function addDaysToString(yyyymmdd: string, amount: number): string {
  if (!yyyymmdd.match(/^\d{4}-((0[1-9]|1[0-2]))-((0[1-9]|[12]\d|3[01]))$/)) {
    throw new Error("Wrong format. Need to be YYYY-mm-dd");
  }
  if (amount < 0) {
    throw new Error("Amount of adding days must be positive");
  }
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + amount)).toISOString().slice(0, 10);
}
export function todayInTimeZone(timeZone: string, now = new Date()): string {
  if (!Intl.supportedValuesOf("timeZone").includes(timeZone))
    throw new Error(`No such ${timeZone} was found`);
  return formatInTimeZone(now, timeZone, "yyyy-MM-dd");
}
export function formatCalendarDate(isoDate: string, pattern = "EEE, d MMM"): string {
  return formatInTimeZone(new Date(`${isoDate}T12:00:00Z`), "UTC", pattern);
}
