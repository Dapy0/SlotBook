import type { DB } from "../../db/drizzlePlugin.ts";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors.ts";
import { getFacilityByIdOrThrow } from "../facility/facility.service.ts";
import { receiveStaffSchedule } from "../schedule/schedule.service.ts";
import { getFacilityServiceById } from "../service/service.service.ts";
import {
  checkIfStaffIsFacilityWorker,
  checkIfStaffMemberIsDoingService,
} from "../staff/staff.service.ts";
import {
  findBookingById,
  findBookingsWithDetails,
  findBusyRangesForStaff,
  insertBooking,
  updateBookingStatusIfCurrent,
} from "./booking.repository.ts";
import { findFacilitySchedule } from "../facility/facilitySchedule.repository.ts";
import {
  checkTransition,
  type Actors,
  type BookingQuery,
  type BookingResponse,
  type BookingWithDetailsResponse,
  type CreateBookingRequest,
  type FacilityBookingResponse,
  type MyBookingsQuery,
} from "@slotbook/shared";
import { bookings, type BookingEntity } from "../../db/schema";
import { computeDaySlots, dayBounds, getBookingWindow } from "../availability/slotEngine";
import { formatInTimeZone } from "date-fns-tz";
import { findFacilityById } from "../facility/facility.repository";
import { findStaffMemberById } from "../staff/staff.repository";
import type { BookingsFilter } from "./booking.schema";
import { sql } from "drizzle-orm";
import { assertFacilityOwner } from "../../lib/authz";
import { addDaysToIso, todayInTimeZone } from "../../lib/utils";
import { getPgErrorCode, PG } from "../../lib/pgErrors";
async function resolveBookingActors(
  db: DB,
  booking: BookingEntity,
  userId: string,
): Promise<Actors[]> {
  const [facility, staff] = await Promise.all([
    findFacilityById(db, booking.facilityId),
    findStaffMemberById(db, booking.staffMemberId),
  ]);
  const actors: Actors[] = [];
  if (booking.clientId === userId) actors.push("client");
  if (staff?.userId === userId) actors.push("staff");
  if (facility?.ownerId === userId) actors.push("owner");
  return actors;
}

function mapBookingToContractFormat<T extends { timeRange: { start: Date; end: Date } }>({
  timeRange,
  ...rest
}: T): Omit<T, "timeRange"> & { startsAt: Date; endsAt: Date } {
  return { ...rest, startsAt: timeRange.start, endsAt: timeRange.end };
}

export async function getFacilityBookingsForOwner(
  db: DB,
  userId: string,
  facilityId: string,
  filters: BookingQuery,
  now = new Date(),
): Promise<FacilityBookingResponse[]> {
  const facility = await assertFacilityOwner(db, facilityId, userId);

  const from = filters.from ?? todayInTimeZone(facility.timezone, now);
  const to = filters.to ?? addDaysToIso(from, 6);
  if (from > to) {
    throw new BadRequestError("`to` must not be before `from`");
  }
  const overlaps = {
    from: dayBounds(from, facility.timezone).start,
    to: dayBounds(to, facility.timezone).end,
  };

  const facilityBookings = await findBookingsWithDetails(db, {
    order: "asc",
    facilityId: facilityId,
    staffMemberId: filters.staffMemberId,
    statuses: filters.status ? [filters.status] : undefined,
    overlaps,
  });

  return facilityBookings.map(mapBookingToContractFormat);
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
    priceCents: service.priceCents,
    currency: facility.currency,
  }).catch((e: unknown) => {
    if (getPgErrorCode(e) === PG.EXCLUSION) {
      throw new ConflictError("This time slot is already booked");
    }
    throw e;
  });

  return mapBookingToContractFormat(booking);
}

export async function changeBookingStatus(
  db: DB,
  userId: string,
  bookingId: string,
  to: "confirmed" | "canceled",
  now = new Date(),
): Promise<BookingResponse> {
  const booking = await findBookingById(db, bookingId);
  if (!booking) {
    throw new NotFoundError("Booking not found");
  }
  const actors = await resolveBookingActors(db, booking, userId);
  if (actors.length === 0) {
    throw new NotFoundError("Booking not found.");
  }
  if (booking.timeRange.start <= now) {
    throw new ConflictError("Booking already started");
  }
  const check = checkTransition(booking.status, to, actors);
  if (check === "invalid") throw new ConflictError(`Cannot change ${booking.status} → ${to}`);
  if (check === "forbidden") throw new ForbiddenError("You cannot perform this action");
  const updated = await updateBookingStatusIfCurrent(db, booking.id, booking.status, to);
  if (!updated) throw new ConflictError("Booking was changed, reload and try again");
  return mapBookingToContractFormat(updated);
}

export async function getMineBookings(
  db: DB,
  userId: string,
  scope: MyBookingsQuery["scope"],
  now = new Date(),
): Promise<BookingWithDetailsResponse[]> {
  const filters: BookingsFilter =
    scope === "upcoming"
      ? {
          order: "asc",
          clientId: userId,
          where: sql`(upper(${bookings.timeRange}) > ${now.toISOString()})`,
          statuses: ["pending", "confirmed"],
        }
      : {
          order: "desc",
          clientId: userId,
          where: sql`(upper(${bookings.timeRange}) <= ${now.toISOString()} OR ${bookings.status} = 'canceled')`,
        };
  const res = await findBookingsWithDetails(db, filters);
  return res.map(mapBookingToContractFormat);
}
