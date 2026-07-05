import { fetchAllFavorites } from '../api/favorites';
import { loadStoredFavorites, saveStoredFavorites } from '../favoritesStorage';
import { shouldUseMockData } from '../config';
import {
  emptyPlaceState,
  placeStateFromItems,
  placeStateFromLocalIds,
  type FavoritePlacesState,
} from './placeStore';

export interface FavoriteBootstrapResult {
  places: FavoritePlacesState;
  itineraryIds: string[];
  useServer: boolean;
}

export function shouldUseServerFavorites(
  isAuthenticated: boolean,
  isMockSession: boolean,
): boolean {
  return isAuthenticated && !shouldUseMockData(isMockSession);
}

export async function bootstrapFavoritePlaces(
  useServer: boolean,
): Promise<FavoriteBootstrapResult> {
  const stored = await loadStoredFavorites();

  if (!useServer) {
    return {
      places: placeStateFromLocalIds(stored.placeIds),
      itineraryIds: stored.itineraryIds,
      useServer: false,
    };
  }

  try {
    const serverItems = await fetchAllFavorites();
    await saveStoredFavorites({
      placeIds: [],
      itineraryIds: stored.itineraryIds,
    });
    return {
      places: placeStateFromItems(serverItems),
      itineraryIds: stored.itineraryIds,
      useServer: true,
    };
  } catch {
    return {
      places: placeStateFromLocalIds(stored.placeIds),
      itineraryIds: stored.itineraryIds,
      useServer: true,
    };
  }
}

export { emptyPlaceState };
