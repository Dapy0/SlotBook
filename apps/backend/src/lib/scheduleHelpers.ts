import {
  daysAndThereNames,
  type DayOfTheWeek,
  type FacilityScheduleResponse,
} from "@slotbook/shared/facilitySchedule";
import { BadRequestError, ConflictError } from "./errors.ts";
import type { ResponseStaffScheduleSchema } from "@slotbook/shared/staffSchedule";
import type { FacilityScheduleEntity } from "../db/schema/facilitySchedule.ts";
import type { StaffScheduleEntity } from "../db/schema/staffSchedule.ts";
import type { ScheduleBody } from "../modules/schedule/schedule.schema.ts";

export function checkNoOverlapWithinSchedule(
  schedule: Array<{ dayOfTheWeek: number; startTime: string; endTime: string }>,
) {
  const grouped = Object.groupBy(schedule, ({ dayOfTheWeek }) => dayOfTheWeek);
  for (const [day, entries] of Object.entries(grouped)) {
    if (!entries) continue;
    const sorted = [...entries].sort((a, b) => a.startTime.localeCompare(b.startTime));
    let previous: (typeof sorted)[number] | undefined;
    for (const current of sorted) {
      if (current.startTime >= current.endTime) {
        throw new BadRequestError(`Start time must be before end time for day ${day}`);
      }
      if (previous && current.startTime < previous.endTime) {
        throw new ConflictError(`Overlapping schedules for day ${day}`);
      }
      previous = current;
    }
  }
}

export function checkStaffScheduleFitsFacility(
  staffSchedule: ScheduleBody,
  facilitySchedule: ScheduleBody,
) {
  for (const current of staffSchedule) {
    const facilityDay = facilitySchedule.find((f) => f.dayOfTheWeek === current.dayOfTheWeek);
    if (!facilityDay) {
      throw new ConflictError(`Facility is closed on day ${current.dayOfTheWeek}`);
    }
    if (current.startTime < facilityDay.startTime || current.endTime > facilityDay.endTime) {
      throw new ConflictError(
        `Staff schedule outside facility hours on day ${current.dayOfTheWeek}`,
      );
    }
  }
}
export async function checkIfBookingFitsAllSchedules(
  startTime: string,
  endTime: string,
  dayOfTheWeek: DayOfTheWeek,
  staffSchedule: ResponseStaffScheduleSchema[],
  facilitySchedule: FacilityScheduleResponse[],
) {
  const facilityDaySchedules = facilitySchedule.filter((f) => f.dayOfTheWeek === dayOfTheWeek);
  const staffDaySchedules = staffSchedule.filter((s) => s.dayOfTheWeek === dayOfTheWeek);

  if (facilityDaySchedules.length === 0) {
    throw new ConflictError(`Facility is closed on day ${dayOfTheWeek}`);
  }
  if (staffDaySchedules.length === 0) {
    throw new ConflictError(`Staff does not work on day ${dayOfTheWeek}`);
  }

  const fitsFacility = facilityDaySchedules.some(
    (f) => startTime >= f.startTime && endTime <= f.endTime,
  );

  if (!fitsFacility) {
    throw new ConflictError(`Booking is outside facility working hours on day ${dayOfTheWeek}`);
  }
  const fitsStaff = staffDaySchedules.some((s) => startTime >= s.startTime && endTime <= s.endTime);
  if (!fitsStaff) {
    throw new ConflictError(`Booking is outside staff working hours on day ${dayOfTheWeek}`);
  }
}
export function toTimeString(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function convertShortDayNameToDayNumber(dayName: string): DayOfTheWeek {
  return daysAndThereNames[dayName];
}
export function addMinutesToTimeString(time: string, minutesToAdd: number): string {
  const [hours, minutes, seconds] = time.split(":").map(Number);

  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${pad(newHours)}:${pad(newMinutes)}:${pad(seconds)}`;
}
export function combineDateAndTimeInZone(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second = 0] = time.split(":").map(Number);

  // "Черновой" момент: считаем, будто date+time — это уже UTC
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, second);

  // Смотрим, какое время этот момент показывает в целевой таймзоне
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(naiveUtc));

  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);

  const displayedAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );

  // Разница между тем, что хотели, и тем, что показала таймзона на этот момент
  const offset = naiveUtc - displayedAsUtc;

  return new Date(naiveUtc + offset);
}
