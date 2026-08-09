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

import type { EditorialItinerary } from '../types/api';
import { useAuth } from './AuthContext';
import { bootstrapFavoritePlaces, shouldUseServerFavorites } from '../lib/favorites/bootstrapFavorites';
import {
  createOptimisticItineraryItem,
  emptyItineraryState,
  isItineraryInState,
  setItineraryFavoriteInState,
  type FavoriteItinerariesState,
} from '../lib/favorites/itineraryStore';
import {
  createOptimisticPlaceItem,
  emptyPlaceState,
  isPlaceInState,
  setPlaceFavoriteInState,
  type FavoritePlacesState,
} from '../lib/favorites/placeStore';
import { shouldApplyToggleResult } from '../lib/favorites/syncFavorites';
import { syncItineraryFavoriteWithServer } from '../lib/favorites/syncItineraryFavorite';
import { syncPlaceFavoriteWithServer } from '../lib/favorites/syncPlaceFavorite';
import { saveStoredFavorites } from '../lib/favoritesStorage';
import {
  resolveFavoriteItineraries,
  resolveFavoritePlaceViews,
} from '../lib/mappers/favorites';
import type { FavoriteEditorialItineraryItem, FavoritePoiItem } from '../types/api';
import type {
  FavoritePlaceView,
  ItineraryFavoriteHint,
  PlaceFavoriteHint,
} from '../types/favorites';

interface FavoritesContextValue {
  isReady: boolean;
  favoritePlaceIds: Set<string>;
  favoriteItineraryIds: Set<string>;
  favoritePlaces: FavoritePlaceView[];
  favoriteItineraries: EditorialItinerary[];
  isPlaceFavorite: (placeId: string) => boolean;
  isItineraryFavorite: (itineraryId: string) => boolean;
  togglePlaceFavorite: (placeId: string, hint?: PlaceFavoriteHint) => void;
  toggleItineraryFavorite: (
    itineraryId: string,
    hint?: ItineraryFavoriteHint,
  ) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isMockSession, isLoading: isAuthLoading, user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [placeState, setPlaceState] = useState<FavoritePlacesState>(emptyPlaceState);
  const [itineraryState, setItineraryState] =
    useState<FavoriteItinerariesState>(emptyItineraryState);
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
      setItineraryState(result.itineraries);
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
      itineraryIds: itineraryState.order,
    });
  }, [itineraryState.order, isReady, placeState.order]);

  const togglePlaceFavorite = useCallback((placeId: string, hint?: PlaceFavoriteHint) => {
    const generation = (toggleGenerationRef.current.get(placeId) ?? 0) + 1;
    toggleGenerationRef.current.set(placeId, generation);

    let wasFavorite = false;
    let adding = false;
    let previousItem: FavoritePoiItem | undefined;

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

  const toggleItineraryFavorite = useCallback(
    (itineraryId: string, hint?: ItineraryFavoriteHint) => {
      const generationKey = `itin:${itineraryId}`;
      const generation = (toggleGenerationRef.current.get(generationKey) ?? 0) + 1;
      toggleGenerationRef.current.set(generationKey, generation);

      let wasFavorite = false;
      let adding = false;
      let previousItem: FavoriteEditorialItineraryItem | undefined;

      setItineraryState((prev) => {
        wasFavorite = isItineraryInState(prev, itineraryId);
        adding = !wasFavorite;
        previousItem = prev.items.get(itineraryId);
        return setItineraryFavoriteInState(
          prev,
          itineraryId,
          adding,
          adding ? createOptimisticItineraryItem(itineraryId, hint) : undefined,
        );
      });

      if (!useServerRef.current) return;

      void syncItineraryFavoriteWithServer(itineraryId, adding).then((result) => {
        if (
          !shouldApplyToggleResult(toggleGenerationRef.current.get(generationKey), generation)
        ) {
          return;
        }

        if (!result.success) {
          setItineraryState((current) =>
            setItineraryFavoriteInState(current, itineraryId, wasFavorite, previousItem),
          );
          return;
        }

        if (result.item) {
          setItineraryState((current) =>
            setItineraryFavoriteInState(current, itineraryId, true, result.item ?? undefined),
          );
        }
      });
    },
    [],
  );

  const favoritePlaceIds = useMemo(() => new Set(placeState.order), [placeState.order]);
  const favoriteItineraryIds = useMemo(
    () => new Set(itineraryState.order),
    [itineraryState.order],
  );

  const isPlaceFavorite = useCallback(
    (placeId: string) => placeState.order.includes(placeId),
    [placeState.order],
  );

  const isItineraryFavorite = useCallback(
    (itineraryId: string) => itineraryState.order.includes(itineraryId),
    [itineraryState.order],
  );

  const favoritePlaces = useMemo(
    () => resolveFavoritePlaceViews(placeState),
    [placeState],
  );

  const favoriteItineraries = useMemo(
    () => resolveFavoriteItineraries(itineraryState),
    [itineraryState],
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
