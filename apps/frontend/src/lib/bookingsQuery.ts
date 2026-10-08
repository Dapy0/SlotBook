import {
  addDaysToIso,
  BOOKING_STATUSES,
  todayInTimeZone,
  type BookingStatus,
} from "@slotbook/shared";

const isIsoDate = (v: string | undefined): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isStatus = (v: string | undefined): v is BookingStatus =>
  !!v && (BOOKING_STATUSES as readonly string[]).includes(v);

export type WeekQuery = { from: string; to: string; status: BookingStatus | undefined };

export function parseWeekQuery(
  query: { from?: string; status?: string },
  timeZone: string,
): WeekQuery {
  const from = isIsoDate(query.from) ? query.from : todayInTimeZone(timeZone);
  return {
    from,
    to: addDaysToIso(from, 6),
    status: isStatus(query.status) ? query.status : undefined,
  };
}

export function buildHref(
  basePath: string,
  current: Record<string, string | undefined>,
  changes: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...current, ...changes })) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
