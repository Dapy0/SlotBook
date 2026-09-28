import type { BookingStatus } from "@slotbook/shared";
import type { DB } from "../../db/drizzlePlugin.ts";
import { bookings, type BookingEntity } from "../../db/schema/booking.ts";
import { eq, and, sql, inArray, type SQL, getColumns, asc, desc } from "drizzle-orm";
import { facilities, services, staffMembers, users } from "../../db/schema";
import { alias } from "drizzle-orm/pg-core";
import type { BookingsFilter } from "./booking.schema";

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

type BookingEntityWithDetails = BookingEntity & {
  facilityName: string;
  facilitySlug: string;
  facilityTimezone: string;
  serviceName: string;
  staffMemberName: string;
  clientName: string;
};
const clientUser = alias(users, "client_user");
const staffUser = alias(users, "staff_user");
export async function findBookingsWithDetails(
  db: DB,
  filter: BookingsFilter,
): Promise<BookingEntityWithDetails[]> {
  const filters: SQL[] = [];
  if (filter.clientId !== undefined) filters.push(eq(bookings.clientId, filter.clientId));
  if (filter.facilityId !== undefined) filters.push(eq(bookings.facilityId, filter.facilityId));
  if (filter.staffMemberId !== undefined)
    filters.push(eq(bookings.staffMemberId, filter.staffMemberId));

  if (filter.overlaps !== undefined)
    filters.push(
      sql`${bookings.timeRange} && tstzrange(${filter.overlaps.from.toISOString()}, ${filter.overlaps.to.toISOString()})`,
    );
  if (filter.where !== undefined) filters.push(filter.where);
  if (filter.statuses) filters.push(inArray(bookings.status, filter.statuses));
  const query = db
    .select({
      facilityName: facilities.name,
      facilitySlug: facilities.slug,
      facilityTimezone: facilities.timezone,
      serviceName: services.name,
      staffMemberName: staffUser.name,
      clientName: clientUser.name,
      ...getColumns(bookings),
    })
    .from(bookings)
    .innerJoin(facilities, eq(bookings.facilityId, facilities.id))
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(staffMembers, eq(bookings.staffMemberId, staffMembers.id))
    .innerJoin(clientUser, eq(bookings.clientId, clientUser.id))
    .innerJoin(staffUser, eq(staffMembers.userId, staffUser.id))
    .where(and(...filters))
    .orderBy(filter.order === "asc" ? asc(bookings.timeRange) : desc(bookings.timeRange))
    .$dynamic();

  if (filter.limit !== undefined) {
    query.limit(filter.limit);
  }
  console.log(query.toSQL());
  return await query;
}
