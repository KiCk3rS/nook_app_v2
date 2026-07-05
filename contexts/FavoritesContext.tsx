import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { EditorialItinerary } from '../constants/mockItineraries';
import { getItineraryById } from '../constants/mockItineraries';
import { useAuth } from './AuthContext';
import { addFavorite, fetchAllFavorites, removeFavorite } from '../lib/api/favorites';
import {
  applyPlaceToggle,
  favoriteItemsToMap,
  mergeFavoritePlaceIds,
  rollbackPlaceToggle,
  shouldUseServerFavorites,
} from '../lib/favorites/syncFavorites';
import { loadStoredFavorites, saveStoredFavorites } from '../lib/favoritesStorage';
import { resolveFavoritePlaceViews } from '../lib/mappers/favorites';
import type { FavoriteItem } from '../types/api';
import type { FavoritePlaceView } from '../types/favorites';

interface FavoritesContextValue {
  isReady: boolean;
  favoritePlaceIds: Set<string>;
  favoriteItineraryIds: Set<string>;
  favoritePlaces: FavoritePlaceView[];
  favoriteItineraries: EditorialItinerary[];
  isPlaceFavorite: (placeId: string) => boolean;
  isItineraryFavorite: (itineraryId: string) => boolean;
  togglePlaceFavorite: (placeId: string) => void;
  toggleItineraryFavorite: (itineraryId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function toUniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isMockSession, isLoading: isAuthLoading, user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<Set<string>>(new Set());
  const [favoriteItineraryIds, setFavoriteItineraryIds] = useState<Set<string>>(new Set());
  const [apiPlaceItems, setApiPlaceItems] = useState<Map<string, FavoriteItem>>(new Map());
  const skipNextPersist = useRef(true);
  const useServerRef = useRef(false);
  const syncGenerationRef = useRef(0);

  useEffect(() => {
    if (isAuthLoading) return;

    const useServer = shouldUseServerFavorites(isAuthenticated, isMockSession);
    useServerRef.current = useServer;
    const generation = ++syncGenerationRef.current;
    let cancelled = false;

    async function bootstrapLocal(): Promise<void> {
      const stored = await loadStoredFavorites();
      if (cancelled || generation !== syncGenerationRef.current) return;
      setFavoritePlaceIds(new Set(stored.placeIds));
      setFavoriteItineraryIds(new Set(stored.itineraryIds));
      setApiPlaceItems(new Map());
      skipNextPersist.current = true;
      setIsReady(true);
    }

    async function bootstrapServer(): Promise<void> {
      const stored = await loadStoredFavorites();
      if (cancelled || generation !== syncGenerationRef.current) return;

      try {
        const serverItems = await fetchAllFavorites();
        if (cancelled || generation !== syncGenerationRef.current) return;

        const serverIds = serverItems.map((item) => item.poiId);
        const mergedIds = mergeFavoritePlaceIds(serverIds, stored.placeIds);
        setFavoritePlaceIds(new Set(mergedIds));
        setFavoriteItineraryIds(new Set(stored.itineraryIds));
        setApiPlaceItems(favoriteItemsToMap(serverItems));
      } catch {
        if (cancelled || generation !== syncGenerationRef.current) return;
        setFavoritePlaceIds(new Set(stored.placeIds));
        setFavoriteItineraryIds(new Set(stored.itineraryIds));
        setApiPlaceItems(new Map());
      }

      skipNextPersist.current = true;
      setIsReady(true);
    }

    setIsReady(false);
    void (useServer ? bootstrapServer() : bootstrapLocal());

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAuthLoading, isMockSession, user?.id]);

  useEffect(() => {
    if (!isReady || useServerRef.current) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    void saveStoredFavorites({
      placeIds: [...favoritePlaceIds],
      itineraryIds: [...favoriteItineraryIds],
    });
  }, [favoritePlaceIds, favoriteItineraryIds, isReady]);

  const togglePlaceFavorite = useCallback((placeId: string) => {
    setFavoritePlaceIds((prev) => {
      const wasFavorite = prev.has(placeId);
      const adding = !wasFavorite;

      if (useServerRef.current) {
        void (async () => {
          try {
            if (adding) {
              const item = await addFavorite(placeId);
              setApiPlaceItems((items) => {
                const next = new Map(items);
                next.set(placeId, item);
                return next;
              });
            } else {
              await removeFavorite(placeId);
              setApiPlaceItems((items) => {
                const next = new Map(items);
                next.delete(placeId);
                return next;
              });
            }
          } catch {
            setFavoritePlaceIds((current) =>
              rollbackPlaceToggle(current, placeId, wasFavorite),
            );
          }
        })();
      }

      return applyPlaceToggle(prev, placeId, adding);
    });
  }, []);

  const toggleItineraryFavorite = useCallback((itineraryId: string) => {
    setFavoriteItineraryIds((prev) => {
      const next = new Set(prev);
      if (next.has(itineraryId)) {
        next.delete(itineraryId);
      } else {
        next.add(itineraryId);
      }
      return next;
    });
  }, []);

  const isPlaceFavorite = useCallback(
    (placeId: string) => favoritePlaceIds.has(placeId),
    [favoritePlaceIds],
  );

  const isItineraryFavorite = useCallback(
    (itineraryId: string) => favoriteItineraryIds.has(itineraryId),
    [favoriteItineraryIds],
  );

  const favoritePlaces = useMemo(
    () =>
      resolveFavoritePlaceViews(toUniqueIds([...favoritePlaceIds]), apiPlaceItems),
    [apiPlaceItems, favoritePlaceIds],
  );

  const favoriteItineraries = useMemo(
    () =>
      toUniqueIds([...favoriteItineraryIds])
        .map((id) => getItineraryById(id))
        .filter((itinerary): itinerary is EditorialItinerary => itinerary != null),
    [favoriteItineraryIds],
  );

  const value = useMemo(
    () => ({
      isReady,
      favoritePlaceIds,
      favoriteItineraryIds,
      favoritePlaces,
      favoriteItineraries,
      isPlaceFavorite,
      isItineraryFavorite,
      togglePlaceFavorite,
      toggleItineraryFavorite,
    }),
    [
      isReady,
      favoritePlaceIds,
      favoriteItineraryIds,
      favoritePlaces,
      favoriteItineraries,
      isPlaceFavorite,
      isItineraryFavorite,
      togglePlaceFavorite,
      toggleItineraryFavorite,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
