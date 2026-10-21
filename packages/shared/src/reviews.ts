import * as z from "zod";
import { instantSchema } from "./common/codecs";
import type { BookingResponse } from "./bookings";

export const REVIEW_WINDOW_DAYS = 30;

const reviewBaseSchema = z.object({
  rating: z.int().min(1).max(5),
});

// Request
export const createReviewRequestSchema = reviewBaseSchema.extend({
  comment: z.string().trim().min(1).max(1000).optional(),
});

export type CreateReviewRequest = z.infer<typeof createReviewRequestSchema>;

// Response
export const reviewResponseSchema = reviewBaseSchema.extend({
  id: z.uuid(),
  authorName: z.string().trim(),
  staffMemberName: z.string().trim(),
  serviceName: z.string().trim(),
  comment: z.string().trim().nullable(),
  createdAt: instantSchema,
});
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;

export const myReviewSchema = reviewResponseSchema.pick({
  id: true,
  rating: true,
  comment: true,
  createdAt: true,
});
export type MyReview = z.infer<typeof myReviewSchema>;

const DAY_MS = 24 * 60 * 60 * 1000;

export function canClientReview(
  booking: Pick<BookingResponse, "status" | "endsAt">,
  now: Date,
): boolean {
  const windowEnd = booking.endsAt.getTime() + REVIEW_WINDOW_DAYS * DAY_MS;
  return booking.status === "confirmed" && booking.endsAt <= now && now.getTime() < windowEnd;
}
