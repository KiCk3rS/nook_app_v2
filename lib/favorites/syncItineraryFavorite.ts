import {
  addEditorialItineraryFavorite,
  removeFavorite,
} from '../api/favorites';
import type { FavoriteEditorialItineraryItem } from '../../types/api';
import { shouldApplyToggleResult } from './syncFavorites';

export type ItineraryFavoriteSyncResult =
  | { success: true; item: FavoriteEditorialItineraryItem | null }
  | { success: false };

export interface ItineraryFavoriteSyncApi {
  addEditorialItineraryFavorite: (
    editorialItineraryId: string,
  ) => Promise<FavoriteEditorialItineraryItem>;
  removeFavorite: (targetId: string) => Promise<void>;
}

const defaultApi: ItineraryFavoriteSyncApi = {
  addEditorialItineraryFavorite,
  removeFavorite: (targetId) => removeFavorite('editorial_itinerary', targetId),
};

export async function syncItineraryFavoriteWithServer(
  editorialItineraryId: string,
  adding: boolean,
  api: ItineraryFavoriteSyncApi = defaultApi,
): Promise<ItineraryFavoriteSyncResult> {
  try {
    if (adding) {
      const item = await api.addEditorialItineraryFavorite(editorialItineraryId);
      return { success: true, item };
    }
    await api.removeFavorite(editorialItineraryId);
    return { success: true, item: null };
  } catch {
    return { success: false };
  }
}

export { shouldApplyToggleResult };
