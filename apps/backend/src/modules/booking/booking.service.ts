import type { DB } from "../../db/drizzlePlugin.ts";
import { BadRequestError, ConflictError, NotFoundError } from "../../lib/errors.ts";
import { checkFacilityOwnership, getFacilityByIdOrThrow } from "../facility/facility.service.ts";
import { receiveStaffSchedule } from "../schedule/schedule.service.ts";
import { getFacilityServiceById } from "../service/service.service.ts";
import {
  checkIfStaffIsFacilityWorker,
  checkIfStaffMemberIsDoingService,
} from "../staff/staff.service.ts";
import {
  findBookingById,
  findBookingsByFacilityId,
  findBookingsByUserId,
  findBusyRangesForStaff,
  insertBooking,
  patchStatusByBookingId,
} from "./booking.repository.ts";
import { findFacilitySchedule } from "../facility/facilitySchedule.repository.ts";
import type {
  BookingResponse,
  ChangeBookingStatusRequest,
  CreateBookingRequest,
} from "@slotbook/shared";
import type { BookingEntity } from "../../db/schema";
import { computeDaySlots, dayBounds, getBookingWindow } from "../availability/slotEngine";
import { formatInTimeZone } from "date-fns-tz";
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
  now = new Date(),
): Promise<BookingResponse> {
  const [facility, staff, service, staffSchedule, facilitySchedule] = await Promise.all([
    getFacilityByIdOrThrow(db, facilityId),
    checkIfStaffIsFacilityWorker(db, facilityId, data.staffMemberId),
    getFacilityServiceById(db, data.serviceId, facilityId),
    receiveStaffSchedule(db, facilityId, data.staffMemberId),
    findFacilitySchedule(db, facilityId),
  ]);

  await checkIfStaffMemberIsDoingService(db, staff.id, service.id);

  const tz = facility.timezone;
  const window = getBookingWindow(tz, now);

  // 1. В какой ЛОКАЛЬНЫЙ день заведения попадает startsAt
  const date = formatInTimeZone(data.startsAt, tz, "yyyy-MM-dd");
  if (date < window.firstDate || date > window.lastDate) {
    throw new BadRequestError("Date is outside the booking window");
  }
  const day = dayBounds(date, tz);
  const busy = await findBusyRangesForStaff(db, facilityId, staff.id, day.start, day.end);

  const slots = computeDaySlots({
    localDate: date,
    timeZone: tz,
    facilityRows: facilitySchedule,
    staffRows: staffSchedule,
    busy,
    durationMinutes: service.durationMinutes,
    earliestStart: window.earliestStart,
  });

  const slot = slots.find((s) => s.start.getTime() === data.startsAt.getTime());
  if (!slot) {
    throw new ConflictError("This time slot is not available");
  }

  const booking = await insertBooking(db, {
    clientId: userId,
    facilityId,
    staffMemberId: staff.id,
    serviceId: service.id,
    startDatetime: slot.start,
    endDatetime: slot.end,
  }).catch((e: unknown) => {
    if (e) {
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

export async function getMineBookings(db: DB, userId: string): Promise<BookingResponse[]> {
  return mapBookingToContractFormat(await findBookingsByUserId(db, userId));
}
