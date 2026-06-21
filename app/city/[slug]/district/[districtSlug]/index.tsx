import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { TerritorialHubView } from '../../../../../components/city/TerritorialHubView';
import { HUB_COPY } from '../../../../../constants/hubCopy';
import { getCityBySlug } from '../../../../../constants/mockCities';
import { getDistrictBySlug } from '../../../../../constants/mockDistricts';
import {
  trackHubDistrictAffiliateTapped,
  trackHubDistrictCategoryTapped,
  trackHubDistrictMapCtaTapped,
  trackHubDistrictPoiTapped,
  trackHubDistrictPremiumTapped,
  trackHubDistrictViewed,
} from '../../../../../lib/analytics';

export default function DistrictHubScreen() {
  const { slug, districtSlug } = useLocalSearchParams<{
    slug: string;
    districtSlug: string;
  }>();

  const city = useMemo(
    () => (typeof slug === 'string' ? getCityBySlug(slug) : undefined),
    [slug],
  );
  const district = useMemo(() => {
    if (typeof slug !== 'string' || typeof districtSlug !== 'string') return undefined;
    return getDistrictBySlug(slug, districtSlug);
  }, [slug, districtSlug]);

  const config = useMemo(() => {
    if (!city || !district) return null;
    return {
      citySlug: city.slug,
      districtSlug: district.slug,
      name: district.name,
      coverImageUrl: district.coverImageUrl,
      subtitle: district.subtitle,
      mapRegion: district.mapRegion,
      mustSeePoiIds: district.mustSeePoiIds,
      recommendedPoiIds: district.recommendedPoiIds,
      featuredPremiumItineraryId: district.featuredPremiumItineraryId,
      affiliateExperiences: district.affiliateExperiences,
      parentCityName: city.name,
      onViewed: () => trackHubDistrictViewed(city.slug, district.slug, 'direct'),
      onCategoryTapped: (categorySlug: string) =>
        trackHubDistrictCategoryTapped(city.slug, district.slug, categorySlug),
      onPremiumTapped: (itineraryId: string, isLocked: boolean) =>
        trackHubDistrictPremiumTapped(city.slug, district.slug, itineraryId, isLocked),
      onPoiTapped: (poiId: string, section: 'must_see' | 'recommended') =>
        trackHubDistrictPoiTapped(city.slug, district.slug, poiId, section),
      onAffiliateTapped: (
        partner: string,
        slot: 'tourist_pass' | 'experience',
        itemId: string,
      ) => trackHubDistrictAffiliateTapped(city.slug, district.slug, partner, slot, itemId),
      onMapCtaTapped: () => trackHubDistrictMapCtaTapped(city.slug, district.slug),
    };
  }, [city, district]);

  return (
    <TerritorialHubView
      config={config}
      notFoundTitle={HUB_COPY.districtNotFoundTitle}
      notFoundBody={HUB_COPY.districtNotFoundBody}
      paywallSource="hub_district"
    />
  );
}
