import * as z from "zod";
import { instantSchema } from "./codecs";
export const createReviewRequestSchema = z.object({
  rating: z.int().min(1).max(5),
  comment: z.string().trim().optional(),
});

export type CreateReviewRequest = z.infer<typeof createReviewRequestSchema>;

export const reviewResponseSchema = z.object({
  id: z.uuid(),
  // bookingId: z.uuid(),
  staffMemberName: z.string().trim(),
  // serviceId: z.uuid(),
  serviceName: z.string().trim(),
  rating: z.int().min(1).max(5),
  comment: z.string().trim().nullable(),
  createdAt: instantSchema,
});
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;
