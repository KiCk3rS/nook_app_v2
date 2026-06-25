import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PromotedCityCard } from '../city/PromotedCityCard';
import { PopularCityCard } from '../city/PopularCityCard';
import {
  getLatestDiscoveryPlaces,
  getPopularDiscoveryPlaces,
  getTopRatedDiscoveryPlaces,
  popularCitySlugs,
  promotedCitySlugs,
} from '../../constants/discoveryFeed';
import { getCityBySlug } from '../../constants/mockCities';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import {
  trackDiscoveryFeedViewed,
  trackDiscoveryPlaceTapped,
  trackDiscoveryPromotedHidden,
  trackHubCityViewed,
  trackPromotedHidden,
} from '../../lib/analytics';
import { getPlaceHref } from '../../lib/placeNavigation';

import { DiscoveryPlaceCard } from './DiscoveryPlaceCard';

export function DiscoveryFeedView() {
  const { t } = useTranslation('discovery');
  const router = useRouter();
  const [showPromoted, setShowPromoted] = useState(true);

  const promotedCities = useMemo(
    () =>
      promotedCitySlugs
        .map((slug) => getCityBySlug(slug))
        .filter((city): city is NonNullable<typeof city> => city != null),
    [],
  );

  const popularCities = useMemo(
    () =>
      popularCitySlugs
        .map((slug) => getCityBySlug(slug))
        .filter((city): city is NonNullable<typeof city> => city != null),
    [],
  );

  const latestPlaces = useMemo(() => getLatestDiscoveryPlaces(), []);
  const popularPlaces = useMemo(() => getPopularDiscoveryPlaces(), []);
  const topRatedPlaces = useMemo(() => getTopRatedDiscoveryPlaces(), []);

  useEffect(() => {
    trackDiscoveryFeedViewed();
  }, []);

  function handleSelectCity(citySlug: string) {
    trackHubCityViewed(citySlug, 'feed');
    router.push(`/city/${citySlug}`);
  }

  function handleSelectPlace(placeId: string, section: 'latest' | 'popular' | 'top_rated') {
    const place = [...latestPlaces, ...popularPlaces, ...topRatedPlaces].find(
      (item) => item.place.id === placeId,
    )?.place;
    if (!place) return;
    trackDiscoveryPlaceTapped(placeId, section);
    router.push(getPlaceHref(place));
  }

  function handleHidePromoted() {
    trackPromotedHidden();
    trackDiscoveryPromotedHidden();
    setShowPromoted(false);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle} accessibilityRole="header">
          {t('title')}
        </Text>

        {showPromoted && promotedCities.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t('promotedSectionTitle')}
              </Text>
              <Pressable
                onPress={handleHidePromoted}
                accessibilityRole="button"
                accessibilityLabel={t('hidePromoted')}
                hitSlop={8}
              >
                <Text style={styles.hideLink}>{t('hidePromoted')}</Text>
              </Pressable>
            </View>
            {promotedCities.map((city) => (
              <PromotedCityCard
                key={city.slug}
                city={city}
                onPress={() => handleSelectCity(city.slug)}
              />
            ))}
          </View>
        ) : null}

        {popularCities.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('popularCitiesSectionTitle')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {popularCities.map((city) => (
                <PopularCityCard
                  key={city.slug}
                  city={city}
                  onPress={() => handleSelectCity(city.slug)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {latestPlaces.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('latestSectionTitle')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {latestPlaces.map(({ place, subtitle }) => (
                <DiscoveryPlaceCard
                  key={place.id}
                  place={place}
                  subtitle={subtitle}
                  onPress={() => handleSelectPlace(place.id, 'latest')}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {popularPlaces.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('popularSectionTitle')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {popularPlaces.map(({ place, subtitle }) => (
                <DiscoveryPlaceCard
                  key={place.id}
                  place={place}
                  subtitle={subtitle}
                  onPress={() => handleSelectPlace(place.id, 'popular')}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {topRatedPlaces.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('topRatedSectionTitle')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {topRatedPlaces.map(({ place, subtitle }) => (
                <DiscoveryPlaceCard
                  key={place.id}
                  place={place}
                  subtitle={subtitle}
                  onPress={() => handleSelectPlace(place.id, 'top_rated')}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View
          style={styles.teaser}
          accessibilityRole="text"
          accessibilityLabel={`${t('missingPlaceTitle')} — ${t('missingPlaceFooter')}`}
          accessibilityState={{ disabled: true }}
        >
          <View style={styles.teaserIconWrap}>
            <Ionicons name="location-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.teaserBody}>
            <Text style={styles.teaserTitle}>{t('missingPlaceTitle')}</Text>
            <Text style={styles.teaserText}>{t('missingPlaceBody')}</Text>
            <Text style={styles.teaserFooter}>{t('missingPlaceFooter')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl + 56,
    gap: spacing.xl,
  },
  pageTitle: {
    ...textStyle('displaySm'),
    color: colors.ink,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    flex: 1,
  },
  hideLink: {
    ...textStyle('buttonSm'),
    color: colors.muted,
    minHeight: componentSizes.iconControlSize,
    textAlignVertical: 'center',
    paddingVertical: spacing.xs,
  },
  carousel: {
    gap: spacing.md,
    paddingRight: spacing.base,
  },
  teaser: {
    flexDirection: 'row',
    gap: spacing.base,
    padding: spacing.base,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  teaserIconWrap: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  teaserBody: {
    flex: 1,
    gap: spacing.xs,
  },
  teaserTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  teaserText: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  teaserFooter: {
    ...textStyle('captionSm'),
    color: colors.mutedSoft,
  },
});
