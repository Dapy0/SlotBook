export function todayInTimeZone(timeZone: string, now = new Date()): string {
  return Intl.DateTimeFormat("sv-SE", { timeZone }).format(now);
}
export function getLocalWallTime(date: Date, timeZone: string): string {
  return Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
export function addDaysToIso(isoDate: string, amount: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + amount)).toISOString().slice(0, 10);
}
export function getLocalDayOfWeek(date: Date, timeZone: string): number {
  const localDateStr = Intl.DateTimeFormat("sv-SE", { timeZone }).format(date);
  return getIsoWeekDay(localDateStr);
}
export function getIsoWeekDay(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  const UTCWeekDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return UTCWeekDay === 0 ? 8 : UTCWeekDay;
}

