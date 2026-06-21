import type { AuthResponse } from '../../types/api';
import { apiRequest } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function refreshSession(refreshToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
}

export function logout(refreshToken: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  });
}
