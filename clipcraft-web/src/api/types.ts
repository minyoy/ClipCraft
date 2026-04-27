export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
}

export type ApiRequestBody = BodyInit | null | undefined;
