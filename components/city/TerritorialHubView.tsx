import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
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
import type { AffiliateExperienceItem, TouristPassItem } from '../../constants/mockCities';
import { HUB_COPY } from '../../constants/hubCopy';
import { itineraryCategories } from '../../constants/itineraryCategories';
import {
  countItinerariesByCategory,
  getItineraryById,
} from '../../constants/mockItineraries';
import { getPlaceById } from '../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import { usePremium } from '../../contexts/PremiumContext';
import { getPlaceHrefById } from '../../lib/placeNavigation';

export interface TerritorialHubConfig {
  citySlug: string;
  districtSlug?: string;
  name: string;
  coverImageUrl: string;
  subtitle: string;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  mustSeePoiIds: string[];
  recommendedPoiIds: string[];
  featuredPremiumItineraryId: string | null;
  touristPasses?: TouristPassItem[];
  affiliateExperiences: AffiliateExperienceItem[];
  parentCityName?: string;
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
}

interface TerritorialHubViewProps {
  config: TerritorialHubConfig | null;
  notFoundTitle: string;
  notFoundBody: string;
  paywallSource: 'hub_city' | 'hub_district';
}

export function TerritorialHubView({
  config,
  notFoundTitle,
  notFoundBody,
  paywallSource,
}: TerritorialHubViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { isUnlocked } = usePremium();

  const [externalLink, setExternalLink] = useState<{
    url: string;
    partner: string;
  } | null>(null);
  const [paywallItineraryId, setPaywallItineraryId] = useState<string | null>(null);

  const featuredItinerary = useMemo(() => {
    if (!config?.featuredPremiumItineraryId) return null;
    return getItineraryById(config.featuredPremiumItineraryId) ?? null;
  }, [config]);

  const mustSeePlaces = useMemo(
    () =>
      config?.mustSeePoiIds
        .map((id) => getPlaceById(id))
        .filter((p): p is NonNullable<typeof p> => p !== undefined) ?? [],
    [config],
  );

  const recommendedPlaces = useMemo(
    () =>
      config?.recommendedPoiIds
        .map((id) => getPlaceById(id))
        .filter((p): p is NonNullable<typeof p> => p !== undefined) ?? [],
    [config],
  );

  const scrollTopInset = PLACE_HERO_HEIGHT - PLACE_CONTENT_OVERLAP;
  const bodyMinHeight = windowHeight - scrollTopInset + PLACE_CONTENT_OVERLAP;

  useEffect(() => {
    if (config) config.onViewed?.();
  }, [config]);

  function handleBack() {
    router.back();
  }

  async function handleShare() {
    if (!config) return;
    const message = config.districtSlug
      ? HUB_COPY.districtShareMessage(config.name, config.parentCityName ?? config.citySlug)
      : HUB_COPY.shareMessage(config.name);
    await Share.share({ message });
  }

  function handleMapCta() {
    if (!config) return;
    config.onMapCtaTapped?.();
    router.push({
      pathname: '/(tabs)',
      params: config.districtSlug
        ? { focusDistrict: `${config.citySlug}/${config.districtSlug}` }
        : { focusCity: config.citySlug },
    });
  }

  function handleCategoryPress(categorySlug: string) {
    if (!config) return;
    config.onCategoryTapped?.(categorySlug);
    if (config.districtSlug) {
      router.push(
        `/city/${config.citySlug}/district/${config.districtSlug}/itineraries/${categorySlug}`,
      );
      return;
    }
    router.push(`/city/${config.citySlug}/itineraries/${categorySlug}`);
  }

  function openItinerary(itineraryId: string, isPremium: boolean) {
    if (!config) return;
    if (isPremium && !isUnlocked(itineraryId, true)) {
      setPaywallItineraryId(itineraryId);
      return;
    }
    router.push(`/city/${config.citySlug}/itinerary/${itineraryId}`);
  }

  function handlePremiumPress() {
    if (!config || !featuredItinerary) return;
    config.onPremiumTapped?.(
      featuredItinerary.id,
      !isUnlocked(featuredItinerary.id, featuredItinerary.isPremium),
    );
    openItinerary(featuredItinerary.id, featuredItinerary.isPremium);
  }

  function handlePoiPress(poiId: string, section: 'must_see' | 'recommended') {
    if (!config) return;
    config.onPoiTapped?.(poiId, section);
    router.push(getPlaceHrefById(poiId));
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

  if (!config) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.notFoundTitle}>{notFoundTitle}</Text>
        <Text style={styles.notFoundBody}>{notFoundBody}</Text>
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

  const paywallItinerary = paywallItineraryId
    ? (getItineraryById(paywallItineraryId) ?? null)
    : null;

  const visibleCategories = itineraryCategories.filter(
    (cat) =>
      countItinerariesByCategory(
        config.citySlug,
        cat.slug,
        config.districtSlug,
      ) > 0,
  );

  const recommendedTitle = config.districtSlug
    ? HUB_COPY.districtPopularFallback(config.name)
    : HUB_COPY.popularFallback(config.name);

  const touristPasses = config.touristPasses ?? [];

  return (
    <View style={styles.screen}>
      <PlaceHeroBackground imageUrl={config.coverImageUrl} />
      <PlaceHeroControls
        isFavorite={false}
        onBack={handleBack}
        onToggleFavorite={() => {}}
        onShare={() => void handleShare()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: scrollTopInset, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.body, { minHeight: bodyMinHeight }]}>
          {config.parentCityName ? (
            <Pressable
              style={({ pressed }) => [styles.parentLink, pressed && styles.parentLinkPressed]}
              onPress={handleParentCityPress}
              accessibilityRole="link"
              accessibilityLabel={HUB_COPY.parentCityLink(config.parentCityName)}
            >
              <Ionicons name="chevron-back" size={16} color={colors.primary} />
              <Text style={styles.parentLinkText}>
                {HUB_COPY.parentCityLink(config.parentCityName)}
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
            accessibilityLabel={HUB_COPY.mapCta}
          >
            <Ionicons name="map-outline" size={20} color={colors.onPrimary} />
            <Text style={styles.mapCtaText}>{HUB_COPY.mapCta}</Text>
          </Pressable>

          {visibleCategories.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{HUB_COPY.categoriesSection}</Text>
              <View style={styles.categoryGrid}>
                {visibleCategories.map((cat) => (
                  <CategoryTile
                    key={cat.slug}
                    category={cat}
                    itineraryCount={countItinerariesByCategory(
                      config.citySlug,
                      cat.slug,
                      config.districtSlug,
                    )}
                    onPress={() => handleCategoryPress(cat.slug)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {featuredItinerary ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{HUB_COPY.premiumSection}</Text>
              <PremiumItineraryCard
                itinerary={featuredItinerary}
                isLocked={!isUnlocked(featuredItinerary.id, featuredItinerary.isPremium)}
                onPress={handlePremiumPress}
              />
            </View>
          ) : null}

          {mustSeePlaces.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{HUB_COPY.mustSeeSection}</Text>
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
              <Text style={styles.sectionTitle}>{HUB_COPY.touristPassesSection}</Text>
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
              <Text style={styles.sectionTitle}>{HUB_COPY.experiencesSection}</Text>
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
        visible={paywallItineraryId !== null}
        itinerary={paywallItinerary}
        sourceScreen={paywallSource}
        onClose={() => setPaywallItineraryId(null)}
        onUnlocked={() => {
          if (paywallItineraryId && config) {
            router.push(`/city/${config.citySlug}/itinerary/${paywallItineraryId}`);
          }
          setPaywallItineraryId(null);
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
