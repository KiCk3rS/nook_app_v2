import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { AffiliateMapCard } from '../../../components/city/AffiliateMapCard';
import { CategoryTile } from '../../../components/city/CategoryTile';
import { ExperienceCard } from '../../../components/city/ExperienceCard';
import { ExternalLinkSheet } from '../../../components/city/ExternalLinkSheet';
import { PoiCompactCard } from '../../../components/city/PoiCompactCard';
import { PremiumItineraryCard } from '../../../components/city/PremiumItineraryCard';
import {
  PLACE_CONTENT_OVERLAP,
  PLACE_HERO_HEIGHT,
  PlaceHeroBackground,
  PlaceHeroControls,
} from '../../../components/place/PlaceHero';
import { PaywallSheet } from '../../../components/paywall/PaywallSheet';
import { HUB_COPY } from '../../../constants/hubCopy';
import { itineraryCategories } from '../../../constants/itineraryCategories';
import { getCityBySlug } from '../../../constants/mockCities';
import {
  countItinerariesByCategory,
  getItineraryById,
} from '../../../constants/mockItineraries';
import { getPlaceById } from '../../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../../constants/theme';
import { usePremium } from '../../../contexts/PremiumContext';
import {
  trackHubCityAffiliateTapped,
  trackHubCityCategoryTapped,
  trackHubCityMapCtaTapped,
  trackHubCityPoiTapped,
  trackHubCityPremiumTapped,
  trackHubCityViewed,
} from '../../../lib/analytics';

export default function CityHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const city = useMemo(
    () => (typeof slug === 'string' ? getCityBySlug(slug) : undefined),
    [slug],
  );
  const { isUnlocked } = usePremium();

  const [externalLink, setExternalLink] = useState<{
    url: string;
    partner: string;
  } | null>(null);
  const [paywallItineraryId, setPaywallItineraryId] = useState<string | null>(null);

  const featuredItinerary = useMemo(() => {
    if (!city?.featuredPremiumItineraryId) return null;
    return getItineraryById(city.featuredPremiumItineraryId) ?? null;
  }, [city]);

  const mustSeePlaces = useMemo(
    () =>
      city?.mustSeePoiIds
        .map((id) => getPlaceById(id))
        .filter((p): p is NonNullable<typeof p> => p !== undefined) ?? [],
    [city],
  );

  const recommendedPlaces = useMemo(
    () =>
      city?.recommendedPoiIds
        .map((id) => getPlaceById(id))
        .filter((p): p is NonNullable<typeof p> => p !== undefined) ?? [],
    [city],
  );

  const scrollTopInset = PLACE_HERO_HEIGHT - PLACE_CONTENT_OVERLAP;
  const bodyMinHeight = windowHeight - scrollTopInset + PLACE_CONTENT_OVERLAP;

  useEffect(() => {
    if (city) trackHubCityViewed(city.slug, 'direct');
  }, [city]);

  function handleBack() {
    router.back();
  }

  async function handleShare() {
    if (!city) return;
    await Share.share({ message: HUB_COPY.shareMessage(city.name) });
  }

  function handleMapCta() {
    if (!city) return;
    trackHubCityMapCtaTapped(city.slug);
    router.push({
      pathname: '/(tabs)',
      params: { focusCity: city.slug },
    });
  }

  function handleCategoryPress(categorySlug: string) {
    if (!city) return;
    trackHubCityCategoryTapped(city.slug, categorySlug);
    router.push(`/city/${city.slug}/itineraries/${categorySlug}`);
  }

  function openItinerary(itineraryId: string, isPremium: boolean) {
    if (!city) return;
    if (isPremium && !isUnlocked(itineraryId, true)) {
      setPaywallItineraryId(itineraryId);
      return;
    }
    router.push(`/city/${city.slug}/itinerary/${itineraryId}`);
  }

  function handlePremiumPress() {
    if (!city || !featuredItinerary) return;
    trackHubCityPremiumTapped(city.slug, featuredItinerary.id, !isUnlocked(featuredItinerary.id, true));
    openItinerary(featuredItinerary.id, featuredItinerary.isPremium);
  }

  function handlePoiPress(poiId: string, section: 'must_see' | 'recommended') {
    if (!city) return;
    trackHubCityPoiTapped(city.slug, poiId, section);
    router.push(`/place/${poiId}`);
  }

  function handleAffiliatePress(
    url: string,
    partner: string,
    slot: 'map' | 'experience',
    itemId: string,
  ) {
    if (!city) return;
    trackHubCityAffiliateTapped(city.slug, partner, slot, itemId);
    setExternalLink({ url, partner });
  }

  if (!city) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.notFoundTitle}>{HUB_COPY.cityNotFoundTitle}</Text>
        <Text style={styles.notFoundBody}>{HUB_COPY.cityNotFoundBody}</Text>
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
    (cat) => countItinerariesByCategory(city.slug, cat.slug) > 0,
  );

  return (
    <View style={styles.screen}>
      <PlaceHeroBackground imageUrl={city.coverImageUrl} />
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
          <Text style={styles.title} accessibilityRole="header">
            {city.name}
          </Text>
          <Text style={styles.subtitle}>{city.subtitle}</Text>

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
                    itineraryCount={countItinerariesByCategory(city.slug, cat.slug)}
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
              <Text style={styles.sectionTitle}>
                {HUB_COPY.popularFallback(city.name)}
              </Text>
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

          {city.affiliateMaps.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{HUB_COPY.mapsSection}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              >
                {city.affiliateMaps.map((item) => (
                  <AffiliateMapCard
                    key={item.id}
                    item={item}
                    onPress={() =>
                      handleAffiliatePress(
                        item.affiliateUrl,
                        item.partnerName,
                        'map',
                        item.id,
                      )
                    }
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {city.affiliateExperiences.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{HUB_COPY.experiencesSection}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              >
                {city.affiliateExperiences.map((item) => (
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
        sourceScreen="hub_city"
        onClose={() => setPaywallItineraryId(null)}
        onUnlocked={() => {
          if (paywallItineraryId && city) {
            router.push(`/city/${city.slug}/itinerary/${paywallItineraryId}`);
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
