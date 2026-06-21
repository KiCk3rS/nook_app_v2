import type { MeProfile, User, UserPreferences } from '../../types/api';
import { apiRequest } from './client';

export interface PatchMePayload {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: string | null;
}

export function fetchMe(): Promise<MeProfile> {
  return apiRequest<MeProfile>('/me', { auth: true });
}

export function patchMe(payload: PatchMePayload): Promise<User> {
  return apiRequest<User>('/me', {
    method: 'PATCH',
    auth: true,
    body: payload,
  });
}

export function patchPreferences(
  preferences: Partial<UserPreferences>,
): Promise<UserPreferences> {
  return apiRequest<UserPreferences>('/me/preferences', {
    method: 'PATCH',
    auth: true,
    body: preferences,
  });
}
