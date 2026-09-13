import { facilityCategorySchema } from "@slotbook/shared/facility";
import z from "zod";

export const facilityListQuerySchema = z.object({
  country: z.string(),
  category: facilityCategorySchema.optional(),
  limit: z.coerce.number().nonnegative().optional(),
  rating: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  q: z.string().optional(),
  sort: z.string().optional(),
});
export type FacilityListQuery = z.infer<typeof facilityListQuerySchema>;
export const facilityParamsSchema = z.object({
  id: z.uuid(),
});
export type FacilityParams = z.infer<typeof facilityParamsSchema>;

export const facilityCategoryQuerystringSchema = z.object({
  limit: z.coerce.number().nonnegative().optional(),
  country: z.string(),
});
export type FacilityCategoryQuerystring = z.infer<typeof facilityCategoryQuerystringSchema>;
