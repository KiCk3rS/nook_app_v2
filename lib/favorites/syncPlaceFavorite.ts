import { addFavorite, removeFavorite } from '../api/favorites';
import type { FavoriteItem } from '../../types/api';

export type PlaceFavoriteSyncResult =
  | { success: true; item: FavoriteItem | null }
  | { success: false };

export interface PlaceFavoriteSyncApi {
  addFavorite: (poiId: string) => Promise<FavoriteItem>;
  removeFavorite: (poiId: string) => Promise<void>;
}

const defaultApi: PlaceFavoriteSyncApi = { addFavorite, removeFavorite };

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

/** Ignore le résultat si une bascule plus récente a été lancée pour ce POI. */
export function shouldApplyToggleResult(
  currentGeneration: number | undefined,
  expectedGeneration: number,
): boolean {
  return currentGeneration === expectedGeneration;
}
