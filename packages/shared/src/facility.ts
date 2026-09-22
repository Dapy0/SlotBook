import * as z from "zod";
import { calendarDateSchema, instantSchema, wallTimeSchema } from "./common/codecs";
import { serviceResponseSchema, serviceWithStaffMemberIdsResponseSchema } from "./service";
import { staffMemberPublicResponseSchema } from "./staffMembers";
import {
  countryCodeInputSchema,
  currencyCodeInputSchema,
  timezoneSchema,
} from "./common/primitives";
import { ANY_FIELD_MESSAGE, hasAnyField } from "./common/refinements";

export const FACILITY_CATEGORIES = [
  "BEAUTY",
  "SPORT_FITNESS",
  "MEDICAL",
  "AUTO",
  "EDUCATION",
  "OTHER",
] as const;
export const facilityCategorySchema = z.enum(FACILITY_CATEGORIES);
export type FacilityCategory = z.infer<typeof facilityCategorySchema>;

//  Response Category
export const facilityCategoryQuerySchema = z.object({
  country: z.string().trim(),
  limit: z.coerce.number().nonnegative().optional(),
});
export type FacilityCategoryQuery = z.infer<typeof facilityCategoryQuerySchema>;

export const facilityCategoryCountResponseSchema = z.object({
  categoryName: facilityCategorySchema,
  count: z.int().nonnegative(),
});
export type FacilityCategoryCountResponse = z.infer<typeof facilityCategoryCountResponseSchema>;

export const facilityCityResponseSchema = z.object({
  city: z.string().trim(),
});
export type FacilityCityResponse = z.infer<typeof facilityCityResponseSchema>;

// Request
const facilityBaseSchema = z.object({
  name: z.string().trim().min(2).max(255),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  city: z.string().trim().min(1),
  country: z.string().trim().length(2),
  currency: z.string().trim().length(3),
  address: z.string().trim().min(1),
  phone: z.string().trim().min(5).max(32),
  email: z.email(),
  timezone: timezoneSchema,
  category: facilityCategorySchema,
  description: z.string().trim().max(1000),
  images: z.array(z.url()),
  isPublished: z.boolean(),
  latitude: z.number(),
  longitude: z.number(),
});

const facilityRequestBaseSchema = facilityBaseSchema.extend({
  country: countryCodeInputSchema,
  currency: currencyCodeInputSchema,
});
export const createFacilityRequestSchema = facilityRequestBaseSchema.extend({
  currency: currencyCodeInputSchema.default("PLN"),
  images: z.array(z.url()).default([]),
  isPublished: z.boolean().default(false),
});
export type CreateFacilityRequest = z.infer<typeof createFacilityRequestSchema>;

export const updateFacilityRequestSchema = facilityRequestBaseSchema
  .partial()
  .refine(hasAnyField, { error: ANY_FIELD_MESSAGE });
export type UpdateFacilityRequest = z.infer<typeof updateFacilityRequestSchema>;

// Response
export const facilityResponseSchema = facilityBaseSchema.extend({
  id: z.uuid(),
  ownerId: z.uuid(),
  score: z.number().min(0).max(5).nullable(),
  reviewsCount: z.int().nonnegative(),
  createdAt: instantSchema,
  updatedAt: instantSchema,
});
export type FacilityResponse = z.infer<typeof facilityResponseSchema>;

// FacilityWithServices
export const facilityWithServicesResponseSchema = facilityResponseSchema.extend({
  services: serviceResponseSchema.array(),
});
export type FacilityWithServicesResponse = z.infer<typeof facilityWithServicesResponseSchema>;

export const facilityListQuerySchema = z.object({
  country: countryCodeInputSchema,
  city: z.string().trim().optional(),
  time: wallTimeSchema.optional(),
  date: calendarDateSchema.optional(),
  category: facilityCategorySchema.optional(),
  limit: z.coerce.number().int().positive().max(50).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  rating: z.coerce.number().min(0).max(5).optional(),
  priceMaxCents: z.coerce.number().int().nonnegative().optional(),
  q: z.string().trim().optional(),
  sort: z.enum(["rating", "priceAsc", "priceDesc"]).optional(),
});
export type FacilityListQuery = z.infer<typeof facilityListQuerySchema>;
// booking

export const facilityBookingQuerySchema = z.object({
  date: z.iso.date().optional(),
  service: z.uuid().optional(),
  staff: z.uuid().optional(),
  time: wallTimeSchema.optional(),
});
export type FacilityBookingQuery = z.infer<typeof facilityBookingQuerySchema>;

export const facilityBookingDataResponseSchema = facilityResponseSchema.extend({
  services: serviceWithStaffMemberIdsResponseSchema.array(),
  staff: staffMemberPublicResponseSchema.array(),
});
export type FacilityDataForBookingResponse = z.infer<typeof facilityBookingDataResponseSchema>;
