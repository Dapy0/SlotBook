import * as z from "zod";
import { isoDateSchema } from "./codecs";

// Request DTOs
export const serviceFieldsSchema = z.object({
  name: z.string().trim().min(2).max(255),
  description: z.string().trim(),
  category: z.string().trim(),
  durationMinutes: z
    .int()
    .positive()
    .max(24 * 60),
  priceCents: z.int().nonnegative(),
  isActive: z.boolean().default(false),
});
export const createServiceSchema = serviceFieldsSchema;
export type CreateServiceRequest = z.infer<typeof createServiceSchema>;
export const updateServiceSchema = createServiceSchema.partial();
export type UpdateServiceRequest = z.infer<typeof updateServiceSchema>;
// Response DTOs

export const serviceResponseSchema = createServiceSchema.extend({
  id: z.uuid(),
  facilityId: z.uuid(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  currency: z.string().trim().length(3),
});

export type ServiceResponseDTO = z.infer<typeof serviceResponseSchema>;

export const servicesWithStaffMemberIdResponseSchema = serviceResponseSchema.extend({
  staffMemberIds: z.array(z.string().trim()),
});

export type ServicesWithStaffMemberIdResponse = z.infer<
  typeof servicesWithStaffMemberIdResponseSchema
>;
