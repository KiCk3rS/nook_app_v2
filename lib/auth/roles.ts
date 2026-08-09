import type { User } from '../../types/api';

/** Rôle admin API (`UserRole.ADMIN`). */
export const ADMIN_ROLE = 'ADMIN';

/** True si l’utilisateur authentifié a le rôle ADMIN. */
export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === ADMIN_ROLE;
}
