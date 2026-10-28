import * as z from "zod";

export const API_ERROR_CODES = [
  "VALIDATION_FAILED",
  "BAD_REQUEST",
  "ROUTE_NOT_FOUND",
  "RATE_LIMITED",
  "INTERNAL",
  "UNAUTHENTICATED",
  "INVALID_CREDENTIALS",
  "FORBIDDEN",
  "USER_NOT_FOUND",
  "EMAIL_TAKEN",
  "FACILITY_NOT_FOUND",
  "BOOKING_NOT_FOUND",
  "SLOT_TAKEN",
  "SLOT_IN_PAST",
  "FILE_TOO_LARGE",
  "UNSUPPORTED_IMAGE_TYPE",
  "IMAGE_LIMIT_REACHED",
] as const;
export const apiErrorCodeSchema = z.enum(API_ERROR_CODES);
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export const fieldIssueSchema = z.object({
  field: z.string().trim(),
  issue: z.string().trim(),
});
export type FieldIssue = z.infer<typeof fieldIssueSchema>;

export const apiErrorResponseSchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string().trim(),
  details: z.array(fieldIssueSchema).optional(),
  requestId: z.string().trim(),
});
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
