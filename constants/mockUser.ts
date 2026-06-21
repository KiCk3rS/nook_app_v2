import type { MeProfile, User } from '../types/api';

export const MOCK_ACCESS_TOKEN = 'nook-mock-access-token';
export const MOCK_REFRESH_TOKEN = 'nook-mock-refresh-token';

/** Nombre de parcours affiché sur le profil connecté (mock). */
export const MOCK_SAVED_ROUTES_COUNT = 3;

export const DEFAULT_MOCK_USER: User = {
  id: 'mock-user-001',
  email: 'alex.explorateur@nook.app',
  displayName: 'Alex',
  firstName: 'Alex',
  lastName: 'Martin',
  birthDate: null,
  role: 'USER',
};

export const DEFAULT_MOCK_PROFILE: MeProfile = {
  ...DEFAULT_MOCK_USER,
  preferences: {
    language: 'fr',
    notifications: {
      pushEnabled: true,
      routeReminders: false,
      marketingEnabled: false,
    },
    units: 'metric',
  },
};

export function isMockAccessToken(token: string | null | undefined): boolean {
  return token === MOCK_ACCESS_TOKEN;
}
