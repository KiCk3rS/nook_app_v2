import { getItineraryById } from '../../constants/mockItineraries';
import type { FavoriteEditorialItineraryItem } from '../../types/api';
import type { ItineraryFavoriteHint } from '../../types/favorites';

/** État unifié des itinéraires éditoriaux favoris (local ou serveur). */
export interface FavoriteItinerariesState {
  order: string[];
  items: Map<string, FavoriteEditorialItineraryItem>;
}

export function emptyItineraryState(): FavoriteItinerariesState {
  return { order: [], items: new Map() };
}

export function itineraryStateFromItems(
  items: readonly FavoriteEditorialItineraryItem[],
): FavoriteItinerariesState {
  const map = new Map<string, FavoriteEditorialItineraryItem>();
  const order: string[] = [];
  for (const item of items) {
    if (map.has(item.id)) continue;
    map.set(item.id, item);
    order.push(item.id);
  }
  return { order, items: map };
}

export function itineraryStateFromLocalIds(
  itineraryIds: readonly string[],
): FavoriteItinerariesState {
  return {
    order: [...new Set(itineraryIds)],
    items: new Map(),
  };
}

export function isItineraryInState(
  state: FavoriteItinerariesState,
  itineraryId: string,
): boolean {
  return state.order.includes(itineraryId);
}

export function setItineraryFavoriteInState(
  state: FavoriteItinerariesState,
  itineraryId: string,
  favorite: boolean,
  item?: FavoriteEditorialItineraryItem,
): FavoriteItinerariesState {
  const order = [...state.order];
  const items = new Map(state.items);

  if (favorite) {
    if (!order.includes(itineraryId)) {
      order.push(itineraryId);
    }
    if (item) {
      items.set(itineraryId, item);
    }
  } else {
    const index = order.indexOf(itineraryId);
    if (index >= 0) {
      order.splice(index, 1);
    }
    items.delete(itineraryId);
  }

  return { order, items };
}

/** Stub affichable le temps de la requête POST (hint ou mock si id===slug démo). */
export function createOptimisticItineraryItem(
  itineraryId: string,
  hint?: ItineraryFavoriteHint,
): FavoriteEditorialItineraryItem {
  const mock = getItineraryById(itineraryId);
  const title = hint?.title?.trim() || mock?.title || '';
  const slug = hint?.slug?.trim() || mock?.slug || itineraryId;
  const coverImageUrl =
    hint?.coverImageUrl !== undefined
      ? hint.coverImageUrl
      : (mock?.coverImageUrl ?? null);

  return {
    targetType: 'editorial_itinerary',
    id: itineraryId,
    createdAt: new Date().toISOString(),
    target: {
      id: itineraryId,
      slug,
      title,
      coverImageUrl,
    },
  };
}
