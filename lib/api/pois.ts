import type {
  PaginatedResponse,
  PoiDetail,
  PoiSummary,
} from '../../types/api';
import { ApiError } from '../../types/api';
import { apiRequest, buildQuery } from './client';

export type PoiListSort = 'relevance' | 'distance' | 'rating' | 'title';
export type PoiChildrenSort = 'title' | 'updatedAt';

export interface ListPoisQuery {
  q?: string;
  bbox?: string;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  category?: string;
  minRating?: number;
  maxAudioDurationMinutes?: number;
  sort?: PoiListSort;
  rootsOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface FetchPoiByIdOptions {
  includeAudios?: boolean;
}

export interface ListPoiChildrenQuery {
  sort?: PoiChildrenSort;
  limit?: number;
  offset?: number;
}

const MISSING_FILTER_MESSAGE =
  'Fournir `q` ou un filtre géographique : bbox ou lat, lng et radiusMeters.';

/** Garde locale : ne pas appeler l'API sans filtre géo/recherche (422 côté serveur). */
export function hasValidPoisListFilter(query: ListPoisQuery): boolean {
  const hasQ = (query.q?.trim().length ?? 0) > 0;
  const hasBbox = (query.bbox?.trim().length ?? 0) > 0;
  const hasRadius =
    query.lat != null && query.lng != null && query.radiusMeters != null;
  return hasQ || hasBbox || hasRadius;
}

export function fetchPois(
  query: ListPoisQuery,
): Promise<PaginatedResponse<PoiSummary>> {
  if (!hasValidPoisListFilter(query)) {
    throw new ApiError(MISSING_FILTER_MESSAGE, 422);
  }

  const qs = buildQuery({
    q: query.q,
    bbox: query.bbox,
    lat: query.lat,
    lng: query.lng,
    radiusMeters: query.radiusMeters,
    category: query.category,
    minRating: query.minRating,
    maxAudioDurationMinutes: query.maxAudioDurationMinutes,
    sort: query.sort,
    rootsOnly: query.rootsOnly,
    limit: query.limit,
    offset: query.offset,
  });

  return apiRequest<PaginatedResponse<PoiSummary>>(`/pois?${qs}`);
}

export function fetchPoiById(
  id: string,
  options: FetchPoiByIdOptions = {},
): Promise<PoiDetail> {
  const includeAudios = options.includeAudios ?? true;
  const qs = buildQuery({ includeAudios });
  const suffix = qs ? `?${qs}` : '';
  return apiRequest<PoiDetail>(`/pois/${encodeURIComponent(id)}${suffix}`);
}

export function fetchPoiChildren(
  id: string,
  query: ListPoiChildrenQuery = {},
): Promise<PaginatedResponse<PoiSummary>> {
  const qs = buildQuery({
    sort: query.sort,
    limit: query.limit,
    offset: query.offset,
  });
  const suffix = qs ? `?${qs}` : '';
  return apiRequest<PaginatedResponse<PoiSummary>>(
    `/pois/${encodeURIComponent(id)}/children${suffix}`,
  );
}
