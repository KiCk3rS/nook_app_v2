import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getLatestDiscoveryPlaces,
  getPopularDiscoveryPlaces,
  getTopRatedDiscoveryPlaces,
} from '../constants/discoveryFeed';
import {
  buildDiscoveryLoadMoreQuery,
  DISCOVERY_PAGE_SIZE,
  fetchDiscoveryLatest,
  fetchDiscoveryPopular,
  fetchDiscoveryTopRated,
} from '../lib/api/discovery';
import { isApiConfigured } from '../lib/config';
import {
  discoveryItemToCardProps,
  mockDiscoveryPlaceItemToCardProps,
  type DiscoveryCardItem,
  type DiscoverySectionKey,
} from '../lib/mappers/discovery';

export interface DiscoverySectionState {
  items: DiscoveryCardItem[];
  total: number;
  offset: number;
  limit: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
}

export interface UseDiscoveryFeedResult {
  latest: DiscoverySectionState;
  popular: DiscoverySectionState;
  topRated: DiscoverySectionState;
  initialLoading: boolean;
  error: Error | null;
  loadMore: (section: DiscoverySectionKey) => void;
}

function emptySectionState(): DiscoverySectionState {
  return {
    items: [],
    total: 0,
    offset: 0,
    limit: DISCOVERY_PAGE_SIZE,
    loading: false,
    loadingMore: false,
    hasMore: false,
  };
}

function sectionFromMock(items: DiscoveryCardItem[]): DiscoverySectionState {
  return {
    items,
    total: items.length,
    offset: 0,
    limit: items.length,
    loading: false,
    loadingMore: false,
    hasMore: false,
  };
}

const FETCHERS = {
  latest: fetchDiscoveryLatest,
  popular: fetchDiscoveryPopular,
  top_rated: fetchDiscoveryTopRated,
} as const;

function mapSectionResponse(
  section: DiscoverySectionKey,
  response: Awaited<ReturnType<typeof fetchDiscoveryLatest>>,
  locale: string,
): DiscoverySectionState {
  const items = response.items.map((item) =>
    discoveryItemToCardProps(item, section, locale),
  );
  const nextQuery = buildDiscoveryLoadMoreQuery(response);
  return {
    items,
    total: response.total,
    offset: response.offset,
    limit: response.limit,
    loading: false,
    loadingMore: false,
    hasMore: nextQuery != null,
  };
}

export function useDiscoveryFeed(): UseDiscoveryFeedResult {
  const { i18n } = useTranslation();
  const useApi = isApiConfigured();

  const [latest, setLatest] = useState<DiscoverySectionState>(() =>
    useApi
      ? { ...emptySectionState(), loading: true }
      : sectionFromMock(
          getLatestDiscoveryPlaces().map(mockDiscoveryPlaceItemToCardProps),
        ),
  );
  const [popular, setPopular] = useState<DiscoverySectionState>(() =>
    useApi
      ? { ...emptySectionState(), loading: true }
      : sectionFromMock(
          getPopularDiscoveryPlaces().map(mockDiscoveryPlaceItemToCardProps),
        ),
  );
  const [topRated, setTopRated] = useState<DiscoverySectionState>(() =>
    useApi
      ? { ...emptySectionState(), loading: true }
      : sectionFromMock(
          getTopRatedDiscoveryPlaces().map(mockDiscoveryPlaceItemToCardProps),
        ),
  );
  const [error, setError] = useState<Error | null>(null);

  const loadingMoreRef = useRef<Record<DiscoverySectionKey, boolean>>({
    latest: false,
    popular: false,
    top_rated: false,
  });

  const setters = {
    latest: setLatest,
    popular: setPopular,
    top_rated: setTopRated,
  } as const;

  useEffect(() => {
    if (!useApi) {
      setLatest(
        sectionFromMock(
          getLatestDiscoveryPlaces().map(mockDiscoveryPlaceItemToCardProps),
        ),
      );
      setPopular(
        sectionFromMock(
          getPopularDiscoveryPlaces().map(mockDiscoveryPlaceItemToCardProps),
        ),
      );
      setTopRated(
        sectionFromMock(
          getTopRatedDiscoveryPlaces().map(mockDiscoveryPlaceItemToCardProps),
        ),
      );
      setError(null);
      return;
    }

    let cancelled = false;
    setLatest((s) => ({ ...s, loading: true }));
    setPopular((s) => ({ ...s, loading: true }));
    setTopRated((s) => ({ ...s, loading: true }));
    setError(null);

    void Promise.all([
      fetchDiscoveryLatest({ limit: DISCOVERY_PAGE_SIZE, offset: 0 }),
      fetchDiscoveryPopular({ limit: DISCOVERY_PAGE_SIZE, offset: 0 }),
      fetchDiscoveryTopRated({ limit: DISCOVERY_PAGE_SIZE, offset: 0 }),
    ])
      .then(([latestRes, popularRes, topRatedRes]) => {
        if (cancelled) return;
        setLatest(mapSectionResponse('latest', latestRes, i18n.language));
        setPopular(mapSectionResponse('popular', popularRes, i18n.language));
        setTopRated(
          mapSectionResponse('top_rated', topRatedRes, i18n.language),
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLatest(emptySectionState());
        setPopular(emptySectionState());
        setTopRated(emptySectionState());
      });

    return () => {
      cancelled = true;
    };
  }, [i18n.language, useApi]);

  const loadMore = useCallback(
    (section: DiscoverySectionKey) => {
      if (!useApi) return;

      const state =
        section === 'latest'
          ? latest
          : section === 'popular'
            ? popular
            : topRated;

      if (!state.hasMore || state.loading || state.loadingMore) return;
      if (loadingMoreRef.current[section]) return;

      const nextQuery = buildDiscoveryLoadMoreQuery(state);
      if (!nextQuery) return;

      const setSection = setters[section];
      loadingMoreRef.current[section] = true;
      setSection((s) => ({ ...s, loadingMore: true }));

      void FETCHERS[section](nextQuery)
        .then((response) => {
          const mapped = response.items.map((item) =>
            discoveryItemToCardProps(item, section, i18n.language),
          );
          const nextPage = buildDiscoveryLoadMoreQuery(response);
          setSection((s) => ({
            items: [...s.items, ...mapped],
            total: response.total,
            offset: response.offset,
            limit: response.limit,
            loading: false,
            loadingMore: false,
            hasMore: nextPage != null,
          }));
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err : new Error(String(err)));
          setSection((s) => ({ ...s, loadingMore: false }));
        })
        .finally(() => {
          loadingMoreRef.current[section] = false;
        });
    },
    [i18n.language, latest, popular, topRated, useApi],
  );

  const initialLoading =
    useApi && (latest.loading || popular.loading || topRated.loading);

  return {
    latest,
    popular,
    topRated,
    initialLoading,
    error,
    loadMore,
  };
}
