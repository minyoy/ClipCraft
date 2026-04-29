import type { ApiErrorBody, ApiRequestBody, ApiResponse, ApiStatusResponse } from './types';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getApiUrl(envUrl: string | undefined, fallbackUrl: string): string {
  return envUrl || fallbackUrl;
}

export async function requestJson<T>(url: string, options: RequestInit & { body?: ApiRequestBody } = {}): Promise<T> {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;
    throw new ApiError(errorBody?.message || errorBody?.error || `API request failed: ${response.status}`, response.status);
  }

  return unwrapApiResponse<T>(body);
}

export async function requestStatusJson<T>(url: string, options: RequestInit & { body?: ApiRequestBody } = {}): Promise<ApiStatusResponse<T>> {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;
    throw new ApiError(errorBody?.message || errorBody?.error || `API request failed: ${response.status}`, response.status);
  }

  if (!isApiStatusResponse<T>(body)) {
    throw new ApiError('Invalid API response', 200);
  }

  if (body.status !== 'success') {
    throw new ApiError(body.message || body.error || 'API request failed', 200);
  }

  return body;
}

export function unwrapApiResponse<T>(body: unknown): T {
  if (isApiResponse<T>(body)) {
    if (!body.success) {
      throw new ApiError(body.message || body.error || 'API request failed', 200);
    }

    return body.data;
  }

  if (isApiStatusResponse<T>(body)) {
    if (body.status !== 'success') {
      throw new ApiError(body.message || body.error || 'API request failed', 200);
    }

    return body.results;
  }

  return body as T;
}

function isApiResponse<T>(body: unknown): body is ApiResponse<T> {
  return typeof body === 'object' && body !== null && 'success' in body && 'data' in body;
}

function isApiStatusResponse<T>(body: unknown): body is ApiStatusResponse<T> {
  return typeof body === 'object' && body !== null && 'status' in body && 'results' in body;
}
