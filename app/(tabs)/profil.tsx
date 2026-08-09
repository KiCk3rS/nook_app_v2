import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreditsPackSheet } from '../../components/paywall/CreditsPackSheet';
import { SubscriptionPaywallSheet } from '../../components/paywall/SubscriptionPaywallSheet';
import { ToastSnackbar } from '../../components/ui/ToastSnackbar';
import { ProfileAnonymousView } from '../../components/profile/ProfileAnonymousView';
import {
  ProfileAuthenticatedView,
  ProfileLoadingView,
} from '../../components/profile/ProfileAuthenticatedView';
import { ProfileEditSheet } from '../../components/profile/ProfileEditSheet';
import {
  getMockRecentListenPlaces,
  MOCK_PROFILE_INSIGHTS,
} from '../../constants/mockProfileInsights';
import { MOCK_SAVED_ROUTES_COUNT } from '../../constants/mockUser';
import { MOCK_USER_ITINERARIES } from '../../constants/mockUserItineraries';
import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../contexts/CreditsContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { fetchItineraries } from '../../lib/api/itineraries';
import { fetchListenHistory } from '../../lib/api/listenHistory';
import { isApiConfigured, shouldShowDemoLogin, shouldUseMockData } from '../../lib/config';
import {
  buildProfileStats,
  mapRecentListensFromHistory,
  type ProfileRecentListen,
} from '../../lib/profile/profileStats';
import { formatMemberSinceLabel } from '../../lib/i18n/formatters';
import { ApiError } from '../../types/api';
import type { UserItinerary } from '../../types/api';

const RECENT_ROUTES_LIMIT = 3;

export default function ProfilScreen() {
  const { t, i18n } = useTranslation(['profile', 'creditsPack']);
  const insets = useSafeAreaInsets();
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
  const { balance, refreshBalance } = useCredits();

  const [editVisible, setEditVisible] = useState(false);
  const [creditsPackVisible, setCreditsPackVisible] = useState(false);
  const [subscriptionPaywallVisible, setSubscriptionPaywallVisible] = useState(false);
  const [purchaseToastVisible, setPurchaseToastVisible] = useState(false);
  const [purchasedCredits, setPurchasedCredits] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [routesCount, setRoutesCount] = useState(MOCK_SAVED_ROUTES_COUNT);
  const [recentRoutes, setRecentRoutes] = useState<UserItinerary[]>([]);
  const [listenHistoryTotal, setListenHistoryTotal] = useState<number | null>(null);
  const [recentListens, setRecentListens] = useState<ProfileRecentListen[]>([]);

  const useMockData = shouldUseMockData(isMockSession);

  const dashboardStats = useMemo(
    () =>
      buildProfileStats({
        useMockData,
        routesCount: routesCount ?? 0,
        placeFavoritesCount: favoritePlaceIds.size,
        itineraryFavoritesCount: favoriteItineraryIds.size,
        listenHistory:
          listenHistoryTotal == null ? null : { total: listenHistoryTotal, items: [] },
        mockListenCount: MOCK_PROFILE_INSIGHTS.listenCount,
        memberSinceLabel: useMockData
          ? t('profile:mockMemberSince')
          : formatMemberSinceLabel(user?.createdAt, i18n.language),
      }),
    [
      favoriteItineraryIds.size,
      favoritePlaceIds.size,
      i18n.language,
      listenHistoryTotal,
      routesCount,
      t,
      useMockData,
      user?.createdAt,
    ],
  );

  const loadListenInsights = useCallback(async () => {
    if (!isAuthenticated) return;
    if (useMockData) {
      setListenHistoryTotal(MOCK_PROFILE_INSIGHTS.listenCount);
      setRecentListens(getMockRecentListenPlaces());
      return;
    }
    if (!isApiConfigured()) {
      setListenHistoryTotal(0);
      setRecentListens([]);
      return;
    }
    try {
      const response = await fetchListenHistory({ limit: 3, offset: 0 });
      setListenHistoryTotal(response.total);
      setRecentListens(
        mapRecentListensFromHistory(response.items, i18n.language, 3),
      );
    } catch {
      setListenHistoryTotal(0);
      setRecentListens([]);
    }
  }, [i18n.language, isAuthenticated, useMockData]);

  const loadRoutesInsights = useCallback(async () => {
    if (!isAuthenticated) return;
    if (useMockData) {
      setRoutesCount(MOCK_SAVED_ROUTES_COUNT);
      setRecentRoutes(MOCK_USER_ITINERARIES.slice(0, RECENT_ROUTES_LIMIT));
      return;
    }
    if (!isApiConfigured()) {
      setRoutesCount(0);
      setRecentRoutes([]);
      return;
    }
    try {
      const response = await fetchItineraries({ limit: RECENT_ROUTES_LIMIT });
      setRoutesCount(response.total);
      setRecentRoutes(response.items);
    } catch {
      setRoutesCount(0);
      setRecentRoutes([]);
    }
  }, [isAuthenticated, useMockData]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadError(null);
    try {
      await refreshProfile();
      await Promise.all([loadRoutesInsights(), loadListenInsights()]);
    } catch (error) {
      if (isMockSession) return;
      if (ApiError.isUnauthorized(error)) {
        Alert.alert('', t('sessionExpired'));
      } else {
        setLoadError(t('loadError'));
      }
    }
  }, [
    isAuthenticated,
    isMockSession,
    loadListenInsights,
    loadRoutesInsights,
    refreshProfile,
    t,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (isLoading) return;
      if (isAuthenticated) {
        void refresh();
      }
    }, [isAuthenticated, isLoading, refresh]),
  );

  useEffect(() => {
    if (!purchaseToastVisible) return;
    const timer = setTimeout(() => setPurchaseToastVisible(false), 3200);
    return () => clearTimeout(timer);
  }, [purchaseToastVisible]);

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
        creditsBalance={balance?.creditsBalance ?? null}
        isRefreshing={isRefreshingProfile}
        loadError={loadError}
        onRefresh={() => void refresh()}
        onEditProfile={() => setEditVisible(true)}
        onOpenCredits={() => setCreditsPackVisible(true)}
      />
      <ProfileEditSheet
        visible={editVisible}
        user={user}
        onClose={() => setEditVisible(false)}
        onSaved={handleSaved}
      />
      <CreditsPackSheet
        visible={creditsPackVisible}
        sourceScreen="profile"
        onClose={() => setCreditsPackVisible(false)}
        onPurchaseSuccess={(credits) => {
          setPurchasedCredits(credits);
          setPurchaseToastVisible(true);
        }}
        onOpenSubscription={() => setSubscriptionPaywallVisible(true)}
      />
      <SubscriptionPaywallSheet
        visible={subscriptionPaywallVisible}
        sourceScreen="credits_pack"
        onClose={() => setSubscriptionPaywallVisible(false)}
        onSubscribed={() => void refreshBalance()}
      />
      <ToastSnackbar
        visible={purchaseToastVisible}
        message={t('creditsPack:purchaseSuccess', { count: purchasedCredits })}
        bottomInset={insets.bottom + 16}
      />
    </>
  );
}
