import type { MockPlace } from '../constants/mockPlaces';
import type { AppLocale } from './i18n';

/** Article Wikipedia éditorial lié au POI — utilisé pour la génération IA (A3.3). */
export function getPlaceWikipediaUrl(
  place: MockPlace,
  _language?: AppLocale,
): string | undefined {
  return place.wikipediaUrl?.trim() || undefined;
}

export function formatWikipediaArticleTitle(url: string): string {
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    const slug = path.replace(/^\/wiki\//, '');
    return slug.replace(/_/g, ' ');
  } catch {
    return url;
  }
}
