import {
  FACILITY_IMAGE_MAX_BYTES,
  FACILITY_IMAGE_TYPES,
  type ApiErrorCode,
} from "@slotbook/shared";
import { ApiError } from "@/lib/api";

const MAX_MB = FACILITY_IMAGE_MAX_BYTES / (1024 * 1024);

const IMAGE_ERROR_TEXT: Partial<Record<ApiErrorCode, string>> = {
  FILE_TOO_LARGE: `Photo is larger than ${MAX_MB} MB.`,
  UNSUPPORTED_IMAGE_TYPE: "Only JPG, PNG or WebP photos are allowed.",
  IMAGE_LIMIT_REACHED: "You already have 10 photos. Remove one to add another.",
  NOT_FOUND: "This photo is already gone. Refresh the page.",
  BAD_REQUEST: "Photos changed in another tab. Refresh the page and try again.",
  FORBIDDEN: "You can't edit photos of this venue.",
};

export function imageErrorText(err: unknown): string {
  if (err instanceof ApiError) return IMAGE_ERROR_TEXT[err.code] ?? err.message;
  return "Couldn't reach the server. Check your connection and try again.";
}

export function validateImageFile(file: File): string | null {
  if (!FACILITY_IMAGE_TYPES.some((t) => t.mime === file.type)) {
    return "Only JPG, PNG or WebP photos are allowed.";
  }
  if (file.size > FACILITY_IMAGE_MAX_BYTES) {
    return `Photo is larger than ${MAX_MB} MB.`;
  }
  return null;
}
