import type { FavoriteItem, PaginatedResponse } from '../../types/api';
import { apiRequest, buildQuery } from './client';

export interface ListFavoritesQuery {
  limit?: number;
  offset?: number;
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

export function addFavorite(poiId: string): Promise<FavoriteItem> {
  return apiRequest<FavoriteItem>('/me/favorites', {
    method: 'POST',
    auth: true,
    body: { poiId },
  });
}

export function removeFavorite(poiId: string): Promise<void> {
  return apiRequest<void>(`/me/favorites/${poiId}`, {
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
