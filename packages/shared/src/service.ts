import z from 'zod';
import { createFacilityRequestSchema } from './facilities';

// Request DTOs
export const createServiceSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string(),
  category: z.string(),
  durationMinutes: z
    .number()
    .int()
    .positive()
    .max(24 * 60),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().length(3).default('PLN'),
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
