import * as z from "zod";
import {
  changeWeekScheduleRequestSchema,
  scheduleEntryRequestSchema,
  staffScheduleEntryResponseSchema,
} from "./schedule";
import { instantSchema } from "./common/codecs";

export const SCHEDULE_REQUEST_STATUSES = ["pending", "approved", "rejected", "withdrawn"] as const;
export const scheduleRequestStatusSchema = z.enum(SCHEDULE_REQUEST_STATUSES);
export type ScheduleRequestStatus = z.infer<typeof scheduleRequestStatusSchema>;

export const createScheduleRequestSchema = z.object({
  entries: changeWeekScheduleRequestSchema,
  note: z.string().trim().max(255).nullable(),
});
export type CreateScheduleRequest = z.infer<typeof createScheduleRequestSchema>;

export const rejectScheduleRequestSchema = z.object({
  comment: z.string().trim().min(1).max(255),
});
export type RejectScheduleRequest = z.infer<typeof rejectScheduleRequestSchema>;

export const scheduleRequestListQuerySchema = z.object({
  status: scheduleRequestStatusSchema.optional(),
});
export type ScheduleRequestListQuery = z.infer<typeof scheduleRequestListQuerySchema>;

export const scheduleRequestEntryResponseSchema = scheduleEntryRequestSchema;
export type ScheduleRequestEntryResponse = z.infer<typeof scheduleRequestEntryResponseSchema>;

export const scheduleRequestResponseSchema = z.object({
  id: z.uuid(),
  staffMemberId: z.uuid(),
  facilityId: z.uuid(),
  status: scheduleRequestStatusSchema,
  entries: changeWeekScheduleRequestSchema,
  staffNote: z.string().trim().nullable(),
  ownerComment: z.string().trim().nullable(),
  decidedAt: instantSchema.nullable(),
  createdAt: instantSchema,
});
export type ScheduleRequestResponse = z.infer<typeof scheduleRequestResponseSchema>;

export const scheduleRequestDetailResponseSchema = scheduleRequestResponseSchema.extend({
  currentSchedule: staffScheduleEntryResponseSchema.array(),
  staffName: z.string().trim(),
});
export type ScheduleRequestDetailResponse = z.infer<typeof scheduleRequestDetailResponseSchema>;
