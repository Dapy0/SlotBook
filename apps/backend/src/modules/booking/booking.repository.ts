import type { BookingStatus } from "@slotbook/shared";
import type { DB } from "../../db/drizzlePlugin.ts";
import { bookings, type BookingEntity } from "../../db/schema/booking.ts";
import { eq, and, sql, ne } from "drizzle-orm";

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
  const facilityBookings = await db
    .select({
      start: sql<Date>`lower(${bookings.timeRange})`,
      end: sql<Date>`upper(${bookings.timeRange})`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.facilityId, facilityId),
        eq(bookings.staffMemberId, staffId),
        ne(bookings.status, "canceled"),
        sql`${bookings.timeRange} && tstzrange(${windowStart}, ${windowEnd})`,
      ),
    )
    .orderBy(sql`lower(${bookings.timeRange})`);

  return facilityBookings;
}
export async function findBookingById(db: DB, bookingId: string): Promise<BookingEntity> {
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
      }, // ключ как в схеме
    })
    .returning();

  if (!booking) {
    throw new Error("Failed to insert booking");
  }
  return booking;
}

export async function patchStatusByBookingId(
  db: DB,
  bookingId: string,
  status: BookingStatus,
): Promise<BookingEntity> {
  const [updatedBooking] = await db
    .update(bookings)
    .set({
      status,
    })
    .where(eq(bookings.id, bookingId))
    .returning();

  if (!updatedBooking) {
    throw new Error("Failed to update booking");
  }
  return updatedBooking;
}
