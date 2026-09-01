import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TerritorialHubView } from '../../../components/city/TerritorialHubView';
import { usePoiHub } from '../../../hooks/usePoiHub';
import {
  trackHubSiteAffiliateTapped,
  trackHubSiteCategoryTapped,
  trackHubSiteMapCtaTapped,
  trackHubSitePoiTapped,
  trackHubSitePremiumTapped,
  trackHubSiteViewed,
} from '../../../lib/analytics';

export default function PoiSiteHubScreen() {
  const { t } = useTranslation('hub');
  const { id } = useLocalSearchParams<{ id: string }>();
  const poiId = typeof id === 'string' ? id : undefined;
  const { status, hub, reload } = usePoiHub(poiId);

  const config = useMemo(() => {
    if (!hub?.poiHubId) return null;
    const hubPoiId = hub.poiHubId;
    return {
      ...hub,
      onViewed: () => trackHubSiteViewed(hubPoiId, 'direct'),
      onCategoryTapped: (categorySlug: string) =>
        trackHubSiteCategoryTapped(hubPoiId, categorySlug),
      onPremiumTapped: (itineraryId: string, isLocked: boolean) =>
        trackHubSitePremiumTapped(hubPoiId, itineraryId, isLocked),
      onPoiTapped: (childPoiId: string, section: 'must_see' | 'recommended') =>
        trackHubSitePoiTapped(hubPoiId, childPoiId, section),
      onAffiliateTapped: (
        partner: string,
        slot: 'tourist_pass' | 'experience',
        itemId: string,
      ) => trackHubSiteAffiliateTapped(hubPoiId, partner, slot, itemId),
      onMapCtaTapped: () => trackHubSiteMapCtaTapped(hubPoiId),
    };
  }, [hub]);

  return (
    <TerritorialHubView
      status={status}
      config={config}
      notFoundTitle={t('siteNotFoundTitle')}
      notFoundBody={t('siteNotFoundBody')}
      paywallSource="hub_site"
      onRetry={reload}
    />
  );
}
