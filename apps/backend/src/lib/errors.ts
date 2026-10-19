import type { ApiErrorCode } from "@slotbook/shared";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: ApiErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized user") {
    super(401, "UNAUTHORIZED", message);
  }
}
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, "NOT_FOUND", message);
  }
}
export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(403, "FORBIDDEN", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(409, "CONFLICT", message);
  }
}
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(400, "BAD_REQUEST", message);
  }
}

// Files
export class FileTooLargeError extends AppError {
  constructor(message = "File is too large") {
    super(413, "FILE_TOO_LARGE", message);
  }
}
export class UnsupportedImageTypeError extends AppError {
  constructor(message = "Only JPEG, PNG and WebP images are allowed") {
    super(415, "UNSUPPORTED_IMAGE_TYPE", message);
  }
}
export class ImageLimitReachedError extends AppError {
  constructor(message = "Image limit reached") {
    super(409, "IMAGE_LIMIT_REACHED", message);
  }
}
