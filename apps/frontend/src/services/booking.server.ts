import { apiWithAuth } from "@/lib/api.server";
import { createParams } from "@/lib/queryStrings";
import {
  bookingWithDetailsResponseSchema,
  clientBookingResponseSchema,
  facilityBookingResponseSchema,
  type BookingQuery,
  type MyBookingsQuery,
} from "@slotbook/shared";

export async function getMineBookings(scope: MyBookingsQuery["scope"]) {
  return await apiWithAuth(`/bookings/mine?scope=${scope}`, clientBookingResponseSchema.array());
}
export async function getFacilityBookings(facilityId: string, query: BookingQuery) {
  const queryParams = createParams({ ...query });
  return await apiWithAuth(
    queryParams
      ? `/facilities/${facilityId}/bookings/?${queryParams}`
      : `/facilities/${facilityId}/bookings`,
    facilityBookingResponseSchema.array(),
  );
}
