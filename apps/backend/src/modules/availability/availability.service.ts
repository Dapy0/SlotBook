import type { DB } from "../../db/drizzlePlugin.ts";
import { getFacilityDetails, getFacilityScheduleById } from "../facility/facility.service.ts";
import { checkIfStaffMemberIsDoingService } from "../staff/staff.service.ts";
import { findFacilitySchedule } from "../facility/facilitySchedule.repository.ts";
import {
  addMinutesToTimeString,
  combineDateAndTimeInZone,
  convertShortDayNameToDayNumber,
} from "../../lib/scheduleHelpers.ts";
import { receiveStaffSchedule } from "../schedule/schedule.service.ts";
import { findBookingsByFacilityId } from "../booking/booking.repository.ts";
import { parseTsRangeLiteral } from "@slotbook/shared/bookings";

export async function getAvailableTimeByStaffAndServiceId(
  db: DB,
  facilityId: string,
  staffId: string,
  serviceId: string,
  date: string,
) {
  const facility = await getFacilityDetails(db, facilityId);
  const service = await checkIfStaffMemberIsDoingService(db, staffId, serviceId);

  const dayOfTheWeekConvector = new Intl.DateTimeFormat("en-Us", {
    timeZone: facility.timezoneIANA,
    weekday: "short",
  });
  const dayOfTheWeek = convertShortDayNameToDayNumber(dayOfTheWeekConvector.format(new Date(date)));
  const facilityDaySchedule = (await findFacilitySchedule(db, facilityId)).filter(
    (f) => f.dayOfTheWeek == dayOfTheWeek,
  );
  const staffDaySchedule = (await receiveStaffSchedule(db, facilityId, staffId)).filter(
    (s) => s.dayOfTheWeek == dayOfTheWeek,
  );
  if (facilityDaySchedule.length === 0 || staffDaySchedule.length === 0) {
    return []; // Its just closed
  }

  const getFacilityBookingsThisDay = await findBookingsByFacilityId(db, facilityId);
  const nonCanceledAndFilteredByStaffId = getFacilityBookingsThisDay.filter(
    (b) => b.staffMemberId === staffId && b.status !== "canceled",
  );
  function hasBounds(r: {
    start: Date | null;
    end: Date | null;
    startInclusive: boolean;
    endInclusive: boolean;
  }): r is { start: Date; end: Date; startInclusive: boolean; endInclusive: boolean } {
    return r.start !== null && r.end !== null;
  }

  const busyIntervals = nonCanceledAndFilteredByStaffId
    .map((b) => parseTsRangeLiteral(b.timeRange))
    .filter(hasBounds);

  const slots: Array<{ start: Date; end: Date }> = [];
  const now = new Date();
  for (const schedule of staffDaySchedule) {
    const windowStart = combineDateAndTimeInZone(date, schedule.startTime, facility.timezoneIANA);
    const windowEnd = combineDateAndTimeInZone(date, schedule.endTime, facility.timezoneIANA);

    slots.push(
      ...computeSlotsForWindow(windowStart, windowEnd, service.durationMinutes, busyIntervals, now),
    );
  }
  return slots;
}

function computeSlotsForWindow(
  windowStart: Date,
  windowEnd: Date,
  durationMinutes: number,
  busyIntervals: Array<{ start: Date; end: Date }>,
  now: Date,
): Array<{ start: Date; end: Date }> {
  const slots: Array<{ start: Date; end: Date }> = [];
  const durationMs = durationMinutes * 60_000;

  let candidateStart = windowStart;

  while (candidateStart.getTime() + durationMs <= windowEnd.getTime()) {
    const candidateEnd = new Date(candidateStart.getTime() + durationMs);

    const overlapsBusy = busyIntervals.some(
      (b) => candidateStart < b.end && candidateEnd > b.start,
    );
    const isInPast = candidateStart <= now;

    if (!overlapsBusy && !isInPast) {
      slots.push({ start: candidateStart, end: candidateEnd });
    }

    candidateStart = candidateEnd; // фиксированный шаг = длительность услуги
  }

  return slots;
}
