import * as z from "zod";

export const API_ERROR_CODES = [
  "NOT_FOUND",
  "CONFLICT",
  "FORBIDDEN",
  "BAD_REQUEST",
  "UNAUTHORIZED",
] as const;
export const apiErrorCodeSchema = z.enum(API_ERROR_CODES);
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export const apiErrorResponseSchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string().trim(),
});
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
