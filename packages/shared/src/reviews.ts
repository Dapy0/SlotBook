import z from 'zod';
export const createReviewRequestSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export type CreateReviewRequest = z.infer<typeof createReviewRequestSchema>;

export const reviewResponseSchema = z.object({
  id: z.uuid(),
  // bookingId: z.uuid(),
  staffMemberName: z.string(),
  // serviceId: z.uuid(),
  serviceName: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.coerce.date(),
});
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;
