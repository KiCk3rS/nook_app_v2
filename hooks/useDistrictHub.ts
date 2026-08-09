import { useCallback } from 'react';

import { getCityBySlug } from '../constants/mockCities';
import { getDistrictBySlug } from '../constants/mockDistricts';
import { fetchDistrictHub } from '../lib/api/cities';
import { isApiConfigured } from '../lib/config';
import {
  districtHubToHubData,
  mockDistrictToHubData,
} from '../lib/mappers/cityHub';
import {
  useTerritorialHubResource,
  type UseTerritorialHubResult,
} from './useTerritorialHubResource';

export type { TerritorialHubStatus as DistrictHubStatus } from './useTerritorialHubResource';
export type UseDistrictHubResult = UseTerritorialHubResult;

export function useDistrictHub(
  citySlug: string | undefined,
  districtSlug: string | undefined,
): UseDistrictHubResult {
  const cityKey = citySlug?.trim() ?? '';
  const districtKey = districtSlug?.trim() ?? '';
  const enabled = cityKey.length > 0 && districtKey.length > 0;

  const load = useCallback(async () => {
    if (!cityKey || !districtKey) return null;
    if (!isApiConfigured()) {
      const city = getCityBySlug(cityKey);
      const district = getDistrictBySlug(cityKey, districtKey);
      if (!city || !district) return null;
      return mockDistrictToHubData(city.name, city.slug, district);
    }
    return districtHubToHubData(await fetchDistrictHub(cityKey, districtKey));
  }, [cityKey, districtKey]);

  return useTerritorialHubResource(enabled, load);
}
