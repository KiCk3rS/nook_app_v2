/** Contenu découverte recherche — layout + fallback offline. */

import { spacing } from './theme';

/** Gouttière horizontale feuille recherche — alignée barre carte (`mapSearchBarStyles`). */
export const SEARCH_SHEET_GUTTER = spacing.base;

/**
 * @deprecated En production, les carrousels utilisent `GET /cities?promoted=true`
 * via `useCityCarousels`. Conservé uniquement pour fallback `!isApiConfigured()`
 * / erreur réseau (offline).
 */
export const promotedCitySlugs = ['paris'] as const;

/**
 * @deprecated En production, utiliser `GET /cities?popular=true`.
 * Conservé pour fallback offline uniquement.
 */
export const popularCitySlugs = ['paris', 'lyon'] as const;
