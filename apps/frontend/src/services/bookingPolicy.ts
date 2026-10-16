import { api } from "@/lib/api";
import { bookingPolicyResponseSchema, type UpdateBookingPolicyRequest } from "@slotbook/shared";

export async function updateBookingPolicy(facilityId: string, payload: UpdateBookingPolicyRequest) {
  return api(`/facilities/${facilityId}/booking-policy`, bookingPolicyResponseSchema, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
