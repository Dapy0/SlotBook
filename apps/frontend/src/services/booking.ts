import { api } from "@/lib/api";
import {
  bookingResponseSchema,
  type BookingRequest,
  type BookingResponse,
} from "@slotbook/shared/bookings";

export async function createBooking(facilityId: string, data: BookingRequest) {
  const result = bookingResponseSchema.parse(
    await api<BookingResponse>(`/facilities/${facilityId}/bookings`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  );

  return result;
}
export async function getFacilityBookings(facilityId: string) {
  const result = await api<BookingResponse>(`/facilities/${facilityId}/bookings`, {
    method: "GET",
  });

  return result;
}
