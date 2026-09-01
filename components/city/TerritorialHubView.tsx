import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryTile } from './CategoryTile';
import { ExperienceCard } from './ExperienceCard';
import { ExternalLinkSheet } from './ExternalLinkSheet';
import { PoiCompactCard } from './PoiCompactCard';
import { PremiumItineraryCard } from './PremiumItineraryCard';
import { TouristPassCard } from './TouristPassCard';
import {
  PLACE_CONTENT_OVERLAP,
  PLACE_HERO_HEIGHT,
  PlaceHeroBackground,
  PlaceHeroControls,
} from '../place/PlaceHero';
import { PaywallSheet } from '../paywall/PaywallSheet';
import { itineraryCategories } from '../../constants/itineraryCategories';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import { usePremium } from '../../contexts/PremiumContext';
import type { TerritorialHubData } from '../../lib/mappers/cityHub';
import { editorialItineraryNavKey } from '../../lib/mappers/editorialItineraries';
import { getPlaceHref, getPlaceHrefById } from '../../lib/placeNavigation';

export type { TerritorialHubData };

export type TerritorialHubStatus = 'loading' | 'error' | 'not_found' | 'ready';

export type TerritorialHubConfig = TerritorialHubData & {
  onViewed?: () => void;
  onCategoryTapped?: (categorySlug: string) => void;
  onPremiumTapped?: (itineraryId: string, isLocked: boolean) => void;
  onPoiTapped?: (poiId: string, section: 'must_see' | 'recommended') => void;
  onAffiliateTapped?: (
    partner: string,
    slot: 'tourist_pass' | 'experience',
    itemId: string,
  ) => void;
  onMapCtaTapped?: () => void;
};

interface TerritorialHubViewProps {
  status: TerritorialHubStatus;
  config: TerritorialHubConfig | null;
  notFoundTitle: string;
  notFoundBody: string;
  paywallSource: 'hub_city' | 'hub_district' | 'hub_site';
  onRetry?: () => void;
}

