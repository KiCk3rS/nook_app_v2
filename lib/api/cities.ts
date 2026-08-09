import type { CitySummary, PaginatedResponse } from '../../types/api';
import { apiRequest, buildQuery } from './client';

export interface ListCitiesQuery {
  q?: string;
  promoted?: boolean;
  popular?: boolean;
  limit?: number;
  offset?: number;
}

export const CITIES_DEFAULT_LIMIT = 20;
export const PROMOTED_CITIES_LIMIT = 5;
export const POPULAR_CITIES_LIMIT = 10;
export const SEARCH_CITIES_LIMIT = 20;

/** `GET /api/v1/cities` — liste, filtres promu/populaire, recherche `q`. */
export function fetchCities(
  query: ListCitiesQuery = {},
): Promise<PaginatedResponse<CitySummary>> {
  const qs = buildQuery({
    q: query.q,
    promoted: query.promoted,
    popular: query.popular,
    limit: query.limit ?? CITIES_DEFAULT_LIMIT,
    offset: query.offset ?? 0,
  });
  return apiRequest<PaginatedResponse<CitySummary>>(`/cities?${qs}`);
}

export async function fetchPromotedCities(
  limit: number = PROMOTED_CITIES_LIMIT,
): Promise<CitySummary[]> {
  const { items } = await fetchCities({ promoted: true, limit, offset: 0 });
  return items;
}

export async function fetchPopularCities(
  limit: number = POPULAR_CITIES_LIMIT,
): Promise<CitySummary[]> {
  const { items } = await fetchCities({ popular: true, limit, offset: 0 });
  return items;
}

/** Recherche villes par nom/slug (`q`). */
export async function searchCities(
  q: string,
  limit: number = SEARCH_CITIES_LIMIT,
): Promise<CitySummary[]> {
  const trimmed = q.trim();
  if (!trimmed) return [];
  const { items } = await fetchCities({ q: trimmed, limit, offset: 0 });
  return items;
}
