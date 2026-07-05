const mockAsyncStore = new Map<string, string>();
const mockSecureStore = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockAsyncStore.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockAsyncStore.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      mockAsyncStore.delete(key);
    }),
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockSecureStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStore.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureStore.delete(key);
  }),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  clearStoredTokens,
  getAuthStorageBackend,
  loadStoredTokens,
  saveStoredTokens,
} from '../../authStorage';

describe('authStorage', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;

  beforeEach(() => {
    mockAsyncStore.clear();
    mockSecureStore.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
  });

  it('round-trip save/load tokens en dev (AsyncStorage)', async () => {
    (global as { __DEV__?: boolean }).__DEV__ = true;
    expect(getAuthStorageBackend()).toBe('async');

    await saveStoredTokens('access-abc', 'refresh-xyz');
    await expect(loadStoredTokens()).resolves.toEqual({
      accessToken: 'access-abc',
      refreshToken: 'refresh-xyz',
    });
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it('round-trip save/load tokens en prod (SecureStore)', async () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    expect(getAuthStorageBackend()).toBe('secure');

    await saveStoredTokens('access-prod', 'refresh-prod');
    await expect(loadStoredTokens()).resolves.toEqual({
      accessToken: 'access-prod',
      refreshToken: 'refresh-prod',
    });
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('clearStoredTokens supprime les tokens du backend actif', async () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    await saveStoredTokens('a', 'r');
    await clearStoredTokens();
    await expect(loadStoredTokens()).resolves.toEqual({
      accessToken: null,
      refreshToken: null,
    });
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
  });
});
