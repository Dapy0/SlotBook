import type { ApiErrorCodeShared } from '@slotbook/shared/errors';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: ApiErrorCodeShared,
    message: string,
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };
  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown Error', code: 'UNKNOWN' }));

    throw new ApiError(
      response.status,
      errorData.code ?? 'UNKNOWN',
      errorData.message || `Server error (${response.status})`,
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
