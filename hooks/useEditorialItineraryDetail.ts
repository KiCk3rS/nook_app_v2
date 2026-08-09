import { useCallback, useEffect, useState } from 'react';

import {
  fetchEditorialItinerary,
  resolveEditorialItinerary,
} from '../lib/api/editorialItineraries';
import { isApiConfigured } from '../lib/config';
import type { EditorialItineraryDetail } from '../types/api';
import { ApiError } from '../types/api';

export type EditorialItineraryDetailStatus =
  | 'loading'
  | 'ready'
  | 'not_found'
  | 'error';

export interface UseEditorialItineraryDetailResult {
  status: EditorialItineraryDetailStatus;
  itinerary: EditorialItineraryDetail | null;
  reload: () => void;
}

export function useEditorialItineraryDetail(
  idOrSlug: string | undefined,
): UseEditorialItineraryDetailResult {
  const [itinerary, setItinerary] = useState<EditorialItineraryDetail | null>(null);
  const [status, setStatus] = useState<EditorialItineraryDetailStatus>('loading');
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!idOrSlug) {
      setItinerary(null);
      setStatus('not_found');
      return;
    }

    let cancelled = false;

    async function load() {
      setStatus('loading');
      try {
        if (!isApiConfigured()) {
          const mock = await resolveEditorialItinerary(idOrSlug!, { useMock: true });
          if (cancelled) return;
          if (!mock) {
            setItinerary(null);
            setStatus('not_found');
            return;
          }
          setItinerary({ ...mock, steps: [] });
          setStatus('ready');
          return;
        }

        const detail = await fetchEditorialItinerary(idOrSlug!);
        if (cancelled) return;
        setItinerary(detail);
        setStatus('ready');
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.statusCode === 404) {
          setItinerary(null);
          setStatus('not_found');
          return;
        }
        setItinerary(null);
        setStatus('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [idOrSlug, reloadToken]);

  return { status, itinerary, reload };
}
