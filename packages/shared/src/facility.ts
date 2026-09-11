import z from 'zod';
export const FACILITY_CATEGORIES = [
  'BEAUTY',
  'SPORT_FITNESS',
  'MEDICAL',
  'AUTO',
  'EDUCATION',
  'OTHER',
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
    slug: 'beauty',
    label: 'Beauty & Wellness',
    description: 'Salons, barbers, nails, spa and massage',
    icon: 'Sparkles',
    color: 'oklch(59.2% 0.249 0.584)',
    badgeClassName: 'text-pink-500 rounded-md bg-pink-100 shadow-s',
  },
  SPORT_FITNESS: {
    slug: 'sport-fitness',
    label: 'Sport & Fitness',
    description: 'Gyms, personal training and fitness studios',
    icon: 'Dumbbell',
    color: 'oklch(64.6% 0.222 41.116)',
    badgeClassName: 'text-orange-500 rounded-md bg-orange-100 shadow-s',
  },
  MEDICAL: {
    slug: 'medical',
    label: 'Medical & Health',
    description: 'Clinics, dentists and health specialists',
    icon: 'Stethoscope',
    color: 'oklch(58.8% 0.158 241.966)',
    badgeClassName: 'text-sky-500 rounded-md bg-sky-100 shadow-s',
  },
  AUTO: {
    slug: 'auto',
    label: 'Auto Services',
    description: 'Car service, detailing and repair shops',
    icon: 'Car',
    color: 'oklch(44.6% 0.03 256.802)',
    badgeClassName: 'text-slate-500 rounded-md bg-slate-100 shadow-s',
  },
  EDUCATION: {
    slug: 'education',
    label: 'Education & Tutoring',
    description: 'Private lessons, courses and tutors',
    icon: 'GraduationCap',
    color: 'oklch(51.1% 0.262 276.966)',
    badgeClassName: 'text-indigo-500 rounded-md bg-indigo-100 shadow-s',
  },
  OTHER: {
    slug: 'other',
    label: 'Other',
    description: 'Everything else',
    icon: 'Shapes',
    color: 'oklch(44.2% 0.017 285.786)',
    badgeClassName: 'text-zinc-500 rounded-md bg-zinc-100 shadow-s',
  },
};

export const CATEGORY_BY_SLUG = Object.fromEntries(
  Object.entries(CATEGORY_METADATA).map(([key, meta]) => [meta.slug, key]),
) as Record<string, FacilityCategory>;

export const facilityCategorySchema = z.enum(FACILITY_CATEGORIES);
export type FacilityCategory = z.infer<typeof facilityCategorySchema>;

const supportedTimezones = Intl.supportedValuesOf('timeZone');

export const timezoneSchema = z
  .string()
  .refine((tz) => supportedTimezones.includes(tz), { message: 'Incorrect IANA' });
// Request DTOs
export const createFacilityRequestSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z
    .string()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  city: z.string().min(1),
  country: z.string().min(1).max(2),
  address: z.string().min(1),
  phone: z.string().min(5).max(32),
  email: z.email(),
  timezoneIANA: timezoneSchema,
  category: facilityCategorySchema,
  description: z.string(),
  images: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  latitude: z.number(),
  longitude: z.number(),
});
export type CreateFacilityRequest = z.infer<typeof createFacilityRequestSchema>;
// update
export const updateFacilityRequestSchema = createFacilityRequestSchema.partial();
export type UpdateFacilityRequest = z.infer<typeof updateFacilityRequestSchema>;

// Response DTOs
export const facilityResponseSchema = createFacilityRequestSchema.extend({
  id: z.uuid(),
  ownerId: z.uuid(),
  score: z.number().min(0).max(5).nullable(),
  reviewsCount: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type FacilityResponseDTO = z.infer<typeof facilityResponseSchema>;
