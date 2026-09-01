import { apiRequest, buildQuery } from './client';

export interface WikipediaSearchItem {
  title: string;
  wikipediaUrl: string;
  description: string | null;
  thumbnailUrl: string | null;
}

export interface WikipediaNearbyItem extends WikipediaSearchItem {
  distanceMeters: number;
  wikiLat: number | null;
  wikiLng: number | null;
}

export interface WikipediaExistingNearbyPoi {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  distanceMeters: number;
}

export interface WikipediaNearbyAnchor {
  lat: number;
  lng: number;
  label: string | null;
  radiusMeters: number;
}

export interface WikipediaSearchResponse {
  items: WikipediaSearchItem[];
}

export interface WikipediaNearbyResponse {
  anchor: WikipediaNearbyAnchor;
  items: WikipediaNearbyItem[];
  existingNearbyPois: WikipediaExistingNearbyPoi[];
}

export interface SearchWikipediaQuery {
  q: string;
  lang?: string;
  limit?: number;
}

export interface SearchWikipediaNearbyQuery {
  lat: number;
  lng: number;
  radiusMeters?: number;
  lang?: string;
  limit?: number;
}

/** `GET /api/v1/admin/wikipedia/search` — JWT ADMIN requis. */
export function searchWikipedia(
  query: SearchWikipediaQuery,
): Promise<WikipediaSearchResponse> {
  const qs = buildQuery({
    q: query.q,
    lang: query.lang,
    limit: query.limit,
  });
  return apiRequest<WikipediaSearchResponse>(`/admin/wikipedia/search?${qs}`, {
    auth: true,
  });
}

/** `GET /api/v1/admin/wikipedia/nearby` — JWT ADMIN requis. */
export function searchWikipediaNearby(
  query: SearchWikipediaNearbyQuery,
): Promise<WikipediaNearbyResponse> {
  const qs = buildQuery({
    lat: query.lat,
    lng: query.lng,
    radiusMeters: query.radiusMeters,
    lang: query.lang,
    limit: query.limit,
  });
  return apiRequest<WikipediaNearbyResponse>(`/admin/wikipedia/nearby?${qs}`, {
    auth: true,
  });
}
