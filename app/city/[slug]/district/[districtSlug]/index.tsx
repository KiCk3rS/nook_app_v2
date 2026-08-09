import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TerritorialHubView } from '../../../../../components/city/TerritorialHubView';
import { useDistrictHub } from '../../../../../hooks/useDistrictHub';
import {
  trackHubDistrictAffiliateTapped,
  trackHubDistrictCategoryTapped,
  trackHubDistrictMapCtaTapped,
  trackHubDistrictPoiTapped,
  trackHubDistrictPremiumTapped,
  trackHubDistrictViewed,
} from '../../../../../lib/analytics';

export default function DistrictHubScreen() {
  const { t } = useTranslation('hub');
  const { slug, districtSlug } = useLocalSearchParams<{
    slug: string;
    districtSlug: string;
  }>();
  const { status, hub, reload } = useDistrictHub(
    typeof slug === 'string' ? slug : undefined,
    typeof districtSlug === 'string' ? districtSlug : undefined,
  );

  const config = useMemo(() => {
    if (!hub || !hub.districtSlug) return null;
    const dSlug = hub.districtSlug;
    return {
      ...hub,
      onViewed: () => trackHubDistrictViewed(hub.citySlug, dSlug, 'direct'),
      onCategoryTapped: (categorySlug: string) =>
        trackHubDistrictCategoryTapped(hub.citySlug, dSlug, categorySlug),
      onPremiumTapped: (itineraryId: string, isLocked: boolean) =>
        trackHubDistrictPremiumTapped(hub.citySlug, dSlug, itineraryId, isLocked),
      onPoiTapped: (poiId: string, section: 'must_see' | 'recommended') =>
        trackHubDistrictPoiTapped(hub.citySlug, dSlug, poiId, section),
      onAffiliateTapped: (
        partner: string,
        slot: 'tourist_pass' | 'experience',
        itemId: string,
      ) =>
        trackHubDistrictAffiliateTapped(
          hub.citySlug,
          dSlug,
          partner,
          slot,
          itemId,
        ),
      onMapCtaTapped: () => trackHubDistrictMapCtaTapped(hub.citySlug, dSlug),
    };
  }, [hub]);

  return (
    <TerritorialHubView
      status={status}
      config={config}
      notFoundTitle={t('districtNotFoundTitle')}
      notFoundBody={t('districtNotFoundBody')}
      paywallSource="hub_district"
      onRetry={reload}
    />
  );
}
