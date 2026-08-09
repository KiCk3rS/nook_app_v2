import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GuidanceExperience } from '../../../../../components/guidance/GuidanceExperience';
import { getCityBySlug } from '../../../../../constants/mockCities';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../../../../constants/theme';
import { usePremium } from '../../../../../contexts/PremiumContext';
import { useEditorialItineraryDetail } from '../../../../../hooks/useEditorialItineraryDetail';
import {
  editorialCoverImageUrl,
  editorialItineraryNavKey,
} from '../../../../../lib/mappers/editorialItineraries';
import {
  guidanceStepsFromApiSteps,
  guidanceStepsFromPoiIds,
} from '../../../../../lib/itineraryMap';

export default function EditorialGuidanceScreen() {
  const { t } = useTranslation(['guidance', 'common']);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug, id, step } = useLocalSearchParams<{
    slug: string;
    id: string;
    step?: string;
  }>();

  const citySlug = typeof slug === 'string' ? slug : '';
  const idOrSlug = typeof id === 'string' ? id : '';

  const city = useMemo(
    () => (citySlug ? getCityBySlug(citySlug) : undefined),
    [citySlug],
  );
  const cityName = city?.name ?? citySlug;

  const { status, itinerary, reload } = useEditorialItineraryDetail(idOrSlug || undefined);
  const { isUnlocked } = usePremium();

  const navKey = itinerary ? editorialItineraryNavKey(itinerary) : idOrSlug;
  const unlocked = itinerary ? isUnlocked(navKey, itinerary.isPremium) : false;

  const guidanceSteps = useMemo(() => {
    if (!itinerary) return [];
    if (itinerary.steps.length > 0) {
      return guidanceStepsFromApiSteps(itinerary.steps);
    }
    return guidanceStepsFromPoiIds(itinerary.stepPoiIds);
  }, [itinerary]);

  const initialStepParam = useMemo(() => {
    if (typeof step !== 'string') return undefined;
    const parsed = parseInt(step, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [step]);

  useEffect(() => {
    if (status !== 'ready' || !itinerary) return;
    if (itinerary.isPremium && !unlocked) {
      router.replace(`/city/${citySlug}/itinerary/${navKey}`);
    }
  }, [status, citySlug, itinerary, navKey, router, unlocked]);

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
      </View>
    );
  }

  if (status === 'not_found' || !itinerary) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.notFoundTitle}>{t('guidance:notFoundTitle')}</Text>
        <Text style={styles.notFoundBody}>{t('guidance:notFoundBody')}</Text>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common:back')}
        >
          <Text style={styles.primaryText}>{t('common:back')}</Text>
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
      itineraryId={navKey}
      title={itinerary.title}
      coverImageUrl={editorialCoverImageUrl(itinerary.coverImageUrl)}
      guidanceSteps={guidanceSteps}
      citySlug={citySlug}
      cityName={cityName}
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
