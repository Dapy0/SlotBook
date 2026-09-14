import { api } from "@/lib/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  daysAndThereNames,
  type DayOfTheWeek,
  type ResponseFacilityScheduleSchema,
} from "@slotbook/shared/facilitySchedule";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() || undefined;
}



export function getMapLink(address: string, lat: number, lng: number) {
  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const query = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
const numberToDayName = Object.fromEntries(
  Object.entries(daysAndThereNames).map(([name, num]) => [num, name]),
) as Record<DayOfTheWeek, string>;

export function convertDayNumberToShortDayName(dayNumber: number): string {
  return numberToDayName[dayNumber as DayOfTheWeek];
}
export function convertRawResponseFacilitySchedule(
  rawSchema: ResponseFacilityScheduleSchema[],
): Array<{
  dayOfTheWeek: string;
  timeIntervals: Array<string>;
}> {
  const grouped = Object.groupBy(rawSchema, ({ dayOfTheWeek }) => dayOfTheWeek);

  const res = Object.values(daysAndThereNames).map((dayNumber) => ({
    dayOfTheWeek: convertDayNumberToShortDayName(dayNumber),
    timeIntervals: [] as string[],
  }));

  for (const [day, entries] of Object.entries(grouped)) {
    if (!entries) continue;
    const sorted = [...entries].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const currentDayKey = convertDayNumberToShortDayName(Number(day));
    const target = res.find((r) => r.dayOfTheWeek === currentDayKey);
    if (!target) continue;

    for (const current of sorted) {
      target.timeIntervals.push(
        `${removeExtraSecondsFromTime(current.startTime)} - ${removeExtraSecondsFromTime(current.endTime)}`,
      );
    }
  }

  return res;
}
export function removeExtraSecondsFromTime(time: string) {
  const [hours, minutes, seconds] = time.split(":");
  return `${hours}:${minutes}`;
}

export function convertMinutesToTime(durationMinutes: number) {
  const hours = Math.trunc(durationMinutes / 60);
  const minutes = durationMinutes - hours * 60;
  return [hours, minutes];
}
export function formatMoney(cents: number, currency: string, locale: string = "pl") {
  const formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
  const divisor = 10 ** 2;
  return formatter.format(cents / divisor);
}
