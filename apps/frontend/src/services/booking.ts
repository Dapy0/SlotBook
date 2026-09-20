import { api } from "@/lib/api";
import {
  bookingResponseSchema,
  type CreateBookingRequest,
} from "@slotbook/shared";

export async function createBooking(facilityId: string, data: CreateBookingRequest) {

  return await api(`/facilities/${facilityId}/bookings`, bookingResponseSchema, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function getFacilityBookings(facilityId: string) {
  return await api(`/facilities/${facilityId}/bookings`, bookingResponseSchema);
}
