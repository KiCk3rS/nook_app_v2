import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'nook:auth:tokens:v1';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Persistance des tokens côté app uniquement.
 * AsyncStorage : compatible Expo Go / dev client sans rebuild natif.
 * Pour SecureStore en production, reconstruire le dev client après `expo-secure-store`
 * (`npx expo run:android` ou `run:ios`) puis basculer l’implémentation si souhaité.
 */
export async function loadStoredTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: null, refreshToken: null };
    const parsed = JSON.parse(raw) as Partial<StoredTokens>;
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

export async function saveStoredTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  try {
    const payload: StoredTokens = { accessToken, refreshToken };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Persistance locale non bloquante.
  }
}

export async function clearStoredTokens(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Persistance locale non bloquante.
  }
}
