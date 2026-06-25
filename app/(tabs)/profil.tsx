import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ProfileAnonymousView } from '../../components/profile/ProfileAnonymousView';
import {
  ProfileAuthenticatedView,
  ProfileLoadingView,
  type ProfileDashboardStats,
} from '../../components/profile/ProfileAuthenticatedView';
import { ProfileEditSheet } from '../../components/profile/ProfileEditSheet';
import {
  getMockRecentListenPlaces,
  MOCK_PROFILE_INSIGHTS,
} from '../../constants/mockProfileInsights';
import { MOCK_SAVED_ROUTES_COUNT } from '../../constants/mockUser';
import { MOCK_USER_ITINERARIES } from '../../constants/mockUserItineraries';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { fetchItineraries } from '../../lib/api/itineraries';
import { isApiConfigured, shouldShowDemoLogin } from '../../lib/config';
import { ApiError } from '../../types/api';

export default function ProfilScreen() {
  const { t } = useTranslation('profile');
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isMockSession,
    isLoading,
    isRefreshingProfile,
    refreshProfile,
    loginAsMock,
  } = useAuth();
  const { favoritePlaceIds, favoriteItineraryIds } = useFavorites();

  const [editVisible, setEditVisible] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [routesCount, setRoutesCount] = useState(MOCK_SAVED_ROUTES_COUNT);

  const favoritesCount = favoritePlaceIds.size + favoriteItineraryIds.size;

  const dashboardStats = useMemo<ProfileDashboardStats>(
    () => ({
      routesCount: routesCount ?? 0,
      favoritesCount,
      listenCount: isMockSession ? MOCK_PROFILE_INSIGHTS.listenCount : 0,
      citiesCount: isMockSession ? MOCK_PROFILE_INSIGHTS.citiesCount : 0,
      memberSinceLabel: isMockSession
        ? MOCK_PROFILE_INSIGHTS.memberSinceLabel
        : undefined,
    }),
    [favoritesCount, isMockSession, routesCount],
  );

  const recentRoutes = useMemo(
    () => (isMockSession ? MOCK_USER_ITINERARIES.slice(0, 3) : []),
    [isMockSession],
  );

  const recentListens = useMemo(
    () => (isMockSession ? getMockRecentListenPlaces() : []),
    [isMockSession],
  );

  const loadRoutesCount = useCallback(async () => {
    if (!isAuthenticated) return;
    if (isMockSession) {
      setRoutesCount(MOCK_SAVED_ROUTES_COUNT);
      return;
    }
    if (!isApiConfigured()) {
      setRoutesCount(0);
      return;
    }
    try {
      const items = await fetchItineraries({ limit: 100 });
      setRoutesCount(items.length);
    } catch {
      setRoutesCount(0);
    }
  }, [isAuthenticated, isMockSession]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadError(null);
    try {
      await refreshProfile();
      await loadRoutesCount();
    } catch (error) {
      if (isMockSession) return;
      if (ApiError.isUnauthorized(error)) {
        Alert.alert('', t('sessionExpired'));
      } else {
        setLoadError(t('loadError'));
      }
    }
  }, [isAuthenticated, isMockSession, loadRoutesCount, refreshProfile]);

  useFocusEffect(
    useCallback(() => {
      if (isLoading) return;
      if (isAuthenticated) {
        void refresh();
      }
    }, [isAuthenticated, isLoading, refresh]),
  );

  function openLogin() {
    router.push({
      pathname: '/auth/login',
      params: { returnTo: '/(tabs)/profil', source: 'profile_cta' },
    });
  }

  function openRegister() {
    router.push({
      pathname: '/auth/register',
      params: { returnTo: '/(tabs)/profil', source: 'profile_cta' },
    });
  }

  function handleSaved() {
    Alert.alert('', t('updateSuccess'));
  }

  async function handleDemoLogin() {
    await loginAsMock();
  }

  if (isLoading) {
    return <ProfileLoadingView />;
  }

  if (!isAuthenticated || !user) {
    return (
      <ProfileAnonymousView
        onLogin={openLogin}
        onRegister={openRegister}
        onDemoLogin={() => void handleDemoLogin()}
        showDemoLogin={shouldShowDemoLogin()}
      />
    );
  }

  return (
    <>
      <ProfileAuthenticatedView
        user={user}
        stats={dashboardStats}
        recentRoutes={recentRoutes}
        recentListens={recentListens}
        isRefreshing={isRefreshingProfile}
        loadError={loadError}
        onRefresh={() => void refresh()}
        onEditProfile={() => setEditVisible(true)}
      />
      <ProfileEditSheet
        visible={editVisible}
        user={user}
        onClose={() => setEditVisible(false)}
        onSaved={handleSaved}
      />
    </>
  );
}
