import type { DB } from "../../db/drizzlePlugin.ts";
import { getFacilityByIdOrThrow } from "../facility/facility.service.ts";
import { findFacilitySchedule } from "../facility/facilitySchedule.repository.ts";
import { receiveStaffSchedule } from "../schedule/schedule.service.ts";
import type { AvailabilityResponse } from "@slotbook/shared";
import { findBusyRangesForStaff } from "../booking/booking.repository.ts";
import { getServiceForStaffMember } from "../service/service.service.ts";
import { addDaysToIso } from "../../lib/utils.ts";
import { NotFoundError } from "../../lib/errors";
import { computeDaySlots, getBookingWindow } from "./slotEngine";
import { BOOKING_RULES } from "./booking.rules";

export async function getAvailableSlotsFor30days(
  db: DB,
  facilityId: string,
  staffId: string,
  serviceId: string,
): Promise<AvailabilityResponse> {
  const facility = await getFacilityByIdOrThrow(db, facilityId);
  const [service, facilitySchedule, staffSchedule] = await Promise.all([
    getServiceForStaffMember(db, serviceId, staffId),
    findFacilitySchedule(db, facilityId),
    receiveStaffSchedule(db, facilityId, staffId),
  ]);
  if (service.facilityId !== facilityId || !service.isActive) {
    throw new NotFoundError("No such service found");
  }

  const now = new Date();
  const tz = facility.timezone;
  const window = getBookingWindow(tz, now);

  const busy = await findBusyRangesForStaff(db, facility.id, staffId, now, window.windowEnd);

  const days = Array.from({ length: BOOKING_RULES.horizonDays }, (_, i) => {
    const date = addDaysToIso(window.firstDate, i);
    const slots = computeDaySlots({
      localDate: date,
      timeZone: tz,
      facilityRows: facilitySchedule,
      staffRows: staffSchedule,
      busy,
      durationMinutes: service.durationMinutes,
      earliestStart: window.earliestStart,
    });
    return { date, slots: slots.map((s) => ({ startsAt: s.start, endsAt: s.end })) };
  });

  return { days };
}
