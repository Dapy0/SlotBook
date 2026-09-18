import type { DB } from "../../db/drizzlePlugin.ts";
import { ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors.ts";
import { checkFacilityOwnership, getFacilityDetails } from "../facility/facility.service.ts";
import { receiveStaffSchedule } from "../schedule/schedule.service.ts";
import { getFacilityServiceById } from "../service/service.service.ts";
import {
  checkIfStaffIsFacilityWorker,
  checkIfStaffMemberIsDoingService,
} from "../staff/staff.service.ts";
import {
  findBookingById,
  findBookingsByFacilityId,
  insertBooking,
  patchStatusByBookingId,
} from "./booking.repository.ts";
import { checkIfBookingFitsAllSchedules } from "../../lib/scheduleHelpers.ts";
import { findFacilitySchedule } from "../facility/facilitySchedule.repository.ts";
import type { BookingRequest, PatchBookingStatus } from "@slotbook/shared/bookings";
import { getLocalDayOfWeek, getLocalWallTime } from "../../lib/utils.ts";
export async function getFacilityBookingsForOwner(db: DB, userId: string, facilityId: string) {
  await checkFacilityOwnership(db, facilityId, userId);

  const facilityBookings = await findBookingsByFacilityId(db, facilityId);

  return facilityBookings;
}
export async function createBookingForFacility(
  db: DB,
  userId: string,
  facilityId: string,
  data: BookingRequest,
) {
  const [facility, staff, service, staffSchedule, facilitySchedule] = await Promise.all([
    getFacilityDetails(db, facilityId),
    checkIfStaffIsFacilityWorker(db, facilityId, data.staffId),
    getFacilityServiceById(db, data.serviceId, facilityId),
    receiveStaffSchedule(db, facilityId, data.staffId),
    findFacilitySchedule(db, facilityId),
  ]);

  await checkIfStaffMemberIsDoingService(db, staff.id, service.id);

  // if (userId === facility.ownerId) {
  //   throw new ForbiddenError("No self bookings allowed");
  // }
  if (data.startTime.getTime() <= Date.now()) {
    throw new ConflictError("Start time is in the past");
  }

  const startDatetime = data.startTime;
  const endDatetime = new Date(startDatetime.getTime() + service.durationMinutes * 60_000);

  const localDay = getLocalDayOfWeek(startDatetime, facility.timezoneIANA);
  const localStartTime = getLocalWallTime(startDatetime, facility.timezoneIANA);
  const localEndTime = getLocalWallTime(endDatetime, facility.timezoneIANA);
  await checkIfBookingFitsAllSchedules(
    localStartTime,
    localEndTime,
    localDay,
    staffSchedule,
    facilitySchedule,
  );

  const booking = await insertBooking(db, {
    clientId: userId,
    facilityId,
    staffMemberId: staff.id,
    serviceId: service.id,
    startDatetime,
    endDatetime,
  }).catch((e) => {
    if (e.code === "23P01") {
      throw new ConflictError("This time slot is already booked");
    }
    throw e;
  });

  return booking;
}

export async function changeBookingStatus(
  db: DB,
  userId: string,
  facilityId: string,
  bookingId: string,
  data: PatchBookingStatus,
) {
  const booking = await findBookingById(db, bookingId);
  if (!booking) {
    throw new NotFoundError("No such booking found");
  }
  switch (booking.status) {
    case "pending":
      switch (data.status) {
        case "confirmed":
          // console.log(userId, booking.clientId);
          await checkFacilityOwnership(db, facilityId, userId);
          return await patchStatusByBookingId(db, booking.id, data.status);
        case "canceled":
          if (booking.clientId === userId) {
            return await patchStatusByBookingId(db, booking.id, data.status);
          }
          await checkFacilityOwnership(db, facilityId, userId);
          return await patchStatusByBookingId(db, booking.id, data.status);
          break;
      }
      break;

    case "confirmed":
      switch (data.status) {
        case "confirmed":
          throw new ConflictError("Not allowed same state");
          break;
        case "canceled":
          if (booking.clientId === userId) {
            return await patchStatusByBookingId(db, booking.id, data.status);
          }
          await checkFacilityOwnership(db, facilityId, userId);
          return await patchStatusByBookingId(db, booking.id, data.status);
      }
      break;

    default:
      throw new ConflictError("Not allowed");
  }
}
