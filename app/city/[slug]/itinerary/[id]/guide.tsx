import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GuidanceExperience } from '../../../../../components/guidance/GuidanceExperience';
import { GUIDANCE_COPY } from '../../../../../constants/guidanceCopy';
import { HUB_COPY } from '../../../../../constants/hubCopy';
import { getCityBySlug } from '../../../../../constants/mockCities';
import { getItineraryById } from '../../../../../constants/mockItineraries';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../../../../constants/theme';
import { usePremium } from '../../../../../contexts/PremiumContext';

export default function EditorialGuidanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug, id, step } = useLocalSearchParams<{
    slug: string;
    id: string;
    step?: string;
  }>();

  const city = useMemo(
    () => (typeof slug === 'string' ? getCityBySlug(slug) : undefined),
    [slug],
  );
  const itinerary = useMemo(
    () => (typeof id === 'string' ? getItineraryById(id) : undefined),
    [id],
  );

  const { isUnlocked } = usePremium();
  const unlocked = itinerary
    ? isUnlocked(itinerary.id, itinerary.isPremium)
    : false;

  const initialStepParam = useMemo(() => {
    if (typeof step !== 'string') return undefined;
    const parsed = parseInt(step, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [step]);

  useEffect(() => {
    if (!itinerary || !city) return;
    if (itinerary.isPremium && !unlocked) {
      router.replace(`/city/${city.slug}/itinerary/${itinerary.id}`);
    }
  }, [city, itinerary, router, unlocked]);

  if (!itinerary || !city) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.notFoundTitle}>{GUIDANCE_COPY.notFoundTitle}</Text>
        <Text style={styles.notFoundBody}>{GUIDANCE_COPY.notFoundBody}</Text>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={GUIDANCE_COPY.back}
        >
          <Text style={styles.primaryText}>{HUB_COPY.back}</Text>
        </Pressable>
      </View>
    );
  }

  if (itinerary.isPremium && !unlocked) {
    return null;
  }

  return (
    <GuidanceExperience
      sourceType="editorial"
      itineraryId={itinerary.id}
      title={itinerary.title}
      coverImageUrl={itinerary.coverImageUrl}
      stepPoiIds={itinerary.stepPoiIds}
      citySlug={city.slug}
      cityName={city.name}
      initialStepParam={initialStepParam}
    />
  );
}

const styles = StyleSheet.create({
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
  primaryBtn: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryPressed: {
    backgroundColor: colors.primaryActive,
  },
  primaryText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
});
