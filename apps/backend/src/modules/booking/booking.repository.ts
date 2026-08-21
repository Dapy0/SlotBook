import type { DB } from '../../db/drizzlePlugin.ts';
import { bookings } from '../../db/schema/booking.ts';
import { eq } from 'drizzle-orm';

export async function findBookingsByFacilityId(db: DB, facilityId: string) {
  const facilityBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.facilityId, facilityId));
  return facilityBookings;
}

function toTsRangeLiteral(start: Date, end: Date): string {
  return `[${start.toISOString()},${end.toISOString()})`;
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
) {
  const [booking] = await db
    .insert(bookings)
    .values({
      clientId: data.clientId,
      facilityId: data.facilityId,
      staffMemberId: data.staffMemberId,
      serviceId: data.serviceId,
      timeRange: toTsRangeLiteral(data.startDatetime, data.endDatetime), // ключ как в схеме
    })
    .returning();

  if (!booking) {
    throw new Error('Failed to insert booking');
  }
  return booking;
}
