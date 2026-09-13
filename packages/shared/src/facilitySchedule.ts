import z from "zod";

// Request DTOs
const dayOfTheWeekSchema = z.literal([1, 2, 3, 4, 5, 6, 7]);
export const daysAndThereNames: Record<string, DayOfTheWeek> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};
export type DayOfTheWeek = z.infer<typeof dayOfTheWeekSchema>;
const facilityScheduleSchema = z.object({
  facilityId: z.uuid(),
  dayOfTheWeek: dayOfTheWeekSchema,
  startTime: z.iso.time({ precision: 0 }),
  endTime: z.iso.time({ precision: 0 }),
});
export const facilityScheduleSchemaWithoutFacilityId = facilityScheduleSchema.omit({
  facilityId: true,
});
export const createFacilityScheduleSchema = facilityScheduleSchemaWithoutFacilityId.refine(
  (obj) => obj.startTime < obj.endTime,
  {
    message: "Open time must be before close time",
    path: ["endTime"],
  },
);
export type CreateFacilitySchedule = z.infer<typeof createFacilityScheduleSchema>;
export const updateFacilitySchedule = facilityScheduleSchemaWithoutFacilityId
  .partial()
  .superRefine((obj, ctx) => {
    if (!obj.startTime) {
      ctx.addIssue("No open time selected");
      return;
    }
    if (!obj.endTime) {
      ctx.addIssue("No close time selected");
      return;
    }
    if (obj.startTime >= obj.endTime) {
      ctx.addIssue("Open time must be before close time");
      return;
    }
  });
export type UpdateFacilitySchedule = z.infer<typeof updateFacilitySchedule>;

// Response DTOs

export const responseFacilityScheduleSchema = facilityScheduleSchema.extend({
  id: z.uuid(),
  createdAt: z.coerce.date(),
});

export type ResponseFacilityScheduleSchema = z.infer<typeof responseFacilityScheduleSchema>;
