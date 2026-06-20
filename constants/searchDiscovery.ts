/** Contenu découverte recherche — mock éditorial / promu (MVP). */

import { spacing } from './theme';

/** Gouttière horizontale feuille recherche — alignée barre carte (`mapSearchBarStyles`). */
export const SEARCH_SHEET_GUTTER = spacing.base;

export const SEARCH_DISCOVERY_COPY = {
  promotedSectionTitle: 'Destinations promues',
  hidePromoted: 'Masquer',
  popularSectionTitle: 'Destinations populaires',
  missingPlaceTitle: 'Il vous manque un lieu ?',
  missingPlaceBody:
    'Les guides locaux et les autorités peuvent publier du contenu sur NOOK.',
  missingPlaceFooter: 'Bientôt disponible',
  emptyResultsTitle: (query: string) => `Aucun lieu pour « ${query} »`,
  emptyResultsHint: 'Essayez un autre mot-clé',
  searchPlaceholder: 'Rechercher un lieu…',
} as const;

/** Villes promues (style annonce) — Paris en MVP. */
export const promotedCitySlugs = ['paris'] as const;

/** Villes populaires pour le carrousel horizontal. */
export const popularCitySlugs = ['paris', 'lyon'] as const;