export function TerritorialHubView({
  status,
  config,
  notFoundTitle,
  notFoundBody,
  paywallSource,
  onRetry,
}: TerritorialHubViewProps) {
  const { t } = useTranslation(['hub', 'common']);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { isUnlocked } = usePremium();

  const [externalLink, setExternalLink] = useState<{
    url: string;
    partner: string;
  } | null>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const featuredItinerary = config?.featuredPremiumItinerary ?? null;

  const mustSeePlaces = config?.mustSeePlaces ?? [];
  const recommendedPlaces = config?.recommendedPlaces ?? [];

  const scrollTopInset = PLACE_HERO_HEIGHT - PLACE_CONTENT_OVERLAP;
  const bodyMinHeight = windowHeight - scrollTopInset + PLACE_CONTENT_OVERLAP;

  useEffect(() => {
    if (status === 'ready' && config) config.onViewed?.();
  }, [status, config]);

  function handleBack() {
    router.back();
  }

  async function handleShare() {
    if (!config) return;
    const message = config.poiHubId
      ? t('hub:siteShareMessage', { name: config.name })
      : config.districtSlug
        ? t('hub:districtShareMessage', {
            district: config.name,
            city: config.parentCityName ?? config.citySlug,
          })
        : t('hub:shareMessage', { name: config.name });
    await Share.share({ message });
  }

  function handleMapCta() {
    if (!config) return;
    config.onMapCtaTapped?.();
    const region = config.mapRegion;
    const focusParams = region
      ? {
          focusLat: String(region.latitude),
          focusLng: String(region.longitude),
          focusLatDelta: String(region.latitudeDelta),
          focusLngDelta: String(region.longitudeDelta),
        }
      : {};
    router.push({
      pathname: '/(tabs)',
      params: config.districtSlug
        ? {
            focusDistrict: `${config.citySlug}/${config.districtSlug}`,
            ...focusParams,
          }
        : { focusCity: config.citySlug, ...focusParams },
    });
  }

  function handleCategoryPress(categorySlug: string) {
    if (!config) return;
    config.onCategoryTapped?.(categorySlug);
    if (config.districtSlug) {
      router.push({
        pathname: '/city/[slug]/district/[districtSlug]/itineraries/[categorySlug]',
        params: {
          slug: config.citySlug,
          districtSlug: config.districtSlug,
          categorySlug,
          districtName: config.name,
        },
      });
      return;
    }
    router.push(`/city/${config.citySlug}/itineraries/${categorySlug}`);
  }

  function openItinerary(navKey: string, isPremium: boolean) {
    if (!config) return;
    if (isPremium && !isUnlocked(navKey, true)) {
      setPaywallVisible(true);
      return;
    }
    router.push(`/city/${config.citySlug}/itinerary/${navKey}`);
  }

  function handlePremiumPress() {
    if (!config || !featuredItinerary) return;
    const navKey = editorialItineraryNavKey(featuredItinerary);
    config.onPremiumTapped?.(
      navKey,
      !isUnlocked(navKey, featuredItinerary.isPremium),
    );
    openItinerary(navKey, featuredItinerary.isPremium);
  }

  function handlePoiPress(poiId: string, section: 'must_see' | 'recommended') {
    if (!config) return;
    config.onPoiTapped?.(poiId, section);
    const place =
      config.mustSeePlaces.find((p) => p.id === poiId) ??
      config.recommendedPlaces.find((p) => p.id === poiId);
    router.push(place ? getPlaceHref(place) : getPlaceHrefById(poiId));
  }

  function handleAffiliatePress(
    url: string,
    partner: string,
    slot: 'tourist_pass' | 'experience',
    itemId: string,
  ) {
    if (!config) return;
    config.onAffiliateTapped?.(partner, slot, itemId);
    setExternalLink({ url, partner });
  }

  function handleParentCityPress() {
    if (!config?.parentCityName) return;
    router.push(`/city/${config.citySlug}`);
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
        {onRetry ? (
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel={t('common:retry')}
          >
            <Text style={styles.primaryText}>{t('common:retry')}</Text>
          </Pressable>
        ) : null}
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

  if (status === 'not_found' || !config) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.notFoundTitle}>{notFoundTitle}</Text>
        <Text style={styles.notFoundBody}>{notFoundBody}</Text>
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

  const categoryCounts = config.itineraryCategoryCounts ?? {};
  const visibleCategories = itineraryCategories.filter(
    (cat) => (categoryCounts[cat.slug] ?? 0) > 0,
  );

  const recommendedTitle = config.poiHubId
    ? t('hub:sitePopularFallback', { site: config.name })
    : config.districtSlug
      ? t('hub:districtPopularFallback', { district: config.name })
      : t('hub:popularFallback', { city: config.name });

  const touristPasses = config.touristPasses;
  const featuredNavKey = featuredItinerary
    ? editorialItineraryNavKey(featuredItinerary)
    : null;

  return (
    <View style={styles.screen}>
      <PlaceHeroBackground imageUrl={config.coverImageUrl} />
      <PlaceHeroControls
        onBack={handleBack}
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
            { minHeight: bodyMinHeight, paddingBottom: insets.bottom + spacing.xxl },
          ]}
        >
          {config.parentCityName ? (
            <Pressable
              style={({ pressed }) => [styles.parentLink, pressed && styles.parentLinkPressed]}
              onPress={handleParentCityPress}
              accessibilityRole="link"
              accessibilityLabel={
                config.poiHubId
                  ? t('hub:siteParentCityLink', { city: config.parentCityName })
                  : t('hub:parentCityLink', { city: config.parentCityName })
              }
            >
              <Ionicons name="chevron-back" size={16} color={colors.primary} />
              <Text style={styles.parentLinkText}>
                {config.poiHubId
                  ? t('hub:siteParentCityLink', { city: config.parentCityName })
                  : t('hub:parentCityLink', { city: config.parentCityName })}
              </Text>
            </Pressable>
          ) : null}

          <Text style={styles.title} accessibilityRole="header">
            {config.name}
          </Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>

          <Pressable
            style={({ pressed }) => [styles.mapCta, pressed && styles.primaryPressed]}
            onPress={handleMapCta}
            accessibilityRole="button"
            accessibilityLabel={t('hub:mapCta')}
          >
            <Ionicons name="map-outline" size={20} color={colors.onPrimary} />
            <Text style={styles.mapCtaText}>{t('hub:mapCta')}</Text>
          </Pressable>

          {visibleCategories.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('hub:categoriesSection')}</Text>
              <View style={styles.categoryGrid}>
                {visibleCategories.map((cat) => (
                  <CategoryTile
                    key={cat.slug}
                    category={cat}
                    itineraryCount={categoryCounts[cat.slug] ?? 0}
                    onPress={() => handleCategoryPress(cat.slug)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {featuredItinerary && featuredNavKey ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('hub:premiumSection')}</Text>
              <PremiumItineraryCard
                itinerary={featuredItinerary}
                isLocked={!isUnlocked(featuredNavKey, featuredItinerary.isPremium)}
                onPress={handlePremiumPress}
              />
            </View>
          ) : null}

          {mustSeePlaces.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('hub:mustSeeSection')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              >
                {mustSeePlaces.map((place) => (
                  <PoiCompactCard
                    key={place.id}
                    place={place}
                    onPress={() => handlePoiPress(place.id, 'must_see')}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {recommendedPlaces.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{recommendedTitle}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              >
                {recommendedPlaces.map((place) => (
                  <PoiCompactCard
                    key={place.id}
                    place={place}
                    onPress={() => handlePoiPress(place.id, 'recommended')}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {touristPasses.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('hub:touristPassesSection')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              >
                {touristPasses.map((item) => (
                  <TouristPassCard
                    key={item.id}
                    item={item}
                    onPress={() =>
                      handleAffiliatePress(
                        item.affiliateUrl,
                        item.partnerName,
                        'tourist_pass',
                        item.id,
                      )
                    }
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {config.affiliateExperiences.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('hub:experiencesSection')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              >
                {config.affiliateExperiences.map((item) => (
                  <ExperienceCard
                    key={item.id}
                    item={item}
                    onPress={() =>
                      handleAffiliatePress(
                        item.externalUrl,
                        item.provider,
                        'experience',
                        item.id,
                      )
                    }
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <ExternalLinkSheet
        visible={externalLink !== null}
        partnerName={externalLink?.partner ?? ''}
        onCancel={() => setExternalLink(null)}
        onContinue={() => {
          if (externalLink) void Linking.openURL(externalLink.url);
          setExternalLink(null);
        }}
      />

      <PaywallSheet
        visible={paywallVisible}
        itinerary={featuredItinerary}
        sourceScreen={paywallSource}
        onClose={() => setPaywallVisible(false)}
        onUnlocked={() => {
          if (featuredNavKey && config) {
            router.push(`/city/${config.citySlug}/itinerary/${featuredNavKey}`);
          }
          setPaywallVisible(false);
        }}
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
    gap: spacing.lg,
  },
  parentLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    alignSelf: 'flex-start',
    marginBottom: -spacing.sm,
  },
  parentLinkPressed: {
    opacity: 0.7,
  },
  parentLinkText: {
    ...textStyle('bodySm'),
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...textStyle('displayXl'),
    color: colors.ink,
  },
  subtitle: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    marginTop: -spacing.sm,
  },
  mapCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
  },
  mapCtaText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  carousel: {
    gap: spacing.md,
    paddingRight: spacing.base,
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
  primaryBtn: {
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
});
