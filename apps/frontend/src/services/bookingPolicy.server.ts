import { apiWithAuth } from "@/lib/api.server";
import { bookingPolicyResponseSchema } from "@slotbook/shared";

export async function getBookingPolicy(facilityId: string) {
  return apiWithAuth(`/facilities/${facilityId}/booking-policy`, bookingPolicyResponseSchema);
}
