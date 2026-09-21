import type { DB } from "../../db/drizzlePlugin.ts";
import { ConflictError, NotFoundError } from "../../lib/errors.ts";
import { checkFacilityOwnership, getFacilityOrThrow } from "../facility/facility.service.ts";
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
import { getLocalDayOfWeek, getLocalWallTime } from "../../lib/utils.ts";
import type {
  BookingResponse,
  ChangeBookingStatusRequest,
  CreateBookingRequest,
} from "@slotbook/shared";
import type { BookingEntity } from "../../db/schema";
function mapBookingToContractFormat(booking: BookingEntity): BookingResponse;

function mapBookingToContractFormat(bookings: BookingEntity[]): BookingResponse[];

function mapBookingToContractFormat(
  bookings: BookingEntity | BookingEntity[],
): BookingResponse | BookingResponse[] {
  if (Array.isArray(bookings)) {
    return bookings.map(({ timeRange, ...booking }) => ({
      ...booking,
      startsAt: timeRange.start,
      endsAt: timeRange.end,
    }));
  }

  const { timeRange, ...booking } = bookings;

  return {
    ...booking,
    startsAt: timeRange.start,
    endsAt: timeRange.end,
  };
}

export async function getFacilityBookingsForOwner(
  db: DB,
  userId: string,
  facilityId: string,
): Promise<BookingResponse[]> {
  await checkFacilityOwnership(db, facilityId, userId);

  const facilityBookings = await findBookingsByFacilityId(db, facilityId);

  return mapBookingToContractFormat(facilityBookings);
}
export async function createBookingForFacility(
  db: DB,
  userId: string,
  facilityId: string,
  data: CreateBookingRequest,
): Promise<BookingResponse> {
  const [facility, staff, service, staffSchedule, facilitySchedule] = await Promise.all([
    getFacilityOrThrow(db, facilityId),
    checkIfStaffIsFacilityWorker(db, facilityId, data.staffMemberId),
    getFacilityServiceById(db, data.serviceId, facilityId),
    receiveStaffSchedule(db, facilityId, data.staffMemberId),
    findFacilitySchedule(db, facilityId),
  ]);

  await checkIfStaffMemberIsDoingService(db, staff.id, service.id);

  // if (userId === facility.ownerId) {
  //   throw new ForbiddenError("No self bookings allowed");
  // }
  if (data.startsAt.getTime() <= Date.now()) {
    throw new ConflictError("Start time is in the past");
  }

  const startDatetime = data.startsAt;
  const endDatetime = new Date(startDatetime.getTime() + service.durationMinutes * 60_000);

  const localDay = getLocalDayOfWeek(startDatetime, facility.timezone);
  const localStartTime = getLocalWallTime(startDatetime, facility.timezone);
  const localEndTime = getLocalWallTime(endDatetime, facility.timezone);
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

  return mapBookingToContractFormat(booking);
}

export async function changeBookingStatus(
  db: DB,
  userId: string,
  facilityId: string,
  bookingId: string,
  data: ChangeBookingStatusRequest,
): Promise<BookingResponse> {
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
          return mapBookingToContractFormat(
            await patchStatusByBookingId(db, booking.id, data.status),
          );
        case "canceled":
          if (booking.clientId === userId) {
            return mapBookingToContractFormat(
              await patchStatusByBookingId(db, booking.id, data.status),
            );
          }
          await checkFacilityOwnership(db, facilityId, userId);
          return mapBookingToContractFormat(
            await patchStatusByBookingId(db, booking.id, data.status),
          );
      }
      break;

    case "confirmed":
      switch (data.status) {
        case "confirmed":
          throw new ConflictError("Not allowed same state");
          break;
        case "canceled":
          if (booking.clientId === userId) {
            return mapBookingToContractFormat(
              await patchStatusByBookingId(db, booking.id, data.status),
            );
          }
          await checkFacilityOwnership(db, facilityId, userId);
          return mapBookingToContractFormat(
            await patchStatusByBookingId(db, booking.id, data.status),
          );
      }
      break;

    default:
      throw new ConflictError("Not allowed");
  }
}
