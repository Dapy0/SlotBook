import { api } from "@/lib/api";
import { myReviewSchema, reviewResponseSchema, type CreateReviewRequest } from "@slotbook/shared";

export async function getFacilityReviews(facilityId: string) {
  return await api(`/facilities/${facilityId}/reviews`, reviewResponseSchema.array());
}

export async function createReview(
  facilityId: string,
  bookingId: string,
  body: CreateReviewRequest,
) {
  return await api(`/facilities/${facilityId}/bookings/${bookingId}/reviews`, myReviewSchema, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
