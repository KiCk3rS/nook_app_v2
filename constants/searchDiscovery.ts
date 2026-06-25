/** Contenu découverte recherche — mock éditorial / promu (MVP). */

import { spacing } from './theme';

/** Gouttière horizontale feuille recherche — alignée barre carte (`mapSearchBarStyles`). */
export const SEARCH_SHEET_GUTTER = spacing.base;

/** Villes promues (style annonce) — Paris en MVP. */
export const promotedCitySlugs = ['paris'] as const;

/** Villes populaires pour le carrousel horizontal. */
export const popularCitySlugs = ['paris', 'lyon'] as const;
