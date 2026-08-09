import type { User } from '../../types/api';

/** Rôle admin API (`UserRole.ADMIN`). */
export const ADMIN_ROLE = 'ADMIN';

export interface AdminWikipediaAccessParams {
  user: User | null | undefined;
  isAuthenticated: boolean;
  isMockSession: boolean;
  apiConfigured: boolean;
}

/** True si l’utilisateur authentifié a le rôle ADMIN. */
export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === ADMIN_ROLE;
}

/**
 * Gate unique pour le flux admin Wikipedia → POI (carte + feuille).
 * Pas d’entrée UI hors auth admin + API réelle (hors session mock).
 */
export function canUseAdminWikipediaCreation(
  params: AdminWikipediaAccessParams,
): boolean {
  return (
    params.isAuthenticated &&
    isAdmin(params.user) &&
    params.apiConfigured &&
    !params.isMockSession
  );
}
