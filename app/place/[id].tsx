import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdminGenerateAudioGuideEntry } from '../../components/admin/AdminGenerateAudioGuideEntry';
import { CreditsPackSheet } from '../../components/paywall/CreditsPackSheet';
import { SubscriptionPaywallSheet } from '../../components/paywall/SubscriptionPaywallSheet';
import { AudioGuideList } from '../../components/place/AudioGuideList';
import { AssociatedPlacesCarousel } from '../../components/place/AssociatedPlacesCarousel';
import { CreateGuideSheet } from '../../components/place/CreateGuideSheet';
import { ParentPlaceLink } from '../../components/place/ParentPlaceLink';
import { PlaceDescription } from '../../components/place/PlaceDescription';
import {
  PLACE_CONTENT_OVERLAP,
  PLACE_HERO_HEIGHT,
  PlaceHeroBackground,
  PlaceHeroControls,
} from '../../components/place/PlaceHero';
import { ToastSnackbar } from '../../components/ui/ToastSnackbar';
import type { AudioGuide } from '../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  elevation,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import { useAudioPlayback } from '../../contexts/AudioPlaybackContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { fetchPrivateGuidesForPlace } from '../../lib/api/audioGuides';
import { normalizeLocale } from '../../lib/i18n';
import { getPlaceWikipediaUrl } from '../../lib/placeWikipedia';
import { usePoiDetail } from '../../hooks/usePoiDetail';

const PRIVATE_GUIDE_POLL_MS = 3000;

