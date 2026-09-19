import * as z from "zod";
import { instantSchema } from "./common/codecs";

export const reviewFieldsSchema = z.object({
  rating: z.int().min(1).max(5),
  comment: z.string().trim().optional(),
});

export const reviewRequestSchema = reviewFieldsSchema;

export type ReviewRequest = z.infer<typeof reviewRequestSchema>;

export const reviewResponseSchema = reviewFieldsSchema.extend({
  id: z.uuid(),
  staffMemberName: z.string().trim(),
  serviceName: z.string().trim(),
  createdAt: instantSchema,
});
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;
