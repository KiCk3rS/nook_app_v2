import { addFavorite, removeFavorite } from '../api/favorites';
import type { FavoritePoiItem } from '../../types/api';
import { shouldApplyToggleResult } from './syncFavorites';

export type PlaceFavoriteSyncResult =
  | { success: true; item: FavoritePoiItem | null }
  | { success: false };

export interface PlaceFavoriteSyncApi {
  addFavorite: (poiId: string) => Promise<FavoritePoiItem>;
  removeFavorite: (poiId: string) => Promise<void>;
}

const defaultApi: PlaceFavoriteSyncApi = {
  addFavorite,
  removeFavorite: (poiId) => removeFavorite('poi', poiId),
};

export async function syncPlaceFavoriteWithServer(
  poiId: string,
  adding: boolean,
  api: PlaceFavoriteSyncApi = defaultApi,
): Promise<PlaceFavoriteSyncResult> {
  try {
    if (adding) {
      const item = await api.addFavorite(poiId);
      return { success: true, item };
    }
    await api.removeFavorite(poiId);
    return { success: true, item: null };
  } catch {
    return { success: false };
  }
}

export { shouldApplyToggleResult };
