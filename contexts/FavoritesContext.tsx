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
import { bootstrapFavoritePlaces, shouldUseServerFavorites } from '../lib/favorites/bootstrapFavorites';
import {
  createOptimisticPlaceItem,
  emptyPlaceState,
  isPlaceInState,
  setPlaceFavoriteInState,
  type FavoritePlacesState,
} from '../lib/favorites/placeStore';
import {
  shouldApplyToggleResult,
  syncPlaceFavoriteWithServer,
} from '../lib/favorites/syncPlaceFavorite';
import { saveStoredFavorites } from '../lib/favoritesStorage';
import { resolveFavoritePlaceViews } from '../lib/mappers/favorites';
import type { FavoriteItem } from '../types/api';
import type { FavoritePlaceView, PlaceFavoriteHint } from '../types/favorites';

interface FavoritesContextValue {
  isReady: boolean;
  favoritePlaceIds: Set<string>;
  favoriteItineraryIds: Set<string>;
  favoritePlaces: FavoritePlaceView[];
  favoriteItineraries: EditorialItinerary[];
  isPlaceFavorite: (placeId: string) => boolean;
  isItineraryFavorite: (itineraryId: string) => boolean;
  togglePlaceFavorite: (placeId: string, hint?: PlaceFavoriteHint) => void;
  toggleItineraryFavorite: (itineraryId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function toUniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isMockSession, isLoading: isAuthLoading, user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [placeState, setPlaceState] = useState<FavoritePlacesState>(emptyPlaceState);
  const [favoriteItineraryIds, setFavoriteItineraryIds] = useState<Set<string>>(new Set());
  const skipNextPersist = useRef(true);
  const useServerRef = useRef(false);
  const bootstrapGenerationRef = useRef(0);
  const toggleGenerationRef = useRef(new Map<string, number>());

  useEffect(() => {
    if (isAuthLoading) return;

    const useServer = shouldUseServerFavorites(isAuthenticated, isMockSession);
    useServerRef.current = useServer;
    const generation = ++bootstrapGenerationRef.current;
    let cancelled = false;

    async function runBootstrap() {
      setIsReady(false);
      const result = await bootstrapFavoritePlaces(useServer);
      if (cancelled || generation !== bootstrapGenerationRef.current) return;

      useServerRef.current = result.useServer;
      setPlaceState(result.places);
      setFavoriteItineraryIds(new Set(result.itineraryIds));
      skipNextPersist.current = true;
      setIsReady(true);
    }

    void runBootstrap();

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
      placeIds: placeState.order,
      itineraryIds: [...favoriteItineraryIds],
    });
  }, [favoriteItineraryIds, isReady, placeState.order]);

  const togglePlaceFavorite = useCallback((placeId: string, hint?: PlaceFavoriteHint) => {
    const generation = (toggleGenerationRef.current.get(placeId) ?? 0) + 1;
    toggleGenerationRef.current.set(placeId, generation);

    let wasFavorite = false;
    let adding = false;
    let previousItem: FavoriteItem | undefined;

    setPlaceState((prev) => {
      wasFavorite = isPlaceInState(prev, placeId);
      adding = !wasFavorite;
      previousItem = prev.items.get(placeId);
      return setPlaceFavoriteInState(
        prev,
        placeId,
        adding,
        adding ? createOptimisticPlaceItem(placeId, hint) : undefined,
      );
    });

    if (!useServerRef.current) return;

    void syncPlaceFavoriteWithServer(placeId, adding).then((result) => {
      if (!shouldApplyToggleResult(toggleGenerationRef.current.get(placeId), generation)) {
        return;
      }

      if (!result.success) {
        setPlaceState((current) =>
          setPlaceFavoriteInState(current, placeId, wasFavorite, previousItem),
        );
        return;
      }

      if (result.item) {
        setPlaceState((current) =>
          setPlaceFavoriteInState(current, placeId, true, result.item ?? undefined),
        );
      }
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

  const favoritePlaceIds = useMemo(() => new Set(placeState.order), [placeState.order]);

  const isPlaceFavorite = useCallback(
    (placeId: string) => placeState.order.includes(placeId),
    [placeState.order],
  );

  const isItineraryFavorite = useCallback(
    (itineraryId: string) => favoriteItineraryIds.has(itineraryId),
    [favoriteItineraryIds],
  );

  const favoritePlaces = useMemo(
    () => resolveFavoritePlaceViews(placeState),
    [placeState],
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
