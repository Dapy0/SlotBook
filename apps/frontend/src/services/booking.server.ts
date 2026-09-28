import { apiWithAuth } from '@/lib/api.server';
import { bookingWithDetailsResponseSchema, type MyBookingsQuery } from '@slotbook/shared';

export async function getMineBookings(scope: MyBookingsQuery["scope"]) {
  return await apiWithAuth(
    `/bookings/mine?scope=${scope}`,
    bookingWithDetailsResponseSchema.array(),
  );
}
