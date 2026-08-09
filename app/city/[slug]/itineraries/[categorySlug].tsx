import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { EditorialCategoryListScreen } from '../../../../components/itinerary/EditorialCategoryListScreen';
import { getCityBySlug } from '../../../../constants/mockCities';

export default function ItineraryCategoryListRoute() {
  const { slug, categorySlug } = useLocalSearchParams<{
    slug: string;
    categorySlug: string;
  }>();

  const citySlug = typeof slug === 'string' ? slug : '';
  const category = typeof categorySlug === 'string' ? categorySlug : '';

  const subtitle = useMemo(() => {
    if (!citySlug) return undefined;
    return getCityBySlug(citySlug)?.name ?? citySlug;
  }, [citySlug]);

  return (
    <EditorialCategoryListScreen
      citySlug={citySlug}
      categorySlug={category}
      subtitle={subtitle}
    />
  );
}
