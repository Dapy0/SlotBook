import type { DB } from "../../db/drizzlePlugin.ts";
import { getFacilityByIdOrThrow } from "../facility/facility.service.ts";
import { findFacilitySchedule } from "../facility/facilitySchedule.repository.ts";
import { receiveStaffSchedule } from "../schedule/schedule.service.ts";
import type { AvailabilityResponse } from "@slotbook/shared";
import { findBusyRangesForStaff } from "../booking/booking.repository.ts";
import { getServiceForStaffMember } from "../service/service.service.ts";
import {
  intersectIntervals,
  scheduleRowsToIntervals,
  sliceIntoSlots,
  type Interval,
  type ScheduleRow,
} from "./availability.utils.ts";
import { fromZonedTime } from "date-fns-tz";
import { addDaysToIso, getIsoWeekDay, todayInTimeZone } from "../../lib/utils.ts";

function getAvailableSlotsForDay(
  date: string,
  weekday: number,
  facilitySchedule: ScheduleRow[],
  staffSchedule: ScheduleRow[],
  bookedThisDay: Interval[],
  serviceDurationMinutes: number,
  earliestStart: string,
  timeZone: string,
) {
  const dayFacilitySchedule = scheduleRowsToIntervals(facilitySchedule, date, weekday, timeZone);
  const dayStaffSchedule = scheduleRowsToIntervals(staffSchedule, date, weekday, timeZone);

  const workingIntervals = intersectIntervals(dayFacilitySchedule, dayStaffSchedule);
  const freeIntervals = intersectIntervals(workingIntervals, bookedThisDay);
  const slots = freeIntervals
    .flatMap((interval) => sliceIntoSlots(interval, serviceDurationMinutes))
    .filter((slot) => slot.start >= new Date(earliestStart))
    .map((slot) => ({
      startsAt: slot.start,
      endsAt: slot.end,
    }));

  return { date, slots };
}
export async function getAvailableSlotsFor30days(
  db: DB,
  facilityId: string,
  staffId: string,
  serviceId: string,
): Promise<AvailabilityResponse> {
  const facility = await getFacilityByIdOrThrow(db, facilityId);
  const tz = facility.timezone;
  const [service, facilitySchedule, staffSchedule] = await Promise.all([
    getServiceForStaffMember(db, serviceId, staffId),
    findFacilitySchedule(db, facilityId),
    receiveStaffSchedule(db, facilityId, staffId),
  ]);

  const now = new Date();
  const firstDate = todayInTimeZone(tz, now);
  const lastDate = addDaysToIso(firstDate, 30);
  const windowEnd = fromZonedTime(`${lastDate}T00:00:00`, tz);

  const earliestStart = new Date(now.getTime() + 60 * 60_000);

  const busy = await findBusyRangesForStaff(db, facility.id, staffId, now, windowEnd);

  const days = Array.from({ length: 30 }, (_, i) => {
    const date = addDaysToIso(firstDate, i);
    const weekday = getIsoWeekDay(date);

    // const thisDayBooked = busy.filter((booking)=> booking.)
    return getAvailableSlotsForDay(
      date,
      weekday,
      facilitySchedule,
      staffSchedule,
      busy,
      service.durationMinutes,
      earliestStart.toISOString(),
      tz,
    );
  });
  return { days };
}
