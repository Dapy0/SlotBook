import * as z from "zod";

export const API_ERROR_CODES = [
  "NOT_FOUND",
  "CONFLICT",
  "FORBIDDEN",
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "INTERNAL_SERVER_ERROR",
  "SLOT_UNAVAILABLE",
  "SLOT_TAKEN",
  "OUTSIDE_BOOKING_WINDOW",
  "CANNOT_BOOK_YOURSELF",
  "BOOKING_NOT_FOUND",
] as const;
export const apiErrorCodeSchema = z.enum(API_ERROR_CODES);
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export const apiErrorResponseSchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string().trim(),
  details: z.unknown().optional(),
});
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
