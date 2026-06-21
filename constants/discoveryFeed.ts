/** Fil de découverte A4.1 — mock éditorial (MVP). */

import { getPlaceById, type MockPlace } from './mockPlaces';
import { popularCitySlugs, promotedCitySlugs } from './searchDiscovery';

export const DISCOVERY_FEED_COPY = {
  title: 'Découvrir',
  promotedSectionTitle: 'Destinations promues',
  hidePromoted: 'Masquer',
  popularCitiesSectionTitle: 'Destinations populaires',
  latestSectionTitle: 'Derniers guides',
  popularSectionTitle: 'Les plus écoutés',
  topRatedSectionTitle: 'Les mieux notés',
  missingPlaceTitle: 'Il vous manque un lieu ?',
  missingPlaceBody:
    'Les guides locaux et les autorités peuvent publier du contenu sur NOOK.',
  missingPlaceFooter: 'Bientôt disponible',
} as const;

export { promotedCitySlugs, popularCitySlugs };

/** POI récemment publiés — ordre éditorial. */
export const latestPlaceIds = ['14', '13', '12', '11', '10'] as const;

/** Écoutes simulées pour la section « Les plus écoutés ». */
export const popularListenCounts: Record<string, number> = {
  '2': 1240,
  '1': 980,
  '6': 860,
  '4': 720,
  '3': 540,
};

export const popularPlaceIds = ['2', '1', '6', '4', '3'] as const;

export interface DiscoveryPlaceItem {
  place: MockPlace;
  subtitle: string;
}

function getBestReadyRating(place: MockPlace): number | null {
  const ratings = place.audioGuides
    .filter((guide) => guide.status === 'ready' && guide.rating != null)
    .map((guide) => guide.rating as number);
  if (ratings.length === 0) return null;
  return Math.max(...ratings);
}

function formatListenCount(count: number): string {
  if (count >= 1000) {
    const rounded = Math.round(count / 100) / 10;
    return `${rounded.toString().replace('.', ',')} k écoutes`;
  }
  return `${count} écoutes`;
}

function getLatestSubtitle(place: MockPlace): string {
  const readyGuides = place.audioGuides.filter((guide) => guide.status === 'ready');
  const latest = readyGuides[0];
  if (!latest?.publishedAt) return 'Nouveau guide';
  return `Publié le ${latest.publishedAt}`;
}

export function getLatestDiscoveryPlaces(): DiscoveryPlaceItem[] {
  return latestPlaceIds
    .map((id) => getPlaceById(id))
    .filter((place): place is MockPlace => place != null)
    .map((place) => ({
      place,
      subtitle: getLatestSubtitle(place),
    }));
}

export function getPopularDiscoveryPlaces(): DiscoveryPlaceItem[] {
  return popularPlaceIds
    .map((id) => getPlaceById(id))
    .filter((place): place is MockPlace => place != null)
    .map((place) => ({
      place,
      subtitle: formatListenCount(popularListenCounts[place.id] ?? 0),
    }));
}

export function getTopRatedDiscoveryPlaces(): DiscoveryPlaceItem[] {
  return popularPlaceIds
    .map((id) => getPlaceById(id))
    .filter((place): place is MockPlace => place != null)
    .map((place) => ({
      place,
      rating: getBestReadyRating(place),
    }))
    .filter((item) => item.rating != null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .map(({ place, rating }) => ({
      place,
      subtitle: `★ ${(rating ?? 0).toFixed(1).replace('.', ',')}`,
    }));
}
