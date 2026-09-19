import * as z from "zod";
import { instantSchema, wallTimeSchema } from "./common/codecs";

// Request DTOs
const dayOfTheWeekSchema = z.literal([1, 2, 3, 4, 5, 6, 7]);
export const staffScheduleSchema = z.object({
  staffMemberId: z.uuid(),
  dayOfTheWeek: dayOfTheWeekSchema,
  startTime: wallTimeSchema,
  endTime: wallTimeSchema,
});
export const staffScheduleSchemaWithoutStaffId = staffScheduleSchema.omit({
  staffMemberId: true,
});
export const createStaffScheduleSchema = staffScheduleSchemaWithoutStaffId.refine(
  (obj) => obj.startTime < obj.endTime,
  {
    message: "Start Time must be before end time",
    path: ["endTime"],
  },
);
export type CreateStaffSchedule = z.infer<typeof createStaffScheduleSchema>;
export const updateStaffSchedule = staffScheduleSchemaWithoutStaffId
  .partial()
  .superRefine((obj, ctx) => {
    if (!obj.startTime) {
      ctx.addIssue("No start time selected");
      return;
    }
    if (!obj.endTime) {
      ctx.addIssue("No end time selected");
      return;
    }
    if (obj.startTime >= obj.endTime) {
      ctx.addIssue("Start Time must be before end time");
      return;
    }
  });
export type UpdateStaffSchedule = z.infer<typeof updateStaffSchedule>;

// Response DTOs

export const responseStaffScheduleSchema = createStaffScheduleSchema.extend({
  id: z.uuid(),
  createdAt: instantSchema,
});

export type ResponseStaffScheduleSchema = z.infer<typeof responseStaffScheduleSchema>;
