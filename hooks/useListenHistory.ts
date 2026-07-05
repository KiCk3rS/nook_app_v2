import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getMockListenHistory,
  groupListenHistory,
  type ListenHistoryItem,
} from '../constants/mockListenHistory';
import { fetchListenHistory } from '../lib/api/listenHistory';
import { listenHistoryEntryToItem } from '../lib/mappers/listenHistory';
import { shouldUseMockData } from '../lib/config';

interface UseListenHistoryResult {
  sections: ReturnType<typeof groupListenHistory>;
  loading: boolean;
  error: boolean;
  reload: () => void;
}

export function useListenHistory(
  enabled: boolean,
  isMockSession: boolean,
): UseListenHistoryResult {
  const { i18n } = useTranslation();
  const [items, setItems] = useState<ListenHistoryItem[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const useMockLayer = shouldUseMockData(isMockSession);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      try {
        if (useMockLayer) {
          if (!cancelled) {
            setItems(getMockListenHistory());
          }
          return;
        }

        const response = await fetchListenHistory({ limit: 50, offset: 0 });
        const mapped = response.items
          .map((entry) => listenHistoryEntryToItem(entry, i18n.language))
          .filter((item): item is ListenHistoryItem => item != null);

        if (!cancelled) {
          setItems(mapped);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, i18n.language, reloadToken, useMockLayer]);

  const sections = useMemo(() => groupListenHistory(items), [items]);

  return { sections, loading, error, reload };
}
