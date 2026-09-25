import { api } from "@/lib/api";
import { bookingResponseSchema, type CreateBookingRequest } from "@slotbook/shared";

export async function createBooking(facilityId: string, data: CreateBookingRequest) {
  return await api(`/facilities/${facilityId}/bookings`, bookingResponseSchema, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function getFacilityBookings(facilityId: string) {
  return await api(`/facilities/${facilityId}/bookings`, bookingResponseSchema);
}

export async function getMineBookings(cookie: string) {
  return await api(`/bookings/mine`, bookingResponseSchema.array(), {
    headers: {
      cookie: cookie,
    },
  });
}
export async function updateBookingStatus(bookingId: string, status: "confirmed" | "canceled") {
  return api(`/bookings/${bookingId}`, bookingResponseSchema, {
    method: "PATCH",
    body: JSON.stringify({ status: status }),
  });
}
