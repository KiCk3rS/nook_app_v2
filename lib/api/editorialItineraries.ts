import type {
  EditorialItinerary,
  EditorialItineraryDetail,
  PaginatedResponse,
} from '../../types/api';
import { isApiConfigured } from '../config';
import {
  getItinerariesByCategory,
  getItineraryById,
} from '../../constants/mockItineraries';
import {
  mapEditorialItineraryDetail,
  mapEditorialItineraryListItem,
} from '../mappers/editorialItineraries';
import { apiRequest, buildQuery } from './client';

export const EDITORIAL_ITINERARIES_DEFAULT_LIMIT = 20;

export interface ListEditorialItinerariesQuery {
  citySlug: string;
  categorySlug?: string;
  districtSlug?: string;
  limit?: number;
  offset?: number;
}

const detailCache = new Map<string, EditorialItineraryDetail>();

function cacheDetail(detail: EditorialItineraryDetail): EditorialItineraryDetail {
  detailCache.set(detail.id, detail);
  if (detail.slug) detailCache.set(detail.slug, detail);
  return detail;
}

function getCached(idOrSlug: string): EditorialItineraryDetail | undefined {
  return detailCache.get(idOrSlug);
}

/** Exposé pour les tests. */
export function clearEditorialItineraryCache(): void {
  detailCache.clear();
}

/** `GET /api/v1/editorial-itineraries` — liste paginée (ville requise). */
export async function fetchEditorialItineraries(
  query: ListEditorialItinerariesQuery,
): Promise<PaginatedResponse<EditorialItinerary>> {
  const citySlug = query.citySlug.trim();
  const qs = buildQuery({
    citySlug,
    categorySlug: query.categorySlug?.trim() || undefined,
    districtSlug: query.districtSlug?.trim() || undefined,
    limit: query.limit ?? EDITORIAL_ITINERARIES_DEFAULT_LIMIT,
    offset: query.offset ?? 0,
  });
  const page = await apiRequest<PaginatedResponse<unknown>>(
    `/editorial-itineraries?${qs}`,
  );
  const items = (page.items ?? [])
    .map(mapEditorialItineraryListItem)
    .filter((item): item is EditorialItinerary => item != null);
  return {
    items,
    total: page.total,
    limit: page.limit,
    offset: page.offset,
  };
}

/** `GET /api/v1/editorial-itineraries/:idOrSlug` — détail + étapes. */
export async function fetchEditorialItinerary(
  idOrSlug: string,
): Promise<EditorialItineraryDetail> {
  const key = idOrSlug.trim();
  const cached = getCached(key);
  if (cached) return cached;

  const raw = await apiRequest<unknown>(
    `/editorial-itineraries/${encodeURIComponent(key)}`,
  );
  const detail = mapEditorialItineraryDetail(raw);
  if (!detail) {
    throw new Error('Réponse itinéraire éditorial invalide.');
  }
  return cacheDetail(detail);
}

/**
 * Résout un itinéraire éditorial (favoris / paywall).
 * Mock si API absente ; sinon fetch + cache mémoire.
 */
export async function resolveEditorialItinerary(
  idOrSlug: string,
  options?: { useMock?: boolean },
): Promise<EditorialItinerary | null> {
  const key = idOrSlug.trim();
  if (!key) return null;

  const useMock = options?.useMock ?? !isApiConfigured();
  if (useMock) {
    return getItineraryById(key) ?? null;
  }

  try {
    return await fetchEditorialItinerary(key);
  } catch {
    return getCached(key) ?? null;
  }
}

/** Liste catégorie : mock offline ou API. */
export async function listEditorialItinerariesByCategory(params: {
  citySlug: string;
  categorySlug: string;
  districtSlug?: string;
  useMock?: boolean;
}): Promise<EditorialItinerary[]> {
  const useMock = params.useMock ?? !isApiConfigured();
  if (useMock) {
    return getItinerariesByCategory(
      params.citySlug,
      params.categorySlug,
      params.districtSlug,
    );
  }
  const page = await fetchEditorialItineraries({
    citySlug: params.citySlug,
    categorySlug: params.categorySlug,
    districtSlug: params.districtSlug,
    limit: 100,
    offset: 0,
  });
  return page.items;
}
