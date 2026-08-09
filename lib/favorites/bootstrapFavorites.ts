import { fetchAllFavorites, partitionFavoriteItems } from '../api/favorites';
import { loadStoredFavorites, saveStoredFavorites } from '../favoritesStorage';
import { shouldUseMockData } from '../config';
import {
  emptyItineraryState,
  itineraryStateFromItems,
  itineraryStateFromLocalIds,
  type FavoriteItinerariesState,
} from './itineraryStore';
import {
  emptyPlaceState,
  placeStateFromItems,
  placeStateFromLocalIds,
  type FavoritePlacesState,
} from './placeStore';

export interface FavoriteBootstrapResult {
  places: FavoritePlacesState;
  itineraries: FavoriteItinerariesState;
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
      itineraries: itineraryStateFromLocalIds(stored.itineraryIds),
      useServer: false,
    };
  }

  try {
    const serverItems = await fetchAllFavorites();
    const { places, editorials } = partitionFavoriteItems(serverItems);
    await saveStoredFavorites({
      placeIds: [],
      itineraryIds: [],
    });
    return {
      places: placeStateFromItems(places),
      itineraries: itineraryStateFromItems(editorials),
      useServer: true,
    };
  } catch {
    return {
      places: placeStateFromLocalIds(stored.placeIds),
      itineraries: itineraryStateFromLocalIds(stored.itineraryIds),
      useServer: true,
    };
  }
}

export { emptyItineraryState, emptyPlaceState };
