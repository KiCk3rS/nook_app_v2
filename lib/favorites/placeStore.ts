import { getPlaceById } from '../../constants/mockPlaces';
import type { FavoritePoiItem } from '../../types/api';
import type { PlaceFavoriteHint } from '../../types/favorites';

/** État unifié des lieux favoris (local ou serveur). */
export interface FavoritePlacesState {
  order: string[];
  items: Map<string, FavoritePoiItem>;
}

export function emptyPlaceState(): FavoritePlacesState {
  return { order: [], items: new Map() };
}

export function placeStateFromItems(items: readonly FavoritePoiItem[]): FavoritePlacesState {
  const map = new Map<string, FavoritePoiItem>();
  const order: string[] = [];
  for (const item of items) {
    if (map.has(item.id)) continue;
    map.set(item.id, item);
    order.push(item.id);
  }
  return { order, items: map };
}

export function placeStateFromLocalIds(placeIds: readonly string[]): FavoritePlacesState {
  return {
    order: [...new Set(placeIds)],
    items: new Map(),
  };
}

export function isPlaceInState(state: FavoritePlacesState, poiId: string): boolean {
  return state.order.includes(poiId);
}

export function setPlaceFavoriteInState(
  state: FavoritePlacesState,
  poiId: string,
  favorite: boolean,
  item?: FavoritePoiItem,
): FavoritePlacesState {
  const order = [...state.order];
  const items = new Map(state.items);

  if (favorite) {
    if (!order.includes(poiId)) {
      order.push(poiId);
    }
    if (item) {
      items.set(poiId, item);
    }
  } else {
    const index = order.indexOf(poiId);
    if (index >= 0) {
      order.splice(index, 1);
    }
    items.delete(poiId);
  }

  return { order, items };
}

/** Stub affichable le temps de la requête POST (enrichi via hint ou mock si disponible). */
export function createOptimisticPlaceItem(
  poiId: string,
  hint?: PlaceFavoriteHint,
): FavoritePoiItem {
  const mock = getPlaceById(poiId);
  const title = hint?.title?.trim() || mock?.name || '';

  return {
    targetType: 'poi',
    id: poiId,
    createdAt: new Date().toISOString(),
    target: { id: poiId, title, status: 'PUBLISHED' },
  };
}
