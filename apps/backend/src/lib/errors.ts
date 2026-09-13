import type { ApiErrorCodeShared } from "@slotbook/shared/errors";
export class AppError<TCode extends ApiErrorCodeShared = ApiErrorCodeShared> extends Error {
  constructor(
    public statusCode: number,
    public code: TCode,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UnauthorizedError extends AppError<"UNAUTHORIZED"> {
  constructor(message = "Unauthorized user") {
    super(401, "UNAUTHORIZED", message);
  }
}
export class NotFoundError extends AppError<"NOT_FOUND"> {
  constructor(message = "Resource not found") {
    super(404, "NOT_FOUND", message);
  }
}
export class ForbiddenError extends AppError<"FORBIDDEN"> {
  constructor(message = "Access denied") {
    super(403, "FORBIDDEN", message);
  }
}

export class ConflictError extends AppError<"CONFLICT"> {
  constructor(message = "Conflict") {
    super(409, "CONFLICT", message);
  }
}
export class BadRequestError extends AppError<"BAD_REQUEST"> {
  constructor(message = "Bad request") {
    super(400, "BAD_REQUEST", message);
  }
}

export type ApiErrorCode =
  | InstanceType<typeof NotFoundError>["code"]
  | InstanceType<typeof ConflictError>["code"]
  | InstanceType<typeof ForbiddenError>["code"]
  | InstanceType<typeof BadRequestError>["code"]
  | InstanceType<typeof UnauthorizedError>["code"];
