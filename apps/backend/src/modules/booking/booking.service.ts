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
import type { BookingBody } from "./booking.schema.ts";
import { checkIfBookingFitsAllSchedules, toTimeString } from "../../lib/scheduleHelpers.ts";
import { findFacilitySchedule } from "../facility/facilitySchedule.repository.ts";
import type { PatchBookingStatus } from "@slotbook/shared/bookings";
export async function getFacilityBookingsForOwner(db: DB, userId: string, facilityId: string) {
  await checkFacilityOwnership(db, facilityId, userId);

  const facilityBookings = await findBookingsByFacilityId(db, facilityId);

  return facilityBookings;
}
export async function createBookingForFacility(
  db: DB,
  userId: string,
  facilityId: string,
  data: BookingBody,
) {
  const facility = await getFacilityDetails(db, facilityId);
  const staffMember = await checkIfStaffIsFacilityWorker(db, facilityId, data.staffMemberId);
  const staffMemberSchedule = await receiveStaffSchedule(db, facilityId, staffMember.id);
  const serviceDetails = await getFacilityServiceById(db, data.serviceId, facilityId);
  const facilitySchedule = await findFacilitySchedule(db, facility.id);
  await checkIfStaffMemberIsDoingService(db, staffMember.id, data.serviceId);

  if (userId === facility.ownerId) {
    throw new ForbiddenError("No self bookings allowed");
  }
  if (data.startDatetime <= new Date()) {
    throw new ConflictError("Start time is in the past");
  }

  const localDay = ((data.startDatetime.getDay() + 6) % 7) as 1 | 2 | 3 | 4 | 5 | 6 | 7;

  const endDatetime = new Date(
    data.startDatetime.getTime() + serviceDetails.durationMinutes * 60_000,
  );

  await checkIfBookingFitsAllSchedules(
    toTimeString(data.startDatetime),
    toTimeString(endDatetime),
    localDay,
    staffMemberSchedule,
    facilitySchedule,
  );

  const booking = await insertBooking(db, {
    clientId: userId,
    facilityId,
    staffMemberId: staffMember.id,
    serviceId: data.serviceId,
    startDatetime: data.startDatetime,
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
