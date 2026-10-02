import { api } from "@/lib/api";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { type Weekday } from "@slotbook/shared";
import { WEEKDAY_BY_NAME } from "@/lib/sharedSchemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() || undefined;
}
function currencyDigits(currency: string) {
  return (
    new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions()
      .maximumFractionDigits ?? 2
  );
}

export function fromCents(cents: number, currency: string): string {
  const digits = currencyDigits(currency);
  return (cents / 10 ** digits).toFixed(digits);
}
export function toCents(input: string, currency: string): number {
  const trimmed = input.trim().replace(",", ".");
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return NaN;
  const digits =
    new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions()
      .maximumFractionDigits ?? 2;
  return Math.round(value * 10 ** digits);
}

export function getMapLink(address: string, lat: number, lng: number) {
  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const query = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
const numberToDayName = Object.fromEntries(
  Object.entries(WEEKDAY_BY_NAME).map(([name, num]) => [num, name]),
) as Record<Weekday, string>;

export function convertDayNumberToShortDayName(dayNumber: number): string {
  return numberToDayName[dayNumber as Weekday];
}
export function isoStringToWallTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
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
