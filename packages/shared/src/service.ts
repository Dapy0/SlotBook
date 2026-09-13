import * as z from "zod";

// Request DTOs
export const createServiceSchema = z.object({
  name: z.string().trim().min(2).max(255),
  description: z.string().trim(),
  category: z.string().trim(),
  durationMinutes: z.int()
    .positive()
    .max(24 * 60),
  priceCents: z.int().nonnegative(),
  currency: z.string().trim().length(3).default("PLN"),
  isActive: z.boolean().default(false),
});
export type CreateServiceRequest = z.infer<typeof createServiceSchema>;
export const updateServiceSchema = createServiceSchema.partial();
export type UpdateServiceRequest = z.infer<typeof updateServiceSchema>;
// Response DTOs

export const serviceResponseSchema = createServiceSchema.extend({
  id: z.uuid(),
  facilityId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ServiceResponseDTO = z.infer<typeof serviceResponseSchema>;
