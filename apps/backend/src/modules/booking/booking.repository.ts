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
