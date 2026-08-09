import { useCallback, useEffect, useRef, useState } from 'react';

import {
  searchWikipedia,
  type WikipediaSearchItem,
} from '../lib/api/adminWikipedia';
import {
  mapAdminWikipediaErrorKey,
  type AdminWikipediaErrorKey,
} from '../lib/mappers/adminWikipediaError';

const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_MIN_LENGTH = 2;
const DEFAULT_LIMIT = 10;

export interface UseWikipediaSearchOptions {
  /** Recherche active (feuille ouverte, étape search). */
  enabled: boolean;
  query: string;
  lang: string;
  debounceMs?: number;
  minLength?: number;
  limit?: number;
}

export interface UseWikipediaSearchResult {
  debouncedQuery: string;
  items: WikipediaSearchItem[];
  isSearching: boolean;
  errorKey: AdminWikipediaErrorKey | null;
  retry: () => void;
}

export function useWikipediaSearch(
  options: UseWikipediaSearchOptions,
): UseWikipediaSearchResult {
  const {
    enabled,
    query,
    lang,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    minLength = DEFAULT_MIN_LENGTH,
    limit = DEFAULT_LIMIT,
  } = options;

  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState<WikipediaSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorKey, setErrorKey] = useState<AdminWikipediaErrorKey | null>(
    null,
  );
  const [retryNonce, setRetryNonce] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setIsSearching(false);
      setErrorKey(null);
      return;
    }

    if (debouncedQuery.length < minLength) {
      setItems([]);
      setIsSearching(false);
      setErrorKey(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsSearching(true);
    setErrorKey(null);

    void searchWikipedia({ q: debouncedQuery, lang, limit })
      .then((result) => {
        if (requestId !== requestIdRef.current) return;
        setItems(result.items);
      })
      .catch((error: unknown) => {
        if (requestId !== requestIdRef.current) return;
        setItems([]);
        setErrorKey(mapAdminWikipediaErrorKey(error));
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setIsSearching(false);
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [enabled, debouncedQuery, lang, limit, minLength, retryNonce]);

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  return {
    debouncedQuery,
    items,
    isSearching,
    errorKey,
    retry,
  };
}