export default function PlaceDetailScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation([
    'common',
    'createGuide',
    'creditsPack',
    'place',
  ]);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { id, createGuide } = useLocalSearchParams<{
    id: string;
    createGuide?: string;
  }>();
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    user,
    preferences,
    isMockSession,
  } = useAuth();

  const placeId = typeof id === 'string' ? id : undefined;
  const {
    place,
    parentPlace,
    associatedPlaces,
    loading: isPlaceLoading,
    error: placeError,
    notFound,
    reload,
  } = usePoiDetail(placeId);

  const [privateGuides, setPrivateGuides] = useState<AudioGuide[]>([]);
  const [createGuideVisible, setCreateGuideVisible] = useState(false);
  const [creditsPackVisible, setCreditsPackVisible] = useState(false);
  const [subscriptionPaywallVisible, setSubscriptionPaywallVisible] =
    useState(false);
  const [requiredCredits, setRequiredCredits] = useState<number | undefined>();
  const [purchaseToastVisible, setPurchaseToastVisible] = useState(false);
  const [purchasedCredits, setPurchasedCredits] = useState(0);

  const { isPlaceFavorite, togglePlaceFavorite } = useFavorites();
  const isFavorite = place ? isPlaceFavorite(place.id) : false;
  const {
    activeGuideId,
    isPlaying,
    viewMode,
    place: playbackPlace,
    startPlayback,
    syncPlaybackGuides,
    minimize,
    togglePlay,
  } = useAudioPlayback();

  const appLanguage = normalizeLocale(
    isAuthenticated ? preferences.language : i18n.language,
  );

  const placeWikipediaUrl = useMemo(
    () => (place ? getPlaceWikipediaUrl(place, appLanguage) : undefined),
    [place, appLanguage],
  );

  const canCreateGuide = Boolean(placeWikipediaUrl);

  const publicGuides = useMemo(
    () => place?.audioGuides.filter((guide) => !guide.isPrivate) ?? [],
    [place],
  );

  const displayedGuides = useMemo(() => {
    if (!isAuthenticated) return publicGuides;
    return [...privateGuides, ...publicGuides];
  }, [isAuthenticated, privateGuides, publicGuides]);

  const hasPendingGuides = privateGuides.some(
    (guide) => guide.status === 'pending',
  );

  const stickyGuide = useMemo(() => {
    if (activeGuideId && playbackPlace?.id === place?.id) {
      return (
        displayedGuides.find(
          (guide) => guide.id === activeGuideId && guide.status === 'ready',
        ) ??
        displayedGuides.find((guide) => guide.status === 'ready') ??
        null
      );
    }
    return displayedGuides.find((guide) => guide.status === 'ready') ?? null;
  }, [activeGuideId, displayedGuides, place?.id, playbackPlace?.id]);

  const showStickyListenBar = stickyGuide !== null && viewMode !== 'expanded';
  const isStickyGuideActive =
    stickyGuide !== null &&
    activeGuideId === stickyGuide.id &&
    viewMode !== 'idle';
  const stickyCtaLabel =
    isStickyGuideActive && isPlaying
      ? t('common:pauseGuide')
      : t('common:listenGuide');

  const loadPrivateGuides = useCallback(async () => {
    if (!place || !isAuthenticated || !user) {
      setPrivateGuides([]);
      return;
    }
    try {
      const guides = await fetchPrivateGuidesForPlace(
        user.id,
        place.id,
        isMockSession,
      );
      setPrivateGuides(guides);
    } catch {
      setPrivateGuides([]);
    }
  }, [isAuthenticated, isMockSession, place, user]);

  const refreshPlaceContent = useCallback(() => {
    reload();
    void loadPrivateGuides();
  }, [loadPrivateGuides, reload]);

  useEffect(() => {
    void loadPrivateGuides();
  }, [loadPrivateGuides]);

  useEffect(() => {
    if (!place || playbackPlace?.id !== place.id) return;
    syncPlaybackGuides(displayedGuides);
  }, [displayedGuides, place, playbackPlace?.id, syncPlaybackGuides]);

  useEffect(() => {
    if (!hasPendingGuides || createGuideVisible) return;
    const timer = setInterval(() => {
      void loadPrivateGuides();
    }, PRIVATE_GUIDE_POLL_MS);
    return () => clearInterval(timer);
  }, [createGuideVisible, hasPendingGuides, loadPrivateGuides]);

  useEffect(() => {
    if (isAuthLoading || !place) return;
    if (createGuide === '1' && isAuthenticated && placeWikipediaUrl) {
      setCreateGuideVisible(true);
      router.setParams({ createGuide: undefined });
    }
  }, [
    createGuide,
    isAuthenticated,
    isAuthLoading,
    place,
    placeWikipediaUrl,
    router,
  ]);

  useEffect(() => {
    if (!purchaseToastVisible) return;
    const timer = setTimeout(() => setPurchaseToastVisible(false), 3200);
    return () => clearTimeout(timer);
  }, [purchaseToastVisible]);

  const scrollTopInset = PLACE_HERO_HEIGHT - PLACE_CONTENT_OVERLAP;
  const bodyMinHeight = windowHeight - scrollTopInset + PLACE_CONTENT_OVERLAP;
  const toastBottom = insets.bottom + spacing.xl;

  function openCreateGuideFlow() {
    if (!place || !placeWikipediaUrl) return;
    if (!isAuthenticated) {
      router.push({
        pathname: '/auth/login',
        params: { returnTo: `/place/${place.id}?createGuide=1` },
      });
      return;
    }
    setCreateGuideVisible(true);
  }

  function handleBack() {
    if (viewMode === 'expanded') {
      minimize();
      return;
    }
    router.back();
  }

  async function handleShare() {
    if (!place) return;
    await Share.share({
      message: t('place:shareMessage', {
        name: place.name,
        address: place.address,
      }),
    });
  }

  function handlePlayGuide(guideId: string) {
    if (!place) return;

    const guide = displayedGuides.find(
      (g) => g.id === guideId && g.status === 'ready',
    );
    if (!guide) return;

    startPlayback(place, guide, displayedGuides);
  }

  function handleOpenCreditsPack(credits: number) {
    setRequiredCredits(credits);
    setCreditsPackVisible(true);
  }

  function handleCreateSuccess() {
    void loadPrivateGuides();
  }

  function handleStickyListen() {
    if (!place || !stickyGuide) return;
    if (isStickyGuideActive) {
      togglePlay();
      return;
    }
    handlePlayGuide(stickyGuide.id);
  }

  function handleRetryGuide(_guideId: string) {
    openCreateGuideFlow();
  }

  const stickyBarHeight =
    componentSizes.buttonPrimaryHeight + insets.bottom + spacing.md;
  const scrollBottomPadding = showStickyListenBar
    ? insets.bottom + spacing.xxl + stickyBarHeight
    : insets.bottom + spacing.xxl;

  if (isPlaceLoading) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.notFoundBody}>…</Text>
      </View>
    );
  }

  if (placeError) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.notFoundTitle}>{t('common:placeNotFoundTitle')}</Text>
        <Text style={styles.notFoundBody}>{t('common:errorGeneric')}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.notFoundButton,
            pressed && styles.primaryPressed,
          ]}
          onPress={reload}
          accessibilityRole="button"
          accessibilityLabel={t('common:retry')}
        >
          <Text style={styles.primaryText}>{t('common:retry')}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [pressed && styles.primaryPressed]}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t('common:back')}
        >
          <Text style={styles.notFoundBody}>{t('common:back')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!place || notFound) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.notFoundTitle}>{t('common:placeNotFoundTitle')}</Text>
        <Text style={styles.notFoundBody}>{t('common:placeNotFoundBody')}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.notFoundButton,
            pressed && styles.primaryPressed,
          ]}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t('common:back')}
        >
          <Text style={styles.primaryText}>{t('common:back')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <PlaceHeroBackground imageUrl={place.imageUrl} />

      <PlaceHeroControls
        isFavorite={isFavorite}
        onBack={handleBack}
        onToggleFavorite={() =>
          togglePlaceFavorite(place.id, {
            title: place.name,
            imageUrl: place.imageUrl,
          })
        }
        onShare={() => void handleShare()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: scrollTopInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.body,
            { minHeight: bodyMinHeight, paddingBottom: scrollBottomPadding },
          ]}
        >
          <Text style={styles.title} accessibilityRole="header">
            {place.name}
          </Text>
          {place.publicationStatus === 'DRAFT' ? (
            <View
              style={styles.draftBanner}
              accessibilityRole="text"
              accessibilityLabel={t('place:draftBanner')}
            >
              <Ionicons
                name="document-outline"
                size={16}
                color={colors.warning}
                accessibilityElementsHidden
              />
              <Text style={styles.draftBannerText}>{t('place:draftBanner')}</Text>
            </View>
          ) : null}
          {place.address.trim().length > 0 ? (
            <View style={styles.addressRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.muted}
                accessibilityElementsHidden
              />
              <Text style={styles.address}>{place.address}</Text>
            </View>
          ) : null}

          {parentPlace ? <ParentPlaceLink parent={parentPlace} /> : null}

          <Text style={styles.sectionTitle}>{t('place:descriptionSection')}</Text>
          <PlaceDescription description={place.description} />

          {placeWikipediaUrl ? (
            <AdminGenerateAudioGuideEntry
              poiId={place.id}
              poiName={place.name}
              wikipediaUrl={placeWikipediaUrl}
              appLanguage={appLanguage}
              authLoading={isAuthLoading}
              onRefresh={refreshPlaceContent}
            />
          ) : null}

          <AudioGuideList
            guides={displayedGuides}
            activeGuideId={activeGuideId}
            isPlaying={isPlaying}
            onPlayGuide={handlePlayGuide}
            onAddGuide={canCreateGuide ? openCreateGuideFlow : undefined}
            onRetryGuide={handleRetryGuide}
          />

          <AssociatedPlacesCarousel places={associatedPlaces} />
        </View>
      </ScrollView>

      {showStickyListenBar ? (
        <View
          style={[
            styles.stickyBar,
            { paddingBottom: Math.max(insets.bottom, spacing.sm) },
          ]}
        >
          <Pressable
            onPress={handleStickyListen}
            style={({ pressed }) => [
              styles.stickyButton,
              pressed && styles.stickyButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={stickyCtaLabel}
          >
            <Ionicons
              name={isStickyGuideActive && isPlaying ? 'pause' : 'headset'}
              size={22}
              color={colors.onPrimary}
            />
            <Text style={styles.stickyButtonText}>{stickyCtaLabel}</Text>
          </Pressable>
        </View>
      ) : null}

      {placeWikipediaUrl ? (
        <CreateGuideSheet
          visible={createGuideVisible}
          poiId={place.id}
          poiName={place.name}
          wikipediaUrl={placeWikipediaUrl}
          language={appLanguage}
          onClose={() => setCreateGuideVisible(false)}
          onSuccess={handleCreateSuccess}
          onOpenCreditsPack={handleOpenCreditsPack}
        />
      ) : null}

      <CreditsPackSheet
        visible={creditsPackVisible}
        sourceScreen="create_guide"
        requiredCredits={requiredCredits}
        onClose={() => setCreditsPackVisible(false)}
        onPurchaseSuccess={(credits) => {
          setPurchasedCredits(credits);
          setPurchaseToastVisible(true);
          if (!createGuideVisible) {
            setCreateGuideVisible(true);
          }
        }}
        onOpenSubscription={() => setSubscriptionPaywallVisible(true)}
      />

      <SubscriptionPaywallSheet
        visible={subscriptionPaywallVisible}
        sourceScreen="create_guide"
        onClose={() => setSubscriptionPaywallVisible(false)}
      />

      <ToastSnackbar
        visible={purchaseToastVisible}
        message={t('creditsPack:purchaseSuccess', { count: purchasedCredits })}
        bottomInset={toastBottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceStrong,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...textStyle('displayXl'),
    color: colors.ink,
  },
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  draftBannerText: {
    flex: 1,
    ...textStyle('bodySm'),
    color: colors.warning,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  address: {
    flex: 1,
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  sectionTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    marginTop: spacing.lg,
  },
  notFound: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  notFoundTitle: {
    ...textStyle('displayMd'),
    color: colors.ink,
    textAlign: 'center',
  },
  notFoundBody: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
  },
  notFoundButton: {
    marginTop: spacing.md,
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primaryPressed: {
    backgroundColor: colors.primaryActive,
  },
  primaryText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    backgroundColor: colors.canvas,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    ...elevation.sheet,
  },
  stickyButton: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  stickyButtonPressed: {
    backgroundColor: colors.primaryActive,
  },
  stickyButtonText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
});
