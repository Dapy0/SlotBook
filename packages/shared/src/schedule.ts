import * as z from "zod";
import { instantSchema, wallTimeSchema } from "./common/codecs";

export const weekdaySchema = z.literal([1, 2, 3, 4, 5, 6, 7]);
export type Weekday = z.infer<typeof weekdaySchema>;

// BASE
const scheduleEntryBaseSchema = z.object({
  dayOfTheWeek: weekdaySchema,
  startTime: wallTimeSchema,
  endTime: wallTimeSchema,
});
type ScheduleEntryBase = z.infer<typeof scheduleEntryBaseSchema>;

const scheduleEntryResponseBaseSchema = scheduleEntryBaseSchema.extend({
  id: z.uuid(),
  createdAt: instantSchema,
});

// Intersection Rule

function findOverlappingIndexes(entries: readonly ScheduleEntryBase[]) {
  const byDay = new Map<
    Weekday,
    {
      index: number;
      start: ScheduleEntryBase["startTime"];
      end: ScheduleEntryBase["endTime"];
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
    let prevEnd: ScheduleEntryBase["endTime"] | null = null;
    for (const cur of list) {
      if (prevEnd !== null && cur.start < prevEnd) overlapping.push(cur.index);
      if (prevEnd === null || cur.end > prevEnd) prevEnd = cur.end; // максимум, не просто cur.end
    }
  }
  return overlapping;
}
// Request

export const scheduleEntryRequestSchema = scheduleEntryBaseSchema.refine(
  (e) => e.startTime < e.endTime,
  { path: ["endTime"], message: "endTime must be after startTime" },
);
export type ScheduleEntryRequest = z.infer<typeof scheduleEntryRequestSchema>;

export const changeWeekScheduleRequestSchema = z
  .array(scheduleEntryRequestSchema)
  .max(70, "too many entries")
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

// Responses staffSchedule
export const staffScheduleEntryResponseSchema = scheduleEntryResponseBaseSchema.extend({
  staffMemberId: z.uuid(),
});
export type StaffScheduleEntryResponse = z.infer<typeof staffScheduleEntryResponseSchema>;
