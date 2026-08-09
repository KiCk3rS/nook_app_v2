import { useCallback, useEffect, useState } from 'react';

import { getCityBySlug } from '../constants/mockCities';
import { fetchCityHub } from '../lib/api/cities';
import { isApiConfigured } from '../lib/config';
import {
  cityHubToHubData,
  mockCityToHubData,
  type TerritorialHubData,
} from '../lib/mappers/cityHub';
import { ApiError } from '../types/api';

export type CityHubStatus = 'loading' | 'error' | 'not_found' | 'ready';

export interface UseCityHubResult {
  status: CityHubStatus;
  hub: TerritorialHubData | null;
  error: ApiError | Error | null;
  reload: () => void;
}

export function useCityHub(slug: string | undefined): UseCityHubResult {
  const [hub, setHub] = useState<TerritorialHubData | null>(null);
  const [status, setStatus] = useState<CityHubStatus>(
    slug?.trim() ? 'loading' : 'not_found',
  );
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((n) => n + 1);
  }, []);

  useEffect(() => {
    const key = slug?.trim();
    if (!key) {
      setHub(null);
      setError(null);
      setStatus('not_found');
      return;
    }

    let cancelled = false;

    async function loadMock(): Promise<void> {
      const mock = getCityBySlug(key!);
      if (cancelled) return;
      if (!mock) {
        setHub(null);
        setError(null);
        setStatus('not_found');
        return;
      }
      setHub(mockCityToHubData(mock));
      setError(null);
      setStatus('ready');
    }

    async function loadApi(): Promise<void> {
      setStatus('loading');
      setError(null);

      try {
        const dto = await fetchCityHub(key!);
        if (cancelled) return;
        setHub(cityHubToHubData(dto));
        setError(null);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setHub(null);
        if (err instanceof ApiError && err.statusCode === 404) {
          setError(null);
          setStatus('not_found');
        } else {
          setError(err instanceof Error ? err : new Error(String(err)));
          setStatus('error');
        }
      }
    }

    if (!isApiConfigured()) {
      void loadMock();
    } else {
      void loadApi();
    }

    return () => {
      cancelled = true;
    };
  }, [slug, reloadToken]);

  return { status, hub, error, reload };
}
