import * as z from "zod";
import type { ApiErrorCode } from "@slotbook/shared";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T extends z.ZodType>(
  endpoint: string,
  schema: T,
  options: RequestInit = {},
): Promise<z.infer<T>> {
  const url = `${BACKEND_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  };
  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown Error", code: "UNKNOWN" }));
    throw new ApiError(
      response.status,
      errorData.code ?? "UNKNOWN",
      errorData.message || `Server error (${response.status})`,
    );
  }

  if (response.status === 204) {
    return {} as z.infer<T>;
  }

  const data = await response.json();

  return schema.parse(data);
}
