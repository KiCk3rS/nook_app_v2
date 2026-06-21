import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  MOCK_ACCESS_TOKEN,
  MOCK_REFRESH_TOKEN,
  isMockAccessToken,
} from '../constants/mockUser';
import * as authApi from '../lib/api/auth';
import * as meApi from '../lib/api/me';
import { isApiConfigured } from '../lib/config';
import {
  loadMockProfile,
  patchMockPreferences,
  patchMockUser,
} from '../lib/mockUserSession';
import {
  clearStoredTokens,
  loadStoredTokens,
  saveStoredTokens,
} from '../lib/authStorage';
import {
  getMemoryAccessToken,
  setMemoryAccessToken,
  setTokenRefreshHandler,
} from '../lib/api/client';
import type { MeProfile, User, UserPreferences } from '../types/api';
import { ApiError } from '../types/api';

interface AuthContextValue {
  user: User | null;
  preferences: UserPreferences;
  isAuthenticated: boolean;
  isMockSession: boolean;
  isLoading: boolean;
  isRefreshingProfile: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    extras?: { displayName?: string },
  ) => Promise<void>;
  loginAsMock: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: meApi.PatchMePayload) => Promise<User>;
  updatePreferences: (patch: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const defaultPreferences: UserPreferences = {
  language: 'fr',
  notifications: {
    pushEnabled: false,
    routeReminders: false,
    marketingEnabled: false,
  },
  units: 'metric',
};

function mergePreferences(
  current: UserPreferences,
  patch: Partial<UserPreferences>,
): UserPreferences {
  return {
    ...current,
    ...patch,
    notifications: {
      ...current.notifications,
      ...patch.notifications,
    },
  };
}

function applyProfileToState(
  profile: MeProfile,
  setUser: (user: User) => void,
  setPreferences: (prefs: UserPreferences) => void,
): void {
  setUser(profile);
  setPreferences(mergePreferences(defaultPreferences, profile.preferences ?? {}));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const refreshTokenRef = useRef<string | null>(null);

  const applySession = useCallback((accessToken: string, refreshToken: string) => {
    refreshTokenRef.current = refreshToken;
    setMemoryAccessToken(accessToken);
    void saveStoredTokens(accessToken, refreshToken);
  }, []);

  const clearSession = useCallback(async () => {
    refreshTokenRef.current = null;
    setMemoryAccessToken(null);
    setUser(null);
    setPreferences(defaultPreferences);
    await clearStoredTokens();
  }, []);

  const loadProfile = useCallback(async (): Promise<MeProfile> => {
    if (isMockAccessToken(getMemoryAccessToken())) {
      const profile = await loadMockProfile();
      applyProfileToState(profile, setUser, setPreferences);
      return profile;
    }
    const profile = await meApi.fetchMe();
    applyProfileToState(profile, setUser, setPreferences);
    return profile;
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (isMockAccessToken(refreshTokenRef.current)) {
      return MOCK_ACCESS_TOKEN;
    }
    const refreshToken = refreshTokenRef.current;
    if (!refreshToken) {
      await clearSession();
      return null;
    }
    try {
      const response = await authApi.refreshSession(refreshToken);
      applySession(response.accessToken, response.refreshToken);
      setUser(response.user);
      return response.accessToken;
    } catch {
      await clearSession();
      return null;
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    setTokenRefreshHandler(refreshAccessToken);
    return () => setTokenRefreshHandler(null);
  }, [refreshAccessToken]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const stored = await loadStoredTokens();
        if (cancelled) return;

        if (!stored.accessToken || !stored.refreshToken) {
          setIsLoading(false);
          return;
        }

        refreshTokenRef.current = stored.refreshToken;
        setMemoryAccessToken(stored.accessToken);

        if (isMockAccessToken(stored.accessToken)) {
          const profile = await loadMockProfile();
          if (!cancelled) applyProfileToState(profile, setUser, setPreferences);
          return;
        }

        try {
          await loadProfile();
        } catch (error) {
          if (ApiError.isUnauthorized(error)) {
            const newToken = await refreshAccessToken();
            if (newToken) {
              await loadProfile();
            }
          } else {
            await clearSession();
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [clearSession, loadProfile, refreshAccessToken]);

  const loginAsMock = useCallback(async () => {
    applySession(MOCK_ACCESS_TOKEN, MOCK_REFRESH_TOKEN);
    const profile = await loadMockProfile();
    applyProfileToState(profile, setUser, setPreferences);
  }, [applySession]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!isApiConfigured()) {
        await loginAsMock();
        return;
      }
      const response = await authApi.login({ email: email.trim(), password });
      applySession(response.accessToken, response.refreshToken);
      setUser(response.user);
      try {
        await loadProfile();
      } catch {
        setPreferences(defaultPreferences);
      }
    },
    [applySession, loadProfile, loginAsMock],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      extras?: { displayName?: string },
    ) => {
      if (!isApiConfigured()) {
        if (extras?.displayName?.trim()) {
          await patchMockUser({ displayName: extras.displayName.trim() });
        }
        await loginAsMock();
        return;
      }
      const response = await authApi.register({
        email: email.trim(),
        password,
        displayName: extras?.displayName?.trim() || undefined,
      });
      applySession(response.accessToken, response.refreshToken);
      setUser(response.user);
      try {
        await loadProfile();
      } catch {
        setPreferences(defaultPreferences);
      }
    },
    [applySession, loadProfile, loginAsMock],
  );

  const logout = useCallback(async () => {
    const refreshToken = refreshTokenRef.current;
    if (refreshToken && !isMockAccessToken(refreshToken)) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Local logout even if API fails
      }
    }
    await clearSession();
  }, [clearSession]);

  const refreshProfile = useCallback(async () => {
    if (!getMemoryAccessToken()) return;
    setIsRefreshingProfile(true);
    try {
      if (isMockAccessToken(getMemoryAccessToken())) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
      await loadProfile();
    } finally {
      setIsRefreshingProfile(false);
    }
  }, [loadProfile]);

  const updateProfile = useCallback(async (payload: meApi.PatchMePayload) => {
    if (isMockAccessToken(getMemoryAccessToken())) {
      const updated = await patchMockUser(payload);
      setUser(updated);
      return updated;
    }
    const updated = await meApi.patchMe(payload);
    setUser(updated);
    return updated;
  }, []);

  const updatePreferences = useCallback(
    async (patch: Partial<UserPreferences>) => {
      const previous = preferences;
      const optimistic = mergePreferences(previous, patch);
      setPreferences(optimistic);
      try {
        if (isMockAccessToken(getMemoryAccessToken())) {
          const saved = await patchMockPreferences(patch);
          setPreferences(mergePreferences(defaultPreferences, saved));
          return;
        }
        const saved = await meApi.patchPreferences(patch);
        setPreferences(mergePreferences(defaultPreferences, saved));
      } catch (error) {
        setPreferences(previous);
        throw error;
      }
    },
    [preferences],
  );

  const isMockSession = isMockAccessToken(getMemoryAccessToken());

  const value = useMemo(
    () => ({
      user,
      preferences,
      isAuthenticated: user != null && getMemoryAccessToken() != null,
      isMockSession,
      isLoading,
      isRefreshingProfile,
      login,
      register,
      loginAsMock,
      logout,
      refreshProfile,
      updateProfile,
      updatePreferences,
    }),
    [
      user,
      preferences,
      isMockSession,
      isLoading,
      isRefreshingProfile,
      login,
      register,
      loginAsMock,
      logout,
      refreshProfile,
      updateProfile,
      updatePreferences,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
