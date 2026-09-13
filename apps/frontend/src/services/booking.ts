import { api } from "@/lib/api";
import type { BookingResponse } from "@slotbook/shared/bookings";

export type CreateBookingPayload = {
  staffMemberId: string;
  serviceId: string;
  startDatetime: string;
};

export async function createBooking(facilityId: string, data: CreateBookingPayload) {
  const result = await api<BookingResponse>(`/facilities/${facilityId}/bookings`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return result;
}
export async function getFacilityBookings(facilityId: string) {
  const result = await api<BookingResponse>(`/facilities/${facilityId}/bookings`, {
    method: "GET",
  });

  return result;
}
