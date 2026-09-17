import type { DB } from "../../db/drizzlePlugin.ts";
import { getFacilityDetails } from "../facility/facility.service.ts";
import { findFacilitySchedule } from "../facility/facilitySchedule.repository.ts";
import { receiveStaffSchedule } from "../schedule/schedule.service.ts";
import type { AvailabilityResponse } from "@slotbook/shared/availability";
import { findBusyRangesForStaff } from "../booking/booking.repository.ts";
import { getServiceForStaffMember } from "../service/service.service.ts";
import {
  addDaysToIso,
  getIsoWeekDay,
  intersectIntervals,
  overlaps,
  scheduleRowsToIntervals,
  sliceIntoSlots,
  todayInTimeZone,
} from "./availability.utils.ts";
import { fromZonedTime } from "date-fns-tz";

// function generateNext30Days(timezone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
//   const formatter = new Intl.DateTimeFormat("en-US", {
//     timeZone: timezone,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     weekday: "long",
//   });
//   const days: { date: string }[] = [];
//   const startDay = Date.now();
//   console.log(startDay);
//   for (let i = 0; i < 30; i++) {
//     const currentDay = new Date(startDay);
//     currentDay.setDate(currentDay.getDate() + i);

//     const parts = formatter.formatToParts(currentDay);
//     const dateObj = Object.fromEntries(parts.map((p) => [p.type, p.value]));
//     days.push({
//       date: `${dateObj.day}-${dateObj.month}-${dateObj.year}`,
//     });
//   }
//   return days;
// }

export async function getAvailableSlotsFor30days(
  db: DB,
  facilityId: string,
  staffId: string,
  serviceId: string,
): Promise<AvailabilityResponse> {
  const facility = await getFacilityDetails(db, facilityId);
  const [service, facilitySchedule, staffSchedule] = await Promise.all([
    getServiceForStaffMember(db, serviceId, staffId),
    findFacilitySchedule(db, facilityId),
    receiveStaffSchedule(db, facilityId, staffId),
  ]);

  const now = new Date();
  const firstDate = todayInTimeZone(facility.timezoneIANA, now);
  const lastDate = addDaysToIso(firstDate, 29);

  const windowEnd = fromZonedTime(`${lastDate}T23:59:59`, facility.timezoneIANA);
  const earliestStart = new Date(now.getTime() + 60 * 60_000);

  const busy = await findBusyRangesForStaff(db, facility.id, staffId, now, windowEnd);

  const days = Array.from({ length: 30 }, (_, i) => {
    const date = addDaysToIso(firstDate, i);
    const weekday = getIsoWeekDay(date);
    const tz = facility.timezoneIANA;

    const facilityIntervals = scheduleRowsToIntervals(facilitySchedule, date, weekday, tz);

    const workingIntervals =
      staffSchedule.length === 0
        ? facilityIntervals
        : intersectIntervals(
            facilityIntervals,
            scheduleRowsToIntervals(staffSchedule, date, weekday, tz),
          );

    const slots = workingIntervals
      .flatMap((interval) => sliceIntoSlots(interval, service.durationMinutes))
      .filter((slot) => slot.start >= earliestStart)
      .filter((slot) => !busy.some((booking) => overlaps(slot, booking)));

    return { date, slots };
  });
  return { days };
}

// function createSlots(
//   windowStart: Date,
//   windowEnd: Date,
//   durationMinutes: number,
//   busyIntervals: AvailabilitySlot[],
//   now: Date,
// ): AvailabilitySlot[] {
//   const slots: AvailabilitySlot[] = [];
//   const durationMs = durationMinutes * 60_000;

//   let candidateStart = windowStart;

//   while (candidateStart.getTime() + durationMs <= windowEnd.getTime()) {
//     const candidateEnd = new Date(candidateStart.getTime() + durationMs);

//     const overlapsBusy = busyIntervals.some(
//       (b) => candidateStart < new Date(b.end) && candidateEnd > new Date(b.start),
//     );
//     const isInPast = candidateStart <= now;

//     if (!overlapsBusy && !isInPast) {
//       slots.push({ start: candidateStart.toISOString(), end: candidateEnd.toISOString() });
//     }

//     candidateStart = candidateEnd;
//   }

//   return slots;
// }
