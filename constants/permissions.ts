/**
 * Périmètre permissions feuille A1.2 — v1 : localisation en utilisation uniquement.
 * Les autres cartes restent désactivées tant que le produit ne les requiert pas.
 */
export const PERMISSION_FEATURES = {
  locationAlways: false,
  motion: false,
  notifications: false,
} as const;

export type PermissionType = 'location_when_in_use';

export interface PermissionCardConfig {
  type: PermissionType;
  icon: 'location-outline';
  title: string;
  description: string;
  cta: string;
}
