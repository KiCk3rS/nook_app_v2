import { useCallback, useEffect, useState } from 'react';

import {
  getPlaceById,
  getPlaceChildren,
  getPlaceParent,
  type MockPlace,
} from '../constants/mockPlaces';
import { isApiConfigured } from '../lib/config';
import { fetchPoiById, fetchPoiChildren } from '../lib/api/pois';
import {
  poiDetailToMockPlace,
  poiSummaryToMockPlaceSummary,
} from '../lib/mappers/poi';
import { ApiError } from '../types/api';

export interface UsePoiDetailResult {
  place: MockPlace | null;
  parentPlace: MockPlace | undefined;
  associatedPlaces: MockPlace[];
  loading: boolean;
  error: ApiError | Error | null;
  notFound: boolean;
  reload: () => void;
}

export function usePoiDetail(id: string | undefined): UsePoiDetailResult {
  const [place, setPlace] = useState<MockPlace | null>(null);
  const [parentPlace, setParentPlace] = useState<MockPlace | undefined>();
  const [associatedPlaces, setAssociatedPlaces] = useState<MockPlace[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!id) {
      setPlace(null);
      setParentPlace(undefined);
      setAssociatedPlaces([]);
      setLoading(false);
      setError(null);
      setNotFound(false);
      return;
    }

    let cancelled = false;

    async function loadMock(): Promise<void> {
      const mock = getPlaceById(id!);
      if (cancelled) return;
      if (!mock) {
        setPlace(null);
        setParentPlace(undefined);
        setAssociatedPlaces([]);
        setNotFound(true);
        setError(null);
        setLoading(false);
        return;
      }
      setPlace(mock);
      setParentPlace(getPlaceParent(mock));
      setAssociatedPlaces(getPlaceChildren(mock.id));
      setNotFound(false);
      setError(null);
      setLoading(false);
    }

    async function loadApi(): Promise<void> {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const detail = await fetchPoiById(id!, { includeAudios: true });
        if (cancelled) return;

        const mapped = poiDetailToMockPlace(detail);
        setPlace(mapped);

        if (detail.parentPoiId) {
          try {
            const parentDetail = await fetchPoiById(detail.parentPoiId, {
              includeAudios: false,
            });
            if (!cancelled) {
              setParentPlace(poiDetailToMockPlace(parentDetail));
            }
          } catch {
            if (!cancelled) setParentPlace(undefined);
          }
        } else {
          setParentPlace(undefined);
        }

        try {
          const children = await fetchPoiChildren(id!, { limit: 50 });
          if (!cancelled) {
            setAssociatedPlaces(children.items.map(poiSummaryToMockPlaceSummary));
          }
        } catch {
          if (!cancelled) setAssociatedPlaces([]);
        }

        setNotFound(false);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 404) {
          setPlace(null);
          setParentPlace(undefined);
          setAssociatedPlaces([]);
          setNotFound(true);
          setError(null);
        } else {
          setError(err instanceof Error ? err : new Error(String(err)));
          setPlace(null);
          setParentPlace(undefined);
          setAssociatedPlaces([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
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
  }, [id, reloadToken]);

  return {
    place,
    parentPlace,
    associatedPlaces,
    loading,
    error,
    notFound,
    reload,
  };
}
