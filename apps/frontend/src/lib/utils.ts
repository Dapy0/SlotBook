import { api } from "@/lib/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  daysAndThereNames,
  type DayOfTheWeek,
  type FacilityScheduleResponse,
} from "@slotbook/shared/facilitySchedule";
import type { FacilityCityResponse } from "@slotbook/shared";

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
export function isoStringToWallTime(time: string) {
  const [date, wallTime] = time.split("T");

  return removeExtraSecondsFromTime(wallTime);
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
export function convertToSelectFormat<T extends Record<string, unknown>>(
  arrObj: T[],
  labelField: keyof T,
  valueField: keyof T,
): Array<{
  value: string;
  label: string;
}> {
  const res: Array<{
    value: string;
    label: string;
  }> = [];
  for (const val of arrObj) {
    res.push({
      value: String(val[valueField]),
      label: String(val[labelField]),
    });
  }
  return res;
}
