import { ApiError } from '@/api/client';

export interface ApiV1ErrorDetail {
  field: string;
  reason: string;
}

export class ApiV1Error extends ApiError {
  code: string;
  details: ApiV1ErrorDetail[];

  constructor(message: string, status: number, code: string, details: ApiV1ErrorDetail[] = []) {
    super(message, status);
    this.name = 'ApiV1Error';
    this.code = code;
    this.details = details;
  }
}

export interface ApiV1Envelope<T> {
  data: T;
  meta: {
    request_id: string;
    page?: number;
    page_size?: number;
    total?: number;
    total_pages?: number;
  };
}

interface ApiV1ErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: ApiV1ErrorDetail[];
  };
}

const API_V1_BASE = import.meta.env.VITE_API_V1_URL || '/api/v1';

export async function requestApiV1<T>(path: string, options: RequestInit = {}, accessToken?: string | null): Promise<ApiV1Envelope<T>> {
  const headers = new Headers(options.headers);
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(`${API_V1_BASE}${path}`, { ...options, headers });

  if (response.status === 204) {
    return { data: undefined as T, meta: { request_id: '' } };
  }

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const errorBody = body as ApiV1ErrorBody | null;
    throw new ApiV1Error(
      errorBody?.error?.message || `API request failed: ${response.status}`,
      response.status,
      errorBody?.error?.code || 'UNKNOWN_ERROR',
      errorBody?.error?.details || [],
    );
  }

  return body as ApiV1Envelope<T>;
}
