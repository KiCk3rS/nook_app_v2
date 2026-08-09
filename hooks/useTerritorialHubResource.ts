import { useCallback, useEffect, useState } from 'react';

import type { TerritorialHubData } from '../lib/mappers/cityHub';
import { ApiError } from '../types/api';

export type TerritorialHubStatus = 'loading' | 'error' | 'not_found' | 'ready';

export interface UseTerritorialHubResult {
  status: TerritorialHubStatus;
  hub: TerritorialHubData | null;
  error: ApiError | Error | null;
  reload: () => void;
}

/**
 * Machine d’état commune hub ville / quartier.
 * `load` doit être stable (`useCallback`) et renvoyer `null` pour un 404 métier mock.
 */
export function useTerritorialHubResource(
  enabled: boolean,
  load: () => Promise<TerritorialHubData | null>,
): UseTerritorialHubResult {
  const [hub, setHub] = useState<TerritorialHubData | null>(null);
  const [status, setStatus] = useState<TerritorialHubStatus>(
    enabled ? 'loading' : 'not_found',
  );
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setHub(null);
      setError(null);
      setStatus('not_found');
      return;
    }

    let cancelled = false;

    async function run(): Promise<void> {
      setStatus('loading');
      setError(null);

      try {
        const data = await load();
        if (cancelled) return;
        if (!data) {
          setHub(null);
          setError(null);
          setStatus('not_found');
          return;
        }
        setHub(data);
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

    void run();

    return () => {
      cancelled = true;
    };
  }, [enabled, load, reloadToken]);

  return { status, hub, error, reload };
}
