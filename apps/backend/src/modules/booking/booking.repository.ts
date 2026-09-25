import type { BookingStatus } from "@slotbook/shared";
import type { DB } from "../../db/drizzlePlugin.ts";
import { bookings, type BookingEntity } from "../../db/schema/booking.ts";
import { eq, and, sql, inArray } from "drizzle-orm";

export async function findBookingsByFacilityId(
  db: DB,
  facilityId: string,
): Promise<BookingEntity[]> {
  const facilityBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.facilityId, facilityId));
  return facilityBookings;
}
export async function findBusyRangesForStaff(
  db: DB,
  facilityId: string,
  staffId: string,
  windowStart: Date,
  windowEnd: Date,
): Promise<{ start: Date; end: Date }[]> {
  const rows = await db
    .select({ timeRange: bookings.timeRange })
    .from(bookings)
    .where(
      and(
        eq(bookings.facilityId, facilityId),
        eq(bookings.staffMemberId, staffId),
        inArray(bookings.status, ["pending", "confirmed"]),
        sql`${bookings.timeRange} && tstzrange(${windowStart.toISOString()}, ${windowEnd.toISOString()})`,
      ),
    )
    .orderBy(sql`lower(${bookings.timeRange})`);

  return rows.map((r) => r.timeRange);
}
export async function findBookingById(
  db: DB,
  bookingId: string,
): Promise<BookingEntity | undefined> {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  return booking;
}

export async function insertBooking(
  db: DB,
  data: {
    clientId: string;
    facilityId: string;
    staffMemberId: string;
    serviceId: string;
    priceCents: number;
    currency: string;
    startDatetime: Date;
    endDatetime: Date;
  },
): Promise<BookingEntity> {
  const [booking] = await db
    .insert(bookings)
    .values({
      clientId: data.clientId,
      facilityId: data.facilityId,
      staffMemberId: data.staffMemberId,
      serviceId: data.serviceId,
      timeRange: {
        start: data.startDatetime,
        end: data.endDatetime,
      },
      priceCents: data.priceCents,
      currency: data.currency,
    })
    .returning();

  if (!booking) {
    throw new Error("Failed to insert booking");
  }
  return booking;
}

export async function updateBookingStatusIfCurrent(
  db: DB,
  bookingId: string,
  from: BookingStatus,
  to: BookingStatus,
): Promise<BookingEntity> {
  const [updatedBooking] = await db
    .update(bookings)
    .set({
      status: to,
    })
    .where(and(eq(bookings.id, bookingId), eq(bookings.status, from)))
    .returning();

  return updatedBooking;
}

export async function findBookingsByUserId(db: DB, userId: string): Promise<BookingEntity[]> {
  return await db.select().from(bookings).where(eq(bookings.clientId, userId));
}
