import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TerritorialHubView } from '../../../../../components/city/TerritorialHubView';
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
import { mockDistrictToHubData } from '../../../../../lib/mappers/cityHub';

export default function DistrictHubScreen() {
  const { t } = useTranslation('hub');
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
    const data = mockDistrictToHubData(city.name, city.slug, district);
    return {
      ...data,
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
      ) =>
        trackHubDistrictAffiliateTapped(
          city.slug,
          district.slug,
          partner,
          slot,
          itemId,
        ),
      onMapCtaTapped: () => trackHubDistrictMapCtaTapped(city.slug, district.slug),
    };
  }, [city, district]);

  return (
    <TerritorialHubView
      status={config ? 'ready' : 'not_found'}
      config={config}
      notFoundTitle={t('districtNotFoundTitle')}
      notFoundBody={t('districtNotFoundBody')}
      paywallSource="hub_district"
    />
  );
}
