import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TerritorialHubView } from '../../../components/city/TerritorialHubView';
import { getCityBySlug } from '../../../constants/mockCities';
import {
  trackHubCityAffiliateTapped,
  trackHubCityCategoryTapped,
  trackHubCityMapCtaTapped,
  trackHubCityPoiTapped,
  trackHubCityPremiumTapped,
  trackHubCityViewed,
} from '../../../lib/analytics';

export default function CityHubScreen() {
  const { t } = useTranslation('hub');
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const city = useMemo(
    () => (typeof slug === 'string' ? getCityBySlug(slug) : undefined),
    [slug],
  );

  const config = useMemo(() => {
    if (!city) return null;
    return {
      citySlug: city.slug,
      name: city.name,
      coverImageUrl: city.coverImageUrl,
      subtitle: city.subtitle,
      mapRegion: city.mapRegion,
      mustSeePoiIds: city.mustSeePoiIds,
      recommendedPoiIds: city.recommendedPoiIds,
      featuredPremiumItineraryId: city.featuredPremiumItineraryId,
      touristPasses: city.touristPasses,
      affiliateExperiences: city.affiliateExperiences,
      onViewed: () => trackHubCityViewed(city.slug, 'direct'),
      onCategoryTapped: (categorySlug: string) =>
        trackHubCityCategoryTapped(city.slug, categorySlug),
      onPremiumTapped: (itineraryId: string, isLocked: boolean) =>
        trackHubCityPremiumTapped(city.slug, itineraryId, isLocked),
      onPoiTapped: (poiId: string, section: 'must_see' | 'recommended') =>
        trackHubCityPoiTapped(city.slug, poiId, section),
      onAffiliateTapped: (
        partner: string,
        slot: 'tourist_pass' | 'experience',
        itemId: string,
      ) => trackHubCityAffiliateTapped(city.slug, partner, slot, itemId),
      onMapCtaTapped: () => trackHubCityMapCtaTapped(city.slug),
    };
  }, [city]);

  return (
    <TerritorialHubView
      config={config}
      notFoundTitle={t('cityNotFoundTitle')}
      notFoundBody={t('cityNotFoundBody')}
      paywallSource="hub_city"
    />
  );
}
