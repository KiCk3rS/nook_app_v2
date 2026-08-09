import type {
  FavoriteEditorialItineraryItem,
  FavoriteItem,
  FavoritePoiItem,
  FavoriteTargetType,
  PaginatedResponse,
} from '../../types/api';
import { apiRequest, buildQuery } from './client';

export interface ListFavoritesQuery {
  limit?: number;
  offset?: number;
}

export function isFavoritePoiItem(item: FavoriteItem): item is FavoritePoiItem {
  return item.targetType === 'poi';
}

export function isFavoriteEditorialItineraryItem(
  item: FavoriteItem,
): item is FavoriteEditorialItineraryItem {
  return item.targetType === 'editorial_itinerary';
}

export function fetchFavorites(
  query: ListFavoritesQuery = {},
): Promise<PaginatedResponse<FavoriteItem>> {
  const qs = buildQuery({
    limit: query.limit,
    offset: query.offset,
  });
  const suffix = qs ? `?${qs}` : '';
  return apiRequest<PaginatedResponse<FavoriteItem>>(`/me/favorites${suffix}`, {
    auth: true,
  });
}

export function addFavorite(poiId: string): Promise<FavoritePoiItem> {
  return apiRequest<FavoritePoiItem>('/me/favorites', {
    method: 'POST',
    auth: true,
    body: { targetType: 'poi', targetId: poiId },
  });
}

export function addEditorialItineraryFavorite(
  editorialItineraryId: string,
): Promise<FavoriteEditorialItineraryItem> {
  return apiRequest<FavoriteEditorialItineraryItem>('/me/favorites', {
    method: 'POST',
    auth: true,
    body: { targetType: 'editorial_itinerary', targetId: editorialItineraryId },
  });
}

/** DELETE `/me/favorites/:targetType/:targetId`. */
export function removeFavorite(
  targetType: FavoriteTargetType,
  targetId: string,
): Promise<void> {
  return apiRequest<void>(`/me/favorites/${targetType}/${targetId}`, {
    method: 'DELETE',
    auth: true,
  });
}

/** Récupère toutes les pages (max 100 items/page côté API). */
export async function fetchAllFavorites(): Promise<FavoriteItem[]> {
  const items: FavoriteItem[] = [];
  let offset = 0;
  const limit = 100;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const page = await fetchFavorites({ limit, offset });
    items.push(...page.items);
    total = page.total;
    offset += page.items.length;
    if (page.items.length === 0) break;
  }

  return items;
}

export function partitionFavoriteItems(items: readonly FavoriteItem[]): {
  places: FavoritePoiItem[];
  editorials: FavoriteEditorialItineraryItem[];
} {
  const places: FavoritePoiItem[] = [];
  const editorials: FavoriteEditorialItineraryItem[] = [];

  for (const item of items) {
    if (isFavoriteEditorialItineraryItem(item)) {
      editorials.push(item);
    } else if (isFavoritePoiItem(item)) {
      places.push(item);
    }
  }

  return { places, editorials };
}
