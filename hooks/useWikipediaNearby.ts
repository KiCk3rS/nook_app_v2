import { useCallback, useEffect, useRef, useState } from 'react';

import {
  searchWikipediaNearby,
  type WikipediaExistingNearbyPoi,
  type WikipediaNearbyAnchor,
  type WikipediaNearbyItem,
} from '../lib/api/adminWikipedia';
import {
  mapAdminWikipediaErrorKey,
  type AdminWikipediaErrorKey,
} from '../lib/mappers/adminWikipediaError';

const DEFAULT_DEBOUNCE_MS = 400;
const DEFAULT_RADIUS_METERS = 300;
const DEFAULT_LIMIT = 10;
const MIN_RADIUS_METERS = 100;
const MAX_RADIUS_METERS = 2000;
const RADIUS_STEP_METERS = 50;

export interface UseWikipediaNearbyOptions {
  enabled: boolean;
  lat: number | null;
  lng: number | null;
  lang: string;
  radiusMeters?: number;
  debounceMs?: number;
  limit?: number;
}

export interface UseWikipediaNearbyResult {
  anchor: WikipediaNearbyAnchor | null;
  items: WikipediaNearbyItem[];
  existingNearbyPois: WikipediaExistingNearbyPoi[];
  radiusMeters: number;
  setRadiusMeters: (value: number) => void;
  increaseRadius: () => void;
  decreaseRadius: () => void;
  isSearching: boolean;
  errorKey: AdminWikipediaErrorKey | null;
  retry: () => void;
}

function clampRadius(value: number): number {
  return Math.min(
    MAX_RADIUS_METERS,
    Math.max(MIN_RADIUS_METERS, Math.round(value / RADIUS_STEP_METERS) * RADIUS_STEP_METERS),
  );
}

export function useWikipediaNearby(
  options: UseWikipediaNearbyOptions,
): UseWikipediaNearbyResult {
  const {
    enabled,
    lat,
    lng,
    lang,
    radiusMeters: initialRadius = DEFAULT_RADIUS_METERS,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    limit = DEFAULT_LIMIT,
  } = options;

  const [radiusMeters, setRadiusMetersState] = useState(
    clampRadius(initialRadius),
  );
  const [debouncedAnchor, setDebouncedAnchor] = useState<{
    lat: number;
    lng: number;
    radiusMeters: number;
  } | null>(null);
  const [anchor, setAnchor] = useState<WikipediaNearbyAnchor | null>(null);
  const [items, setItems] = useState<WikipediaNearbyItem[]>([]);
  const [existingNearbyPois, setExistingNearbyPois] = useState<
    WikipediaExistingNearbyPoi[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorKey, setErrorKey] = useState<AdminWikipediaErrorKey | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const requestIdRef = useRef(0);

  const setRadiusMeters = useCallback((value: number) => {
    setRadiusMetersState(clampRadius(value));
  }, []);

  const increaseRadius = useCallback(() => {
    setRadiusMetersState((current) =>
      clampRadius(current + RADIUS_STEP_METERS),
    );
  }, []);

  const decreaseRadius = useCallback(() => {
    setRadiusMetersState((current) =>
      clampRadius(current - RADIUS_STEP_METERS),
    );
  }, []);

  useEffect(() => {
    if (!enabled || lat == null || lng == null) {
      setDebouncedAnchor(null);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedAnchor({ lat, lng, radiusMeters });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [enabled, lat, lng, radiusMeters, debounceMs]);

  useEffect(() => {
    if (!enabled || debouncedAnchor == null) {
      setAnchor(null);
      setItems([]);
      setExistingNearbyPois([]);
      setIsSearching(false);
      setErrorKey(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsSearching(true);
    setErrorKey(null);

    void searchWikipediaNearby({
      lat: debouncedAnchor.lat,
      lng: debouncedAnchor.lng,
      radiusMeters: debouncedAnchor.radiusMeters,
      lang,
      limit,
    })
      .then((result) => {
        if (requestId !== requestIdRef.current) return;
        setAnchor(result.anchor);
        setItems(result.items);
        setExistingNearbyPois(result.existingNearbyPois);
      })
      .catch((error: unknown) => {
        if (requestId !== requestIdRef.current) return;
        setAnchor(null);
        setItems([]);
        setExistingNearbyPois([]);
        setErrorKey(mapAdminWikipediaErrorKey(error));
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setIsSearching(false);
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [enabled, debouncedAnchor, lang, limit, retryNonce]);

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  return {
    anchor,
    items,
    existingNearbyPois,
    radiusMeters,
    setRadiusMeters,
    increaseRadius,
    decreaseRadius,
    isSearching,
    errorKey,
    retry,
  };
}
