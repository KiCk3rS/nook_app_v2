import { useEffect, useState } from 'react';

import {
  getCityBySlug,
  type MockCity,
} from '../constants/mockCities';
import {
  popularCitySlugs,
  promotedCitySlugs,
} from '../constants/searchDiscovery';
import {
  fetchPopularCities,
  fetchPromotedCities,
} from '../lib/api/cities';
import { isApiConfigured } from '../lib/config';
import {
  citySummaryToCityView,
  mockCityToCityView,
  type CityView,
} from '../lib/mappers/cities';

function resolveMockCities(slugs: readonly string[]): CityView[] {
  return slugs
    .map((slug) => getCityBySlug(slug))
    .filter((city): city is MockCity => city != null)
    .map(mockCityToCityView);
}

function mockPromotedCities(): CityView[] {
  return resolveMockCities(promotedCitySlugs);
}

function mockPopularCities(): CityView[] {
  return resolveMockCities(popularCitySlugs);
}

export interface UseCityCarouselsResult {
  promotedCities: CityView[];
  popularCities: CityView[];
  loading: boolean;
}

/**
 * Villes promues / populaires pour A2.1 et A4.1.
 * Aligné sur `useDiscoveryFeed` : vide + loading si API ; mock si offline / erreur.
 */
export function useCityCarousels(): UseCityCarouselsResult {
  const useApi = isApiConfigured();
  const [promotedCities, setPromotedCities] = useState<CityView[]>(() =>
    useApi ? [] : mockPromotedCities(),
  );
  const [popularCities, setPopularCities] = useState<CityView[]>(() =>
    useApi ? [] : mockPopularCities(),
  );
  const [loading, setLoading] = useState(useApi);

  useEffect(() => {
    if (!useApi) {
      setPromotedCities(mockPromotedCities());
      setPopularCities(mockPopularCities());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setPromotedCities([]);
    setPopularCities([]);
    setLoading(true);

    (async () => {
      try {
        const [promoted, popular] = await Promise.all([
          fetchPromotedCities(),
          fetchPopularCities(),
        ]);
        if (cancelled) return;
        setPromotedCities(promoted.map(citySummaryToCityView));
        setPopularCities(popular.map(citySummaryToCityView));
      } catch {
        if (cancelled) return;
        setPromotedCities(mockPromotedCities());
        setPopularCities(mockPopularCities());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [useApi]);

  return { promotedCities, popularCities, loading };
}
