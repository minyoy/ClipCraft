import { requestApiV1 } from '@/api/v1Client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  marketing_consent: boolean;
  created_at: string;
}

export interface AuthTokens {
  user: AuthUser;
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in?: number;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  terms_accepted: boolean;
  marketing_consent?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
  remember_me?: boolean;
}

export async function signup(input: SignupInput): Promise<AuthTokens> {
  const { data } = await requestApiV1<AuthTokens>('/auth/signup', { method: 'POST', body: JSON.stringify(input) });
  return data;
}

export async function login(input: LoginInput): Promise<AuthTokens> {
  const { data } = await requestApiV1<AuthTokens>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
  return data;
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const { data } = await requestApiV1<AuthTokens>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await requestApiV1<void>('/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) });
}

export async function fetchCurrentUser(accessToken: string): Promise<AuthUser> {
  const { data } = await requestApiV1<AuthUser>('/users/me', {}, accessToken);
  return data;
}
