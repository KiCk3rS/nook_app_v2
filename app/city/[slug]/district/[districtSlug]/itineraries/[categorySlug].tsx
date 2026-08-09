import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { EditorialCategoryListScreen } from '../../../../../../components/itinerary/EditorialCategoryListScreen';
import { getDistrictBySlug } from '../../../../../../constants/mockDistricts';
import { isApiConfigured } from '../../../../../../lib/config';

export default function DistrictItineraryCategoryListRoute() {
  const { slug, districtSlug, categorySlug, districtName: districtNameParam } =
    useLocalSearchParams<{
      slug: string;
      districtSlug: string;
      categorySlug: string;
      districtName?: string;
    }>();

  const citySlug = typeof slug === 'string' ? slug : '';
  const district = typeof districtSlug === 'string' ? districtSlug : '';
  const category = typeof categorySlug === 'string' ? categorySlug : '';

  const subtitle = useMemo(() => {
    if (typeof districtNameParam === 'string' && districtNameParam.trim()) {
      return districtNameParam.trim();
    }
    if (!citySlug || !district || isApiConfigured()) {
      return undefined;
    }
    return getDistrictBySlug(citySlug, district)?.name;
  }, [citySlug, district, districtNameParam]);

  return (
    <EditorialCategoryListScreen
      citySlug={citySlug}
      categorySlug={category}
      districtSlug={district || undefined}
      subtitle={subtitle}
    />
  );
}
