import { formatInTimeZone } from "date-fns-tz";
import type { FacilityEntity } from "../db/schema";
import type { PublicBookingPolicy } from "@slotbook/shared";

export function todayInTimeZone(timeZone: string, now = new Date()): string {
  return formatInTimeZone(now, timeZone, "yyyy-MM-dd");
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
  if (
    day > 31 ||
    month > 12 ||
    year < month ||
    year < day ||
    year == null ||
    month == null ||
    day == null
  )
    throw RangeError("Invalid time value");
  return new Date(Date.UTC(year, month - 1, day + amount)).toISOString().slice(0, 10);
}
export function getLocalDayOfWeek(date: Date, timeZone: string): number {
  const localDateStr = Intl.DateTimeFormat("sv-SE", { timeZone }).format(date);
  return getIsoWeekDay(localDateStr);
}
export function getIsoWeekDay(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (
    day > 31 ||
    month > 12 ||
    year < month ||
    year < day ||
    year == null ||
    month == null ||
    day == null
  )
    throw RangeError("Invalid time value");
  const UTCWeekDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return UTCWeekDay === 0 ? 7 : UTCWeekDay;
}

export function mapBookingToContractFormat<T extends { timeRange: { start: Date; end: Date } }>({
  timeRange,
  ...rest
}: T): Omit<T, "timeRange"> & { startsAt: Date; endsAt: Date } {
  return { ...rest, startsAt: timeRange.start, endsAt: timeRange.end };
}
export function toPublicBookingPolicy(
  facility: Pick<FacilityEntity, "confirmationMode" | "clientCancelCutoffMinutes">,
): PublicBookingPolicy {
  return {
    confirmationMode: facility.confirmationMode,
    clientCancelCutoffMinutes: facility.clientCancelCutoffMinutes,
  };
}
