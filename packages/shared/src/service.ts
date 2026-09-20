import * as z from "zod";
import { instantSchema } from "./common/codecs";
import { ANY_FIELD_MESSAGE, hasAnyField } from "./common/refinements";
import { currencyCodeSchema } from './common/primitives';

const serviceBaseSchema = z.object({
  name: z.string().trim().min(2).max(255),
  description: z.string().trim().max(1000),
  category: z.string().trim().min(1).max(100),
  durationMinutes: z
    .int()
    .positive()
    .max(24 * 60),
  priceCents: z.int().nonnegative(),
  isActive: z.boolean(),
});

// Request
export const createServiceRequestSchema = serviceBaseSchema.extend({
  isActive: z.boolean().default(false),
});
export type CreateServiceRequest = z.infer<typeof createServiceRequestSchema>;

export const updateServiceRequestSchema = serviceBaseSchema
  .partial()
  .refine(hasAnyField, { error: ANY_FIELD_MESSAGE });
export type UpdateServiceRequest = z.infer<typeof updateServiceRequestSchema>;

// Response
export const serviceResponseSchema = serviceBaseSchema.extend({
  id: z.uuid(),
  facilityId: z.uuid(),
  currency: currencyCodeSchema,
  createdAt: instantSchema,
  updatedAt: instantSchema,
});

export type ServiceResponse = z.infer<typeof serviceResponseSchema>;

export const serviceWithStaffMemberIdsResponseSchema = serviceResponseSchema.extend({
  staffMemberIds: z.array(z.uuid()),
});

export type ServiceWithStaffMemberIdsResponse = z.infer<
  typeof serviceWithStaffMemberIdsResponseSchema
>;
