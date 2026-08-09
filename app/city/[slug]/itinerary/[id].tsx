import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ItineraryRouteMapPreview } from '../../../../components/itinerary/ItineraryRouteMapPreview';
import { ItineraryStepRow } from '../../../../components/itinerary/ItineraryStepRow';
import {
  PLACE_CONTENT_OVERLAP,
  PLACE_HERO_HEIGHT,
  PlaceHeroBackground,
  PlaceHeroControls,
} from '../../../../components/place/PlaceHero';
import { PaywallSheet } from '../../../../components/paywall/PaywallSheet';
import { getCategoryLabel } from '../../../../constants/itineraryCategories';
import { getCityBySlug } from '../../../../constants/mockCities';
import { getItineraryDifficultyLabel } from '../../../../constants/mockItineraries';
import { PLACE_IMAGE_PLACEHOLDER } from '../../../../constants/placeImages';
import { getPlaceById, type MockPlace } from '../../../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../../../constants/theme';
import { usePremium } from '../../../../contexts/PremiumContext';
import { useFavorites } from '../../../../contexts/FavoritesContext';
import { useEditorialItineraryDetail } from '../../../../hooks/useEditorialItineraryDetail';
import {
  trackEditorialItineraryMapTapped,
  trackEditorialItineraryViewed,
} from '../../../../lib/analytics';
import {
  formatItineraryDistance,
  formatItineraryDuration,
  formatStepsCount,
} from '../../../../lib/i18n/formatters';
import {
  editorialCoverImageUrl,
  editorialItineraryNavKey,
  editorialStepCount,
} from '../../../../lib/mappers/editorialItineraries';
import {
  buildFocusItineraryParam,
  guidanceStepsFromApiSteps,
  guidanceStepsFromPoiIds,
} from '../../../../lib/itineraryMap';

const FREE_STEPS_PREVIEW = 2;

function stepToPlaceLike(step: {
  poiId: string;
  title: string;
  lat: number | null;
  lng: number | null;
}): MockPlace {
  return {
    id: step.poiId,
    name: step.title || step.poiId,
    latitude: step.lat ?? 0,
    longitude: step.lng ?? 0,
    categoryId: 'culture',
    address: '',
    imageUrl: PLACE_IMAGE_PLACEHOLDER,
    description: '',
    audioGuides: [],
  };
}

