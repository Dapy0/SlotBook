import * as z from "zod";
import { instantSchema, wallTimeSchema } from "./common/codecs";
import { serviceResponseSchema, serviceWithStaffMemberIdsResponseSchema } from "./service";
import { staffMemberPublicResponseSchema } from "./staffMembers";
import {
  countryCodeInputSchema,
  currencyCodeInputSchema,
  timezoneSchema,
} from "./common/primitives";
import { ANY_FIELD_MESSAGE, hasAnyField } from "./common/refinements";
import { publicBookingPolicySchema } from "./bookingPolicy";
import { facilityImageSchema } from "./facilityImage";

export const FACILITY_READINESS_KEYS = [
  "HAS_HOURS",
  "HAS_ACTIVE_SERVICE",
  "HAS_BOOKABLE_STAFF",
  "HAS_LOCATION",
] as const;
export const facilityReadinessKeysSchema = z.enum(FACILITY_READINESS_KEYS);
export type FacilityReadinessKey = z.infer<typeof facilityReadinessKeysSchema>;
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
  country: z.string().trim().length(2),
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
  isPublished: z.boolean(),
  latitude: z.number(),
  longitude: z.number(),
});

const facilityRequestBaseSchema = facilityBaseSchema.extend({
  country: countryCodeInputSchema,
  currency: currencyCodeInputSchema,
});
export const createFacilityRequestSchema = facilityRequestBaseSchema
  .omit({ slug: true, isPublished: true })
  .extend({
    currency: currencyCodeInputSchema.default("PLN"),
    description: z.string().trim().max(1000).default(""),
  });
export type CreateFacilityRequest = z.infer<typeof createFacilityRequestSchema>;

export const updateFacilityRequestSchema = facilityRequestBaseSchema
  .omit({ isPublished: true })
  .partial()
  .refine(hasAnyField, { error: ANY_FIELD_MESSAGE });
export type UpdateFacilityRequest = z.infer<typeof updateFacilityRequestSchema>;

export const facilityReadinessResponseSchema = z.object({
  ready: z.boolean(),
  checks: z.array(
    z.object({
      key: facilityReadinessKeysSchema,
      ok: z.boolean(),
    }),
  ),
});
export type FacilityReadinessResponse = z.infer<typeof facilityReadinessResponseSchema>;
// Response
export const facilityResponseSchema = facilityBaseSchema.extend({
  id: z.uuid(),
  ownerId: z.uuid(),
  score: z.number().min(0).max(5).nullable(),
  reviewsCount: z.int().nonnegative(),
  images: z.array(facilityImageSchema),
  createdAt: instantSchema,
  updatedAt: instantSchema,
});
export type FacilityResponse = z.infer<typeof facilityResponseSchema>;

// FacilityWithServices
export const facilityWithServicesResponseSchema = facilityResponseSchema.extend({
  services: serviceResponseSchema.array(),
});
export type FacilityWithServicesResponse = z.infer<typeof facilityWithServicesResponseSchema>;

export const FACILITY_SORTS = [
  "recommended",
  "rating",
  "reviews",
  "priceAsc",
  "priceDesc",
  "newest",
] as const;
export const facilitySortSchema = z.enum(FACILITY_SORTS);
export type FacilitySort = z.infer<typeof facilitySortSchema>;
export const SEARCH_PAGE_SIZE = 12;
export const SEARCH_MAX_PAGE_SIZE = 48;
export const SEARCH_MAX_PAGE = 100;
const optionalTrimmedSchema = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v ?? undefined);
export const facilitySearchQuerySchema = z.object({
  country: countryCodeInputSchema,
  q: optionalTrimmedSchema(100),
  city: optionalTrimmedSchema(120),
  category: facilityCategorySchema.optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  priceMax: z.coerce.number().int().positive().optional(),
  sort: facilitySortSchema.default("recommended"),
  page: z.coerce.number().int().min(1).max(SEARCH_MAX_PAGE).default(1),
  pageSize: z.coerce.number().int().min(1).max(SEARCH_MAX_PAGE_SIZE).default(SEARCH_PAGE_SIZE),
});
export type FacilitySearchQuery = z.infer<typeof facilitySearchQuerySchema>;
export type FacilitySearchInput = z.input<typeof facilitySearchQuerySchema>;

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
  bookingPolicy: publicBookingPolicySchema,
});

export type FacilityDataForBookingResponse = z.infer<typeof facilityBookingDataResponseSchema>;

export const facilitySearchItemSchema = facilityWithServicesResponseSchema.extend({
  minPriceCents: z.int().nonnegative().nullable(),
});
export type FacilitySearchItem = z.infer<typeof facilitySearchItemSchema>;
export const facilitySearchResponseSchema = z.object({
  items: facilitySearchItemSchema.array(),
  total: z.int().nonnegative(),
  page: z.int().positive(),
  pageSize: z.int().positive(),
  totalPages: z.int().nonnegative(),
});
export type FacilitySearchResponse = z.infer<typeof facilitySearchResponseSchema>;
export const facilityFacetsResponseSchema = z.object({
  categories: facilityCategoryCountResponseSchema.array(),
  cities: facilityCityResponseSchema.array(),
  price: z
    .object({
      minCents: z.int().nonnegative(),
      maxCents: z.int().nonnegative(),
      currency: z.string().trim().length(3),
    })
    .nullable(),
});
export type FacilityFacetsResponse = z.infer<typeof facilityFacetsResponseSchema>;
