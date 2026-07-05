import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'nook:auth:tokens:v1';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export type AuthStorageBackend = 'async' | 'secure';

/** Backend de persistance : SecureStore en prod, AsyncStorage en dev. */
export function getAuthStorageBackend(): AuthStorageBackend {
  return __DEV__ ? 'async' : 'secure';
}

async function readRaw(): Promise<string | null> {
  if (getAuthStorageBackend() === 'secure') {
    return SecureStore.getItemAsync(STORAGE_KEY);
  }
  return AsyncStorage.getItem(STORAGE_KEY);
}

async function writeRaw(value: string): Promise<void> {
  if (getAuthStorageBackend() === 'secure') {
    await SecureStore.setItemAsync(STORAGE_KEY, value);
    return;
  }
  await AsyncStorage.setItem(STORAGE_KEY, value);
}

async function removeRaw(): Promise<void> {
  if (getAuthStorageBackend() === 'secure') {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    return;
  }
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function loadStoredTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  try {
    const raw = await readRaw();
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
    await writeRaw(JSON.stringify(payload));
  } catch {
    // Persistance locale non bloquante.
  }
}

export async function clearStoredTokens(): Promise<void> {
  try {
    await removeRaw();
  } catch {
    // Persistance locale non bloquante.
  }
}