export default function EditorialItineraryScreen() {
  const { t } = useTranslation(['hub', 'common']);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { slug, id } = useLocalSearchParams<{ slug: string; id: string }>();

  const citySlug = typeof slug === 'string' ? slug : '';
  const idOrSlug = typeof id === 'string' ? id : '';

  const city = useMemo(
    () => (citySlug ? getCityBySlug(citySlug) : undefined),
    [citySlug],
  );
  const cityName = city?.name ?? citySlug;

  const { status, itinerary, reload } = useEditorialItineraryDetail(idOrSlug || undefined);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const { isUnlocked } = usePremium();
  const { isItineraryFavorite, toggleItineraryFavorite } = useFavorites();

  const navKey = itinerary ? editorialItineraryNavKey(itinerary) : idOrSlug;
  const unlocked = itinerary ? isUnlocked(navKey, itinerary.isPremium) : false;
  const isFavorite = itinerary ? isItineraryFavorite(itinerary.id) : false;

  const guidanceSteps = useMemo(() => {
    if (!itinerary) return [];
    if (itinerary.steps.length > 0) {
      return guidanceStepsFromApiSteps(itinerary.steps);
    }
    return guidanceStepsFromPoiIds(itinerary.stepPoiIds);
  }, [itinerary]);

  const scrollTopInset = PLACE_HERO_HEIGHT - PLACE_CONTENT_OVERLAP;
  const bodyMinHeight = windowHeight - scrollTopInset + PLACE_CONTENT_OVERLAP;

  useEffect(() => {
    if (itinerary && citySlug) {
      trackEditorialItineraryViewed(navKey, citySlug, !unlocked);
    }
  }, [itinerary, citySlug, unlocked, navKey]);

  function handleBack() {
    router.back();
  }

  async function handleShare() {
    if (!itinerary) return;
    await Share.share({
      message: t('hub:itineraryShareMessage', {
        title: itinerary.title,
        city: cityName,
      }),
    });
  }

  function handlePrimaryCta() {
    if (!itinerary) return;
    if (!unlocked) {
      setPaywallVisible(true);
      return;
    }
    router.push(`/city/${citySlug}/itinerary/${navKey}/guide`);
  }

  function handleStepPress(stepIndex: number) {
    if (!itinerary) return;
    const step = itinerary.steps[stepIndex];
    const poiId = step?.poiId ?? itinerary.stepPoiIds[stepIndex];
    if (!poiId) return;
    const stepLocked =
      itinerary.isPremium && !unlocked && stepIndex >= FREE_STEPS_PREVIEW;

    if (stepLocked) {
      setPaywallVisible(true);
      return;
    }
    router.push(`/place/${poiId}`);
  }

  function handleMapCta() {
    if (!itinerary) return;
    trackEditorialItineraryMapTapped(navKey);
    router.push({
      pathname: '/(tabs)',
      params: { focusItinerary: buildFocusItineraryParam(navKey) },
    });
  }

  if (status === 'loading') {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.notFoundTitle}>{t('common:errorGeneric')}</Text>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
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

  if (status === 'not_found' || !itinerary) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.notFoundTitle}>{t('hub:itineraryNotFoundTitle')}</Text>
        <Text style={styles.notFoundBody}>{t('hub:itineraryNotFoundBody')}</Text>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t('common:back')}
        >
          <Text style={styles.primaryText}>{t('common:back')}</Text>
        </Pressable>
      </View>
    );
  }

  const duration = formatItineraryDuration(itinerary.durationMinutes);
  const distance = formatItineraryDistance(itinerary.distanceMeters);
  const categoryLabel = getCategoryLabel(itinerary.categorySlug);
  const coverUri = editorialCoverImageUrl(itinerary.coverImageUrl);
  const stepCount = editorialStepCount(itinerary);
  const stepRows =
    itinerary.steps.length > 0
      ? itinerary.steps
      : itinerary.stepPoiIds.map((poiId, order) => ({
          order,
          poiId,
          title: poiId,
          lat: null as number | null,
          lng: null as number | null,
        }));

  return (
    <View style={styles.screen}>
      <PlaceHeroBackground imageUrl={coverUri} />
      <PlaceHeroControls
        isFavorite={isFavorite}
        onBack={handleBack}
        onToggleFavorite={() =>
          toggleItineraryFavorite(itinerary.id, {
            title: itinerary.title,
            slug: itinerary.slug,
            coverImageUrl: itinerary.coverImageUrl,
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
            { minHeight: bodyMinHeight, paddingBottom: insets.bottom + 100 },
          ]}
        >
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{categoryLabel}</Text>
            </View>
            {itinerary.isPremium ? (
              <View style={[styles.badge, styles.badgePremium]}>
                <Text style={styles.badgeTextPremium}>{t('hub:premiumBadge')}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.title} accessibilityRole="header">
            {itinerary.title}
          </Text>
          <Text style={styles.description}>{itinerary.description}</Text>

          <View style={styles.summaryRow}>
            <SummaryItem icon="time-outline" label={duration} />
            <SummaryItem icon="walk-outline" label={distance} />
            <SummaryItem
              icon="speedometer-outline"
              label={getItineraryDifficultyLabel(itinerary.difficulty)}
            />
            <SummaryItem icon="list-outline" label={formatStepsCount(stepCount)} />
          </View>

          <ItineraryRouteMapPreview
            guidanceSteps={guidanceSteps}
            onPress={handleMapCta}
          />

          <Text style={styles.sectionTitle}>{t('hub:itineraryStepsSection')}</Text>
          {stepRows.map((step, index) => {
            const stepLocked =
              itinerary.isPremium && !unlocked && index >= FREE_STEPS_PREVIEW;
            const place =
              itinerary.steps.length > 0
                ? stepToPlaceLike(step)
                : (getPlaceById(step.poiId) ?? stepToPlaceLike(step));
            return (
              <ItineraryStepRow
                key={`${step.poiId}-${index}`}
                order={index + 1}
                place={place}
                isLocked={stepLocked}
                onPress={() => handleStepPress(index)}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.stickyBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
          onPress={handlePrimaryCta}
          accessibilityRole="button"
          accessibilityLabel={unlocked ? t('hub:itineraryStartCta') : t('hub:itineraryUnlockCta')}
        >
          <Text style={styles.primaryText}>
            {unlocked ? t('hub:itineraryStartCta') : t('hub:itineraryUnlockCta')}
          </Text>
        </Pressable>
      </View>

      <PaywallSheet
        visible={paywallVisible}
        itinerary={itinerary}
        sourceScreen="itinerary_detail"
        onClose={() => setPaywallVisible(false)}
        onUnlocked={() => setPaywallVisible(false)}
      />
    </View>
  );
}

function SummaryItem({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.summaryItem}>
      <Ionicons name={icon} size={16} color={colors.muted} />
      <Text style={styles.summaryLabel}>{label}</Text>
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
  },
  badgePremium: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    ...textStyle('captionSm'),
    color: colors.muted,
    fontWeight: '600',
  },
  badgeTextPremium: {
    ...textStyle('captionSm'),
    color: colors.onPrimary,
    fontWeight: '600',
  },
  title: {
    ...textStyle('displayXl'),
    color: colors.ink,
  },
  description: {
    ...textStyle('bodyMd'),
    color: colors.body,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryLabel: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  sectionTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    marginTop: spacing.sm,
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
  },
  primaryBtn: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPressed: {
    backgroundColor: colors.primaryActive,
  },
  primaryText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
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
});
