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
import type { MockPlace } from '../constants/mockPlaces';
import { getPlaceById } from '../constants/mockPlaces';
import { loadStoredFavorites, saveStoredFavorites } from '../lib/favoritesStorage';

interface FavoritesContextValue {
  isReady: boolean;
  favoritePlaceIds: Set<string>;
  favoriteItineraryIds: Set<string>;
  favoritePlaces: MockPlace[];
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
  const [isReady, setIsReady] = useState(false);
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<Set<string>>(new Set());
  const [favoriteItineraryIds, setFavoriteItineraryIds] = useState<Set<string>>(new Set());
  const skipNextPersist = useRef(true);

  useEffect(() => {
    let cancelled = false;

    void loadStoredFavorites().then((stored) => {
      if (cancelled) return;
      setFavoritePlaceIds(new Set(stored.placeIds));
      setFavoriteItineraryIds(new Set(stored.itineraryIds));
      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
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
      const next = new Set(prev);
      if (next.has(placeId)) {
        next.delete(placeId);
      } else {
        next.add(placeId);
      }
      return next;
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
      toUniqueIds([...favoritePlaceIds])
        .map((id) => getPlaceById(id))
        .filter((place): place is MockPlace => place != null),
    [favoritePlaceIds],
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
