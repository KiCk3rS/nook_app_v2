import { useCallback } from 'react';

import { getCityBySlug } from '../constants/mockCities';
import { fetchCityHub } from '../lib/api/cities';
import { isApiConfigured } from '../lib/config';
import {
  cityHubToHubData,
  mockCityToHubData,
} from '../lib/mappers/cityHub';
import {
  useTerritorialHubResource,
  type UseTerritorialHubResult,
} from './useTerritorialHubResource';

export type { TerritorialHubStatus as CityHubStatus } from './useTerritorialHubResource';
export type UseCityHubResult = UseTerritorialHubResult;

export function useCityHub(slug: string | undefined): UseCityHubResult {
  const key = slug?.trim() ?? '';
  const enabled = key.length > 0;

  const load = useCallback(async () => {
    if (!key) return null;
    if (!isApiConfigured()) {
      const mock = getCityBySlug(key);
      return mock ? mockCityToHubData(mock) : null;
    }
    return cityHubToHubData(await fetchCityHub(key));
  }, [key]);

  return useTerritorialHubResource(enabled, load);
}
