import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import { HUB_COPY, ITINERARY_COPY } from '../../../../constants/hubCopy';
import { getCityBySlug } from '../../../../constants/mockCities';
import {
  difficultyLabels,
  formatItineraryDistance,
  formatItineraryDuration,
  getItineraryById,
} from '../../../../constants/mockItineraries';
import { getPlaceById } from '../../../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../../../constants/theme';
import { usePremium } from '../../../../contexts/PremiumContext';
import { useFavorites } from '../../../../contexts/FavoritesContext';
import {
  trackEditorialItineraryMapTapped,
  trackEditorialItineraryViewed,
} from '../../../../lib/analytics';
import { buildFocusItineraryParam, resolveItineraryPlaces } from '../../../../lib/itineraryMap';

const FREE_STEPS_PREVIEW = 2;

export default function EditorialItineraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { slug, id } = useLocalSearchParams<{ slug: string; id: string }>();

  const city = useMemo(
    () => (typeof slug === 'string' ? getCityBySlug(slug) : undefined),
    [slug],
  );
  const itinerary = useMemo(
    () => (typeof id === 'string' ? getItineraryById(id) : undefined),
    [id],
  );
  const itineraryPlaces = useMemo(
    () => (itinerary ? resolveItineraryPlaces(itinerary.stepPoiIds) : []),
    [itinerary],
  );

  const { isUnlocked } = usePremium();
  const { isItineraryFavorite, toggleItineraryFavorite } = useFavorites();
  const unlocked = itinerary
    ? isUnlocked(itinerary.id, itinerary.isPremium)
    : false;
  const isFavorite = itinerary ? isItineraryFavorite(itinerary.id) : false;

  const [paywallVisible, setPaywallVisible] = useState(false);

  const scrollTopInset = PLACE_HERO_HEIGHT - PLACE_CONTENT_OVERLAP;
  const bodyMinHeight = windowHeight - scrollTopInset + PLACE_CONTENT_OVERLAP;

  useEffect(() => {
    if (itinerary && city) {
      trackEditorialItineraryViewed(itinerary.id, city.slug, !unlocked);
    }
  }, [itinerary, city, unlocked]);

  function handleBack() {
    router.back();
  }

  async function handleShare() {
    if (!itinerary || !city) return;
    await Share.share({
      message: `${itinerary.title} — ${city.name} sur NOOK`,
    });
  }

  function handlePrimaryCta() {
    if (!itinerary) return;
    if (!unlocked) {
      setPaywallVisible(true);
      return;
    }
    router.push(`/city/${slug}/itinerary/${id}/guide`);
  }

  function handleStepPress(stepIndex: number) {
    if (!itinerary) return;
    const poiId = itinerary.stepPoiIds[stepIndex];
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
    trackEditorialItineraryMapTapped(itinerary.id);
    router.push({
      pathname: '/(tabs)',
      params: { focusItinerary: buildFocusItineraryParam(itinerary.id) },
    });
  }

  if (!itinerary || !city) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.notFoundTitle}>{ITINERARY_COPY.notFoundTitle}</Text>
        <Text style={styles.notFoundBody}>{ITINERARY_COPY.notFoundBody}</Text>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={HUB_COPY.back}
        >
          <Text style={styles.primaryText}>{HUB_COPY.back}</Text>
        </Pressable>
      </View>
    );
  }

  const duration = formatItineraryDuration(itinerary.durationMinutes);
  const distance = formatItineraryDistance(itinerary.distanceMeters);
  const categoryLabel = getCategoryLabel(itinerary.categorySlug);

  return (
    <View style={styles.screen}>
      <PlaceHeroBackground imageUrl={itinerary.coverImageUrl} />
      <PlaceHeroControls
        isFavorite={isFavorite}
        onBack={handleBack}
        onToggleFavorite={() => itinerary && toggleItineraryFavorite(itinerary.id)}
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
                <Text style={styles.badgeTextPremium}>{HUB_COPY.premiumBadge}</Text>
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
              label={difficultyLabels[itinerary.difficulty]}
            />
            <SummaryItem
              icon="list-outline"
              label={`${itinerary.stepPoiIds.length} étapes`}
            />
          </View>

          <ItineraryRouteMapPreview
            places={itineraryPlaces}
            onPress={handleMapCta}
          />

          <Text style={styles.sectionTitle}>{ITINERARY_COPY.stepsSection}</Text>
          {itinerary.stepPoiIds.map((poiId, index) => {
            const place = getPlaceById(poiId);
            const stepLocked =
              itinerary.isPremium && !unlocked && index >= FREE_STEPS_PREVIEW;
            return (
              <ItineraryStepRow
                key={`${poiId}-${index}`}
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
          accessibilityLabel={unlocked ? ITINERARY_COPY.startCta : ITINERARY_COPY.unlockCta}
        >
          <Text style={styles.primaryText}>
            {unlocked ? ITINERARY_COPY.startCta : ITINERARY_COPY.unlockCta}
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
