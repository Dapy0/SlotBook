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
  { label: string; description: string; icon: string }
> = {
  BEAUTY: {
    label: 'Beauty & Wellness',
    description: 'Salons, barbers, nails, spa and massage',
    icon: 'Sparkles',
  },
  SPORT_FITNESS: {
    label: 'Sport & Fitness',
    description: 'Gyms, personal training and fitness studios',
    icon: 'Dumbbell',
  },
  MEDICAL: {
    label: 'Medical & Health',
    description: 'Clinics, dentists and health specialists',
    icon: 'Stethoscope',
  },
  AUTO: {
    label: 'Auto Services',
    description: 'Car service, detailing and repair shops',
    icon: 'Car',
  },
  EDUCATION: {
    label: 'Education & Tutoring',
    description: 'Private lessons, courses and tutors',
    icon: 'GraduationCap',
  },
  OTHER: {
    label: 'Other',
    description: 'Everything else',
    icon: 'Shapes',
  },
};

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
  address: z.string().min(1),
  phone: z.string().min(5).max(32),
  email: z.email(),
  timezoneIANA: timezoneSchema,
  category: facilityCategorySchema,
  description: z.string(),
  images: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});
export type CreateFacilityRequest = z.infer<typeof createFacilityRequestSchema>;
// update
export const updateFacilityRequestSchema = createFacilityRequestSchema.partial();
export type UpdateFacilityRequest = z.infer<typeof updateFacilityRequestSchema>;

// Response DTOs
export const facilityResponseSchema = createFacilityRequestSchema.extend({
  id: z.uuid(),
  ownerId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type FacilityResponseDTO = z.infer<typeof facilityResponseSchema>;
