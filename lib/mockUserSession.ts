import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_MOCK_PROFILE,
  DEFAULT_MOCK_USER,
} from '../constants/mockUser';
import type { MeProfile, User, UserPreferences } from '../types/api';

const MOCK_PROFILE_KEY = 'nook:mockProfile:v1';

function mergePreferences(
  base: UserPreferences | undefined,
  patch: UserPreferences | undefined,
): UserPreferences {
  return {
    language: patch?.language ?? base?.language ?? 'fr',
    units: patch?.units ?? base?.units ?? 'metric',
    notifications: {
      pushEnabled:
        patch?.notifications?.pushEnabled ??
        base?.notifications?.pushEnabled ??
        false,
      routeReminders:
        patch?.notifications?.routeReminders ??
        base?.notifications?.routeReminders ??
        false,
      marketingEnabled:
        patch?.notifications?.marketingEnabled ??
        base?.notifications?.marketingEnabled ??
        false,
    },
  };
}

export async function loadMockProfile(): Promise<MeProfile> {
  try {
    const raw = await AsyncStorage.getItem(MOCK_PROFILE_KEY);
    if (!raw) return DEFAULT_MOCK_PROFILE;
    const parsed = JSON.parse(raw) as MeProfile;
    return {
      ...DEFAULT_MOCK_USER,
      ...parsed,
      id: DEFAULT_MOCK_USER.id,
      role: 'USER',
      preferences: mergePreferences(
        DEFAULT_MOCK_PROFILE.preferences,
        parsed.preferences,
      ),
    };
  } catch {
    return DEFAULT_MOCK_PROFILE;
  }
}

export async function saveMockProfile(profile: MeProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Persistance locale non bloquante.
  }
}

export async function patchMockUser(
  payload: Partial<User>,
): Promise<MeProfile> {
  const current = await loadMockProfile();
  const next: MeProfile = {
    ...current,
    ...payload,
    id: current.id,
    email: current.email,
    role: 'USER',
  };
  await saveMockProfile(next);
  return next;
}

export async function patchMockPreferences(
  patch: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const current = await loadMockProfile();
  const nextPreferences = mergePreferences(current.preferences, patch);
  const next: MeProfile = { ...current, preferences: nextPreferences };
  await saveMockProfile(next);
  return nextPreferences;
}
