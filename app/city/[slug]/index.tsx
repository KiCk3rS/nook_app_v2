import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TerritorialHubView } from '../../../components/city/TerritorialHubView';
import { useCityHub } from '../../../hooks/useCityHub';
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
  const { status, hub, reload } = useCityHub(
    typeof slug === 'string' ? slug : undefined,
  );

  const config = useMemo(() => {
    if (!hub) return null;
    return {
      ...hub,
      onViewed: () => trackHubCityViewed(hub.citySlug, 'direct'),
      onCategoryTapped: (categorySlug: string) =>
        trackHubCityCategoryTapped(hub.citySlug, categorySlug),
      onPremiumTapped: (itineraryId: string, isLocked: boolean) =>
        trackHubCityPremiumTapped(hub.citySlug, itineraryId, isLocked),
      onPoiTapped: (poiId: string, section: 'must_see' | 'recommended') =>
        trackHubCityPoiTapped(hub.citySlug, poiId, section),
      onAffiliateTapped: (
        partner: string,
        slot: 'tourist_pass' | 'experience',
        itemId: string,
      ) => trackHubCityAffiliateTapped(hub.citySlug, partner, slot, itemId),
      onMapCtaTapped: () => trackHubCityMapCtaTapped(hub.citySlug),
    };
  }, [hub]);

  return (
    <TerritorialHubView
      status={status}
      config={config}
      notFoundTitle={t('cityNotFoundTitle')}
      notFoundBody={t('cityNotFoundBody')}
      paywallSource="hub_city"
      onRetry={reload}
    />
  );
}
