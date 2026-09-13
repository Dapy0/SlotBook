export const API_ERROR_CODES = [
  "NOT_FOUND",
  "CONFLICT",
  "FORBIDDEN",
  "BAD_REQUEST",
  "UNAUTHORIZED",
] as const;
export type ApiErrorCodeShared = (typeof API_ERROR_CODES)[number];
