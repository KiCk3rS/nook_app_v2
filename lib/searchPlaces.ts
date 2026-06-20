import {
  getCategoryLabel,
  mockPlaces,
  type MockPlace,
} from '../constants/mockPlaces';
import { getCityBySlug, mockCities, type MockCity } from '../constants/mockCities';

export interface SearchPlaceResult {
  place: MockPlace;
  subtitle: string | null;
}

export interface SearchCityResult {
  city: MockCity;
  subtitle: string | null;
}

export type SearchResult =
  | { type: 'place'; place: MockPlace; subtitle: string | null }
  | { type: 'city'; city: MockCity; subtitle: string | null };

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

/**
 * Recherche locale POI — conservée pour compatibilité.
 */
export function searchPlaces(query: string): SearchPlaceResult[] {
  return searchAll(query)
    .filter((r): r is Extract<SearchResult, { type: 'place' }> => r.type === 'place')
    .map(({ place, subtitle }) => ({ place, subtitle }));
}

/**
 * Recherche locale POI + villes.
 * Tri : tier ascendant ; villes avant POI à tier égal ; id ascendant.
 */
export function searchAll(query: string): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const placeRanked = mockPlaces
    .map((place) => {
      const tier = getPlaceMatchTier(place, trimmed);
      return tier === null ? null : { type: 'place' as const, place, tier };
    })
    .filter((entry): entry is { type: 'place'; place: MockPlace; tier: MatchTier } => entry !== null);

  const cityRanked = mockCities
    .map((city) => {
      const tier = getCityMatchTier(city, trimmed);
      return tier === null ? null : { type: 'city' as const, city, tier };
    })
    .filter((entry): entry is { type: 'city'; city: MockCity; tier: MatchTier } => entry !== null);

  const merged = [...cityRanked, ...placeRanked].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.type !== b.type) return a.type === 'city' ? -1 : 1;
    const idA = a.type === 'city' ? a.city.id : a.place.id;
    const idB = b.type === 'city' ? b.city.id : b.place.id;
    return idA.localeCompare(idB, undefined, { numeric: true });
  });

  return merged.map((entry) => {
    if (entry.type === 'city') {
      return {
        type: 'city' as const,
        city: entry.city,
        subtitle: entry.city.subtitle,
      };
    }
    return {
      type: 'place' as const,
      place: entry.place,
      subtitle: buildPlaceSubtitle(entry.place, trimmed),
    };
  });
}

export { getCityBySlug };
