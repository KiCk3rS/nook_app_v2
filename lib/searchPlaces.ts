import {
  getCategoryLabel,
  mockPlaces,
  type MockPlace,
} from '../constants/mockPlaces';
import { getCityBySlug, mockCities, type MockCity } from '../constants/mockCities';
import { isApiConfigured } from './config';
import { searchCities } from './api/cities';
import { fetchPois } from './api/pois';
import {
  citySummaryToCityView,
  mockCityToCityView,
  type CityView,
} from './mappers/cities';
import {
  mockPlaceToPreview,
  poiSummaryToMockPlaceSummary,
} from './mappers/poi';
import type { CataloguePlacePreview } from '../types/catalogue';
import type { CitySummary, PoiSummary } from '../types/api';

export interface SearchPlaceResult {
  place: MockPlace;
  subtitle: string | null;
}

export interface SearchCatalogueResult {
  place: CataloguePlacePreview;
  subtitle: string | null;
}

export interface SearchCityResult {
  city: CityView;
  subtitle: string | null;
}

export type SearchResult =
  | { type: 'place'; place: MockPlace; subtitle: string | null }
  | { type: 'city'; city: CityView; subtitle: string | null };

type MatchTier = 0 | 1 | 2 | 3;

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

function getPlaceMatchTier(place: MockPlace, query: string): MatchTier | null {
  const q = normalize(query);
  if (!q) return null;

  const name = normalize(place.name);
  if (name.startsWith(q)) return 0;
  if (name.includes(q)) return 1;

  const haystack = [
    place.address,
    place.description,
    getCategoryLabel(place.categoryId),
  ]
    .map(normalize)
    .join(' ');

  if (haystack.includes(q)) return 2;
  return null;
}

function getCityMatchTier(city: MockCity, query: string): MatchTier | null {
  const q = normalize(query);
  if (!q) return null;

  const name = normalize(city.name);
  if (name.startsWith(q)) return 0;
  if (name.includes(q)) return 1;
  if (normalize(city.slug).includes(q)) return 2;
  return null;
}

function buildPlaceSubtitle(place: MockPlace, query: string): string | null {
  const q = normalize(query);
  const name = normalize(place.name);
  if (name.includes(q)) return null;

  const description = place.description.trim();
  if (!description) return null;

  const maxLen = 72;
  if (description.length <= maxLen) return description;
  return `${description.slice(0, maxLen - 1).trim()}…`;
}

function buildApiPlaceSubtitle(
  title: string,
  categories: { label: string }[],
  query: string,
): string | null {
  const q = normalize(query);
  const name = normalize(title);
  if (name.includes(q)) return null;
  const labels = categories.map((c) => c.label).filter(Boolean);
  return labels.length > 0 ? labels.join(' · ') : null;
}

function toCitySearchResult(city: CityView): SearchResult {
  return {
    type: 'city',
    city,
    subtitle: city.subtitle || null,
  };
}

function citySummariesToResults(items: CitySummary[]): SearchResult[] {
  return items.map((item) => toCitySearchResult(citySummaryToCityView(item)));
}

function poiSummariesToResults(
  items: PoiSummary[],
  query: string,
): SearchResult[] {
  return items.map((poi) => ({
    type: 'place' as const,
    place: poiSummaryToMockPlaceSummary(poi),
    subtitle: buildApiPlaceSubtitle(poi.title, poi.categories, query),
  }));
}

/** Villes mock classées pour une query (fallback offline / erreur API). */
function localCityResults(query: string): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return mockCities
    .map((city) => {
      const tier = getCityMatchTier(city, trimmed);
      return tier === null ? null : { city, tier };
    })
    .filter(
      (entry): entry is { city: MockCity; tier: MatchTier } => entry !== null,
    )
    .map((entry) => toCitySearchResult(mockCityToCityView(entry.city)));
}

function localPlaceResults(query: string): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return mockPlaces
    .map((place) => {
      const tier = getPlaceMatchTier(place, trimmed);
      return tier === null ? null : { place, tier };
    })
    .filter(
      (entry): entry is { place: MockPlace; tier: MatchTier } => entry !== null,
    )
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.place.id.localeCompare(b.place.id, undefined, { numeric: true });
    })
    .map(({ place }) => ({
      type: 'place' as const,
      place,
      subtitle: buildPlaceSubtitle(place, trimmed),
    }));
}

/**
 * Recherche locale POI — conservée pour compatibilité mock.
 */
export function searchPlaces(query: string): SearchPlaceResult[] {
  return searchAllLocal(query)
    .filter((r): r is Extract<SearchResult, { type: 'place' }> => r.type === 'place')
    .map(({ place, subtitle }) => ({ place, subtitle }));
}

/**
 * Recherche locale POI + villes (mode mock).
 */
export function searchAllLocal(query: string): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const placeRanked = mockPlaces
    .map((place) => {
      const tier = getPlaceMatchTier(place, trimmed);
      return tier === null ? null : { type: 'place' as const, place, tier };
    })
    .filter(
      (entry): entry is { type: 'place'; place: MockPlace; tier: MatchTier } =>
        entry !== null,
    );

  const cityRanked = mockCities
    .map((city) => {
      const tier = getCityMatchTier(city, trimmed);
      return tier === null ? null : { type: 'city' as const, city, tier };
    })
    .filter(
      (entry): entry is { type: 'city'; city: MockCity; tier: MatchTier } =>
        entry !== null,
    );

  const merged = [...cityRanked, ...placeRanked].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.type !== b.type) return a.type === 'city' ? -1 : 1;
    const idA = a.type === 'city' ? a.city.id : a.place.id;
    const idB = b.type === 'city' ? b.city.id : b.place.id;
    return idA.localeCompare(idB, undefined, { numeric: true });
  });

  return merged.map((entry) => {
    if (entry.type === 'city') {
      return toCitySearchResult(mockCityToCityView(entry.city));
    }
    return {
      type: 'place' as const,
      place: entry.place,
      subtitle: buildPlaceSubtitle(entry.place, trimmed),
    };
  });
}

/** @deprecated Utiliser `searchAllLocal` ou `searchAllAsync`. */
export function searchAll(query: string): SearchResult[] {
  return searchAllLocal(query);
}

/**
 * Recherche hybride : villes + POI via API si configurée.
 * Chaque source a son fallback indépendant ; mock complet seulement si les deux échouent
 * ou si l’API n’est pas configurée.
 */
export async function searchAllAsync(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (!isApiConfigured()) {
    return searchAllLocal(trimmed);
  }

  const [citiesOutcome, poisOutcome] = await Promise.allSettled([
    searchCities(trimmed),
    fetchPois({
      q: trimmed,
      sort: 'relevance',
      limit: 50,
    }),
  ]);

  if (
    citiesOutcome.status === 'rejected' &&
    poisOutcome.status === 'rejected'
  ) {
    return searchAllLocal(trimmed);
  }

  const cityResults =
    citiesOutcome.status === 'fulfilled'
      ? citySummariesToResults(citiesOutcome.value)
      : localCityResults(trimmed);

  const placeResults =
    poisOutcome.status === 'fulfilled'
      ? poiSummariesToResults(poisOutcome.value.items, trimmed)
      : localPlaceResults(trimmed);

  return [...cityResults, ...placeResults];
}

/** Convertit un résultat mock en preview catalogue (tests / UI). */
export function searchResultToPreview(result: SearchPlaceResult): SearchCatalogueResult {
  return {
    place: mockPlaceToPreview(result.place),
    subtitle: result.subtitle,
  };
}

export { getCityBySlug };
