import z from 'zod';
export const FACILITY_CATEGORIES = [
  'BEAUTY',
  'SPORT_FITNESS',
  'MEDICAL',
  'AUTO',
  'EDUCATION',
  'OTHER',
] as const;
export const facilityCategorySchema = z.enum(FACILITY_CATEGORIES);
export type FacilityCategory = z.infer<typeof facilityCategorySchema>;

// Facility Schema
const dayScheduleSchema = z
  .object({
    open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:MM'),
    close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:MM'),
  })
  .nullable();
const weekScheduleSchema = z.object({
  mon: dayScheduleSchema,
  tue: dayScheduleSchema,
  wed: dayScheduleSchema,
  thu: dayScheduleSchema,
  fri: dayScheduleSchema,
  sat: dayScheduleSchema,
  sun: dayScheduleSchema,
});
export type WeekSchedule = z.infer<typeof weekScheduleSchema>;

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
  workingHours: weekScheduleSchema,
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





export type Service = {
  id: string;
  facilityId: string;
  name: string;
  description: string | null;
  category: string | null;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  isActive: boolean;
};


export type CreateServicePayload = {
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  priceCents: number;
  currency: string;
};
