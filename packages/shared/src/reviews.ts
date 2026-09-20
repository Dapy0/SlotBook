import * as z from "zod";
import { instantSchema } from "./common/codecs";

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
