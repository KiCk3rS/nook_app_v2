import { useCallback } from 'react';

import { isMockSiteHubPoiId } from '../constants/mockSiteHubs';
import { fetchPoiHub } from '../lib/api/pois';
import { isApiConfigured } from '../lib/config';
import {
  mockLouvreSiteToHubData,
  poiHubToHubData,
} from '../lib/mappers/cityHub';
import {
  useTerritorialHubResource,
  type UseTerritorialHubResult,
} from './useTerritorialHubResource';

export type { TerritorialHubStatus as PoiHubStatus } from './useTerritorialHubResource';
export type UsePoiHubResult = UseTerritorialHubResult;

export function usePoiHub(poiId: string | undefined): UsePoiHubResult {
  const id = poiId?.trim() ?? '';
  const enabled = id.length > 0;

  const load = useCallback(async () => {
    if (!id) return null;
    if (!isApiConfigured()) {
      if (!isMockSiteHubPoiId(id)) return null;
      return mockLouvreSiteToHubData();
    }
    return poiHubToHubData(await fetchPoiHub(id));
  }, [id]);

  return useTerritorialHubResource(enabled, load);
}
