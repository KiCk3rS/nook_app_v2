import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PromotedCityCard } from '../city/PromotedCityCard';
import { PopularCityCard } from '../city/PopularCityCard';
import { popularCitySlugs, promotedCitySlugs } from '../../constants/discoveryFeed';
import { getCityBySlug } from '../../constants/mockCities';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import { useDiscoveryFeed } from '../../hooks/useDiscoveryFeed';
import {
  trackDiscoveryFeedViewed,
  trackDiscoveryPlaceTapped,
  trackDiscoveryPromotedHidden,
  trackHubCityViewed,
  trackPromotedHidden,
} from '../../lib/analytics';
import type { DiscoverySectionKey } from '../../lib/mappers/discovery';
import { getPlaceHrefById } from '../../lib/placeNavigation';

import { DiscoveryPlaceCard } from './DiscoveryPlaceCard';

const LOAD_MORE_THRESHOLD = 120;

interface DiscoverySectionCarouselProps {
  title: string;
  section: DiscoverySectionKey;
  items: ReturnType<typeof useDiscoveryFeed>['latest']['items'];
  loadingMore: boolean;
  onSelectPlace: (placeId: string, section: DiscoverySectionKey) => void;
  onLoadMore: (section: DiscoverySectionKey) => void;
}

function DiscoverySectionCarousel({
  title,
  section,
  items,
  loadingMore,
  onSelectPlace,
  onLoadMore,
}: DiscoverySectionCarouselProps) {
  if (items.length === 0) {
    return null;
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const nearEnd =
      contentOffset.x + layoutMeasurement.width >=
      contentSize.width - LOAD_MORE_THRESHOLD;
    if (nearEnd) {
      onLoadMore(section);
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
        onScroll={handleScroll}
        scrollEventThrottle={200}
      >
        {items.map((item) => (
          <DiscoveryPlaceCard
            key={item.id}
            item={item}
            onPress={() => onSelectPlace(item.id, section)}
          />
        ))}
        {loadingMore ? (
          <View style={styles.loadingMore}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

export function DiscoveryFeedView() {
  const { t } = useTranslation('discovery');
  const router = useRouter();
  const [showPromoted, setShowPromoted] = useState(true);
  const { latest, popular, topRated, initialLoading, loadMore } =
    useDiscoveryFeed();

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

  useEffect(() => {
    trackDiscoveryFeedViewed();
  }, []);

  function handleSelectCity(citySlug: string) {
    trackHubCityViewed(citySlug, 'feed');
    router.push(`/city/${citySlug}`);
  }

  function handleSelectPlace(placeId: string, section: DiscoverySectionKey) {
    trackDiscoveryPlaceTapped(placeId, section);
    router.push(getPlaceHrefById(placeId));
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

        {initialLoading ? (
          <View style={styles.initialLoading}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}

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

        <DiscoverySectionCarousel
          title={t('latestSectionTitle')}
          section="latest"
          items={latest.items}
          loadingMore={latest.loadingMore}
          onSelectPlace={handleSelectPlace}
          onLoadMore={loadMore}
        />

        <DiscoverySectionCarousel
          title={t('popularSectionTitle')}
          section="popular"
          items={popular.items}
          loadingMore={popular.loadingMore}
          onSelectPlace={handleSelectPlace}
          onLoadMore={loadMore}
        />

        <DiscoverySectionCarousel
          title={t('topRatedSectionTitle')}
          section="top_rated"
          items={topRated.items}
          loadingMore={topRated.loadingMore}
          onSelectPlace={handleSelectPlace}
          onLoadMore={loadMore}
        />

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
  initialLoading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
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
    alignItems: 'center',
  },
  loadingMore: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
