import { api } from "@/lib/api";
import {
  bookingResponseSchema,
  type BookingRequest,
  type BookingRequestInput,
  type BookingResponse,
} from "@slotbook/shared/bookings";

export async function createBooking(facilityId: string, data: BookingRequestInput) {
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
