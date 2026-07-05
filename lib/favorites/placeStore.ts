import type { FavoriteItem } from '../../types/api';

/** État unifié des lieux favoris (local ou serveur). */
export interface FavoritePlacesState {
  order: string[];
  items: Map<string, FavoriteItem>;
}

export function emptyPlaceState(): FavoritePlacesState {
  return { order: [], items: new Map() };
}

export function placeStateFromItems(items: readonly FavoriteItem[]): FavoritePlacesState {
  const map = new Map<string, FavoriteItem>();
  const order: string[] = [];
  for (const item of items) {
    if (map.has(item.poiId)) continue;
    map.set(item.poiId, item);
    order.push(item.poiId);
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
  item?: FavoriteItem,
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

/** Stub affichable le temps de la requête POST (enrichi via mock si disponible). */
export function createOptimisticPlaceItem(poiId: string): FavoriteItem {
  return {
    id: '',
    poiId,
    createdAt: new Date().toISOString(),
    poi: { title: '', status: 'PUBLISHED' },
  };
}
