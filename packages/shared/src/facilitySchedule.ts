import z from 'zod';

// Request DTOs
const dayOfTheWeekSchema = z.literal([1, 2, 3, 4, 5, 6, 7]);
export type DayOfTheWeek = z.infer<typeof dayOfTheWeekSchema>;
export const facilityScheduleSchema = z.object({
  facilityId: z.uuid(),
  dayOfTheWeek: dayOfTheWeekSchema,
  startTime: z.iso.time({ precision: -1 }),
  endTime: z.iso.time({ precision: -1 }),
});
export const createFacilityScheduleSchema = facilityScheduleSchema
  .omit({
    facilityId: true,
  })
  .refine((obj) => obj.startTime < obj.endTime, {
    message: 'Open time must be before close time',
    path: ['endTime'],
  });
export type CreateFacilitySchedule = z.infer<typeof createFacilityScheduleSchema>;
export const updateFacilitySchedule = facilityScheduleSchema.partial().superRefine((obj, ctx) => {
  if (!obj.startTime) {
    ctx.addIssue('No open time selected');
    return;
  }
  if (!obj.endTime) {
    ctx.addIssue('No close time selected');
    return;
  }
  if (obj.startTime >= obj.endTime) {
    ctx.addIssue('Open time must be before close time');
    return;
  }
});
export type UpdateFacilitySchedule = z.infer<typeof updateFacilitySchedule>;

// Response DTOs

export const responseFacilityScheduleSchema = createFacilityScheduleSchema.extend({
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ResponseFacilityScheduleSchema = z.infer<typeof responseFacilityScheduleSchema>;
