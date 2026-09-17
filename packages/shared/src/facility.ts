import * as z from "zod";
import { instantSchema, wallTimeSchema } from "./codecs";
import { serviceResponseSchema, servicesWithStaffMemberIdResponseSchema } from "./service";
import { staffMemberResponseSchema } from "./staffMembers";
export const FACILITY_CATEGORIES = [
  "BEAUTY",
  "SPORT_FITNESS",
  "MEDICAL",
  "AUTO",
  "EDUCATION",
  "OTHER",
] as const;
export const CATEGORY_METADATA: Record<
  (typeof FACILITY_CATEGORIES)[number],
  {
    label: string;
    description: string;
    icon: string;
    color: string;
    badgeClassName: string;
    slug: string;
  }
> = {
  BEAUTY: {
    slug: "beauty",
    label: "Beauty & Wellness",
    description: "Salons, barbers, nails, spa and massage",
    icon: "Sparkles",
    color: "oklch(59.2% 0.249 0.584)",
    badgeClassName: "text-pink-500 rounded-md bg-pink-100 shadow-s",
  },
  SPORT_FITNESS: {
    slug: "sport-fitness",
    label: "Sport & Fitness",
    description: "Gyms, personal training and fitness studios",
    icon: "Dumbbell",
    color: "oklch(64.6% 0.222 41.116)",
    badgeClassName: "text-orange-500 rounded-md bg-orange-100 shadow-s",
  },
  MEDICAL: {
    slug: "medical",
    label: "Medical & Health",
    description: "Clinics, dentists and health specialists",
    icon: "Stethoscope",
    color: "oklch(58.8% 0.158 241.966)",
    badgeClassName: "text-sky-500 rounded-md bg-sky-100 shadow-s",
  },
  AUTO: {
    slug: "auto",
    label: "Auto Services",
    description: "Car service, detailing and repair shops",
    icon: "Car",
    color: "oklch(44.6% 0.03 256.802)",
    badgeClassName: "text-slate-500 rounded-md bg-slate-100 shadow-s",
  },
  EDUCATION: {
    slug: "education",
    label: "Education & Tutoring",
    description: "Private lessons, courses and tutors",
    icon: "GraduationCap",
    color: "oklch(51.1% 0.262 276.966)",
    badgeClassName: "text-indigo-500 rounded-md bg-indigo-100 shadow-s",
  },
  OTHER: {
    slug: "other",
    label: "Other",
    description: "Everything else",
    icon: "Shapes",
    color: "oklch(44.2% 0.017 285.786)",
    badgeClassName: "text-zinc-500 rounded-md bg-zinc-100 shadow-s",
  },
};

export const CATEGORY_BY_SLUG = Object.fromEntries(
  Object.entries(CATEGORY_METADATA).map(([key, meta]) => [meta.slug, key]),
) as Record<string, FacilityCategory>;

export const facilityCategorySchema = z.enum(FACILITY_CATEGORIES);
export type FacilityCategory = z.infer<typeof facilityCategorySchema>;
export const facilityCategoryResponseSchema = z.object({
  categoryName: facilityCategorySchema,
  count: z.number(),
});
export type FacilityCategoryResponse = z.infer<typeof facilityCategoryResponseSchema>;

export const facilityCityResponseSchema = z.object({
  city: z.string().trim(),
});
export type FacilityCityResponse = z.infer<typeof facilityCityResponseSchema>;

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}
export const timezoneSchema = z
  .string()
  .trim()
  .refine(isValidTimeZone, { error: "Incorrect IANA" });

// Request DTOs
export const facilityFieldsSchema = z.object({
  name: z.string().trim().min(2).max(255),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  city: z.string().trim().min(1),
  country: z.string().trim().length(2),
  currency: z.string().trim().length(3).default("EUR"),
  address: z.string().trim().min(1),
  phone: z.string().trim().min(5).max(32),
  email: z.email(),
  timezoneIANA: timezoneSchema,
  category: facilityCategorySchema,
  description: z.string().trim(),
  images: z.array(z.string().trim()).default([]),
  isPublished: z.boolean().default(false),
  latitude: z.number(),
  longitude: z.number(),
});

export const createFacilityRequestSchema = facilityFieldsSchema.extend({
  country: z.string().trim().toUpperCase().pipe(z.string().trim().length(2)),
  currency: z.string().trim().toUpperCase().pipe(z.string().trim().length(3)).default("PLN"),
});
export type CreateFacilityRequest = z.infer<typeof createFacilityRequestSchema>;
// update
export const updateFacilityRequestSchema = facilityFieldsSchema.partial();
export type UpdateFacilityRequest = z.infer<typeof updateFacilityRequestSchema>;

// Response DTOs
export const facilityResponseSchema = facilityFieldsSchema.extend({
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
  country: z.string().trim(),
  city: z.string().trim().optional(),
  time: z.string().trim().optional(),
  date: z.string().trim().optional(),
  category: facilityCategorySchema.optional(),
  limit: z.coerce.number().nonnegative().optional(),
  rating: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  q: z.string().trim().optional(),
  sort: z.string().trim().optional(),
});
export type FacilityListQuery = z.infer<typeof facilityListQuerySchema>;

// booking
export const facilityDataForBookingSchema = facilityResponseSchema.extend({
  services: servicesWithStaffMemberIdResponseSchema.array(),
  staff: staffMemberResponseSchema.array(),
});
export type FacilityDataForBookingResponse = z.infer<typeof facilityDataForBookingSchema>;

export const facilityBookingQuerySchema = z.object({
  date: z.iso.date().optional(),
  service: z.uuid().optional(),
  staff: z.uuid().optional(),
  time: wallTimeSchema.optional(),
});
export type FacilityBookingQuery = z.infer<typeof facilityBookingQuerySchema>;
