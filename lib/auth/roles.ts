import type { User } from '../../types/api';

/** Rôle admin API (`UserRole.ADMIN`). */
export const ADMIN_ROLE = 'ADMIN';

export interface AdminEditorialAccessParams {
  user: User | null | undefined;
  isAuthenticated: boolean;
  isMockSession: boolean;
  apiConfigured: boolean;
}

/** @deprecated Prefer `AdminEditorialAccessParams`. */
export type AdminWikipediaAccessParams = AdminEditorialAccessParams;

/** True si l’utilisateur authentifié a le rôle ADMIN. */
export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === ADMIN_ROLE;
}

/**
 * Gate unique pour les outils éditoriaux admin (Wikipedia → POI, génération audio).
 * Pas d’entrée UI hors auth admin + API réelle (hors session mock).
 */
export function canUseAdminEditorialTools(
  params: AdminEditorialAccessParams,
): boolean {
  return (
    params.isAuthenticated &&
    isAdmin(params.user) &&
    params.apiConfigured &&
    !params.isMockSession
  );
}

/** Alias sémantique pour le flux Wikipedia → POI (même gate). */
export function canUseAdminWikipediaCreation(
  params: AdminEditorialAccessParams,
): boolean {
  return canUseAdminEditorialTools(params);
}
