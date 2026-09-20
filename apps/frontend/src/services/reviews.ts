import { api } from "@/lib/api";
import { reviewResponseSchema } from "@slotbook/shared";

export async function getFacilityReviews(facilityId: string) {
  return await api(`/facilities/${facilityId}/reviews`, reviewResponseSchema.array());
}
