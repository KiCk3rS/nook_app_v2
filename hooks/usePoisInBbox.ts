import { useEffect, useMemo, useRef, useState } from 'react';

import {
  categories as mockCategories,
  getRootPlaces,
  isRootPlace,
  type MockPlace,
} from '../constants/mockPlaces';
import type { PaginatedResponse, PoiSummary } from '../types/api';
import { isApiConfigured } from '../lib/config';
import { fetchCategories, type CategoriesListResponse } from '../lib/api/categories';
import { fetchPois } from '../lib/api/pois';
import {
  categoryDtoToCatalogueCategory,
  mockPlaceToMarker,
  poiSummaryToMarker,
} from '../lib/mappers/poi';
import type { CatalogueCategory, CataloguePlaceMarker } from '../types/catalogue';
import { regionToBbox } from '../lib/geo/bbox';
import type { MapRegion } from '../lib/itineraryMap';
import { getPlaceCategoryLabel } from '../lib/i18n/categoryLabels';

const DEFAULT_DEBOUNCE_MS = 350;
const MAP_POI_LIMIT = 100;

export interface UsePoisInBboxOptions {
  region: MapRegion | null;
  categorySlug?: string;
  enabled?: boolean;
  debounceMs?: number;
}

export interface UsePoisInBboxResult {
  places: CataloguePlaceMarker[];
  loading: boolean;
  error: Error | null;
}

function filterMockMarkers(
  places: MockPlace[],
  categorySlug?: string,
): CataloguePlaceMarker[] {
  const roots = places.filter(isRootPlace);
  const filtered =
    categorySlug && categorySlug !== 'all'
      ? roots.filter((p) => p.categoryId === categorySlug)
      : roots;
  return filtered.map(mockPlaceToMarker);
}

export function usePoisInBbox({
  region,
  categorySlug,
  enabled = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UsePoisInBboxOptions): UsePoisInBboxResult {
  const [places, setPlaces] = useState<CataloguePlaceMarker[]>(() =>
    isApiConfigured() ? [] : filterMockMarkers(getRootPlaces(), categorySlug),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const bbox = useMemo(
    () => (region ? regionToBbox(region) : null),
    [region],
  );

  const prevBboxRef = useRef<string | null>(null);
  const prevCategoryRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;

    if (!isApiConfigured()) {
      setPlaces(filterMockMarkers(getRootPlaces(), categorySlug));
      setLoading(false);
      setError(null);
      return;
    }

    if (!bbox) return;

    const categoryChanged = prevCategoryRef.current !== categorySlug;
    const bboxChanged = prevBboxRef.current !== bbox;
    const isInitialLoad = prevBboxRef.current === null;

    prevCategoryRef.current = categorySlug;
    prevBboxRef.current = bbox;

    if (categoryChanged && !isInitialLoad) {
      setPlaces([]);
    }

    /** Catégorie : fetch immédiat. Carte (bbox) : debounce. Réactivation : fetch immédiat. */
    const delay =
      categoryChanged && !isInitialLoad
        ? 0
        : bboxChanged || isInitialLoad
          ? debounceMs
          : 0;

    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);

      void fetchPois({
        bbox,
        category: categorySlug && categorySlug !== 'all' ? categorySlug : undefined,
        rootsOnly: true,
        limit: MAP_POI_LIMIT,
      })
        .then((response: PaginatedResponse<PoiSummary>) => {
          if (cancelled) return;
          setPlaces(response.items.map(poiSummaryToMarker));
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setError(err instanceof Error ? err : new Error(String(err)));
          setPlaces([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bbox, categorySlug, debounceMs, enabled]);

  return { places, loading, error };
}

export interface UseCategoriesResult {
  categories: CatalogueCategory[];
  loading: boolean;
  error: Error | null;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<CatalogueCategory[]>(() =>
    isApiConfigured()
      ? []
      : mockCategories
          .filter((c) => c.id !== 'all')
          .map((c) => ({ id: c.id, slug: c.id, label: getPlaceCategoryLabel(c.id) })),
  );
  const [loading, setLoading] = useState(isApiConfigured());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isApiConfigured()) {
      setCategories(
        mockCategories
          .filter((c) => c.id !== 'all')
          .map((c) => ({
            id: c.id,
            slug: c.id,
            label: getPlaceCategoryLabel(c.id),
          })),
      );
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void fetchCategories()
      .then((response: CategoriesListResponse) => {
        if (cancelled) return;
        setCategories(response.items.map(categoryDtoToCatalogueCategory));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
}
