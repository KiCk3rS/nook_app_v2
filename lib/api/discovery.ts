import type { DiscoveryItem, PaginatedResponse } from '../../types/api';
import { apiRequest, buildQuery } from './client';

export interface ListDiscoveryQuery {
  limit?: number;
  offset?: number;
}

export const DISCOVERY_PAGE_SIZE = 10;

export function fetchDiscoveryLatest(
  query: ListDiscoveryQuery = {},
): Promise<PaginatedResponse<DiscoveryItem>> {
  const qs = buildQuery({
    limit: query.limit ?? DISCOVERY_PAGE_SIZE,
    offset: query.offset ?? 0,
  });
  return apiRequest<PaginatedResponse<DiscoveryItem>>(`/discovery/latest?${qs}`);
}

export function fetchDiscoveryPopular(
  query: ListDiscoveryQuery = {},
): Promise<PaginatedResponse<DiscoveryItem>> {
  const qs = buildQuery({
    limit: query.limit ?? DISCOVERY_PAGE_SIZE,
    offset: query.offset ?? 0,
  });
  return apiRequest<PaginatedResponse<DiscoveryItem>>(`/discovery/popular?${qs}`);
}

export function fetchDiscoveryTopRated(
  query: ListDiscoveryQuery = {},
): Promise<PaginatedResponse<DiscoveryItem>> {
  const qs = buildQuery({
    limit: query.limit ?? DISCOVERY_PAGE_SIZE,
    offset: query.offset ?? 0,
  });
  return apiRequest<PaginatedResponse<DiscoveryItem>>(
    `/discovery/top-rated?${qs}`,
  );
}

/** Retourne la query de la page suivante, ou `null` si tout est chargé. */
export function buildDiscoveryLoadMoreQuery(
  page: Pick<PaginatedResponse<unknown>, 'offset' | 'limit' | 'total'>,
): ListDiscoveryQuery | null {
  const nextOffset = page.offset + page.limit;
  if (nextOffset >= page.total) {
    return null;
  }
  return { limit: page.limit, offset: nextOffset };
}
