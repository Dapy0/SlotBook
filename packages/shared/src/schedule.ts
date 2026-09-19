import * as z from "zod";
import { instantSchema, wallTimeSchema } from "./codecs";

// Request DTOs
const weekdaySchema = z.literal([1, 2, 3, 4, 5, 6, 7]);
export type Weekday = z.infer<typeof weekdaySchema>;
export const WEEKDAY_BY_NAME = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
} as const satisfies Record<string, Weekday>;
export type WeekdayByName = keyof typeof WEEKDAY_BY_NAME;
// BASE
const scheduleEntryFieldsSchema = z.object({
  dayOfTheWeek: weekdaySchema,
  startTime: wallTimeSchema,
  endTime: wallTimeSchema,
});
type ScheduleEntryFields = z.infer<typeof scheduleEntryFieldsSchema>;

const scheduleEntryResponseBaseSchema = scheduleEntryFieldsSchema.extend({
  id: z.uuid(),
  createdAt: instantSchema,
});

// Intersection Rule

function findOverlappingIndexes(entries: readonly ScheduleEntryFields[]) {
  const byDay = new Map<
    Weekday,
    {
      index: number;
      start: ScheduleEntryFields["startTime"];
      end: ScheduleEntryFields["endTime"];
    }[]
  >();
  entries.forEach((e, index) => {
    const list = byDay.get(e.dayOfTheWeek) ?? [];
    list.push({ index, start: e.startTime, end: e.endTime });
    byDay.set(e.dayOfTheWeek, list);
  });
  const overlapping: number[] = [];
  for (const list of byDay.values()) {
    list.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
    let prevEnd: ScheduleEntryFields["endTime"] | null = null;
    for (const cur of list) {
      if (prevEnd !== null && cur.start < prevEnd) overlapping.push(cur.index);
      if (prevEnd === null || cur.end > prevEnd) prevEnd = cur.end; // максимум, не просто cur.end
    }
  }
  return overlapping;
}
// Request

export const scheduleEntryRequestSchema = scheduleEntryFieldsSchema.refine(
  (e) => e.startTime < e.endTime,
  { path: ["endTime"], message: "endTime must be after startTime" },
);
export type ScheduleEntryRequest = z.infer<typeof scheduleEntryRequestSchema>;

export const changeWeekScheduleRequestSchema = z
  .array(scheduleEntryRequestSchema)
  .superRefine((entries, ctx) => {
    for (const index of findOverlappingIndexes(entries)) {
      ctx.addIssue({
        code: "custom",
        path: [index, "startTime"],
        message: "overlaps with another entry on the same day",
      });
    }
  });
export type ChangeWeekScheduleRequest = z.infer<typeof changeWeekScheduleRequestSchema>;

// Response facilitySchedule
export const facilityScheduleEntryResponseSchema = scheduleEntryResponseBaseSchema.extend({
  facilityId: z.uuid(),
});
export type FacilityScheduleEntryResponse = z.infer<typeof facilityScheduleEntryResponseSchema>;

export const facilityWeekScheduleResponseSchema = z.array(facilityScheduleEntryResponseSchema);
export type FacilityWeekScheduleResponse = z.infer<typeof facilityWeekScheduleResponseSchema>;

// Responses staffSchedule
export const staffScheduleEntryResponseSchema = scheduleEntryResponseBaseSchema.extend({
  staffId: z.uuid(),
});
export type StaffScheduleEntryResponse = z.infer<typeof staffScheduleEntryResponseSchema>;

export const staffWeekScheduleResponseSchema = z.array(staffScheduleEntryResponseSchema);
export type StaffWeekScheduleResponse = z.infer<typeof staffWeekScheduleResponseSchema>;
