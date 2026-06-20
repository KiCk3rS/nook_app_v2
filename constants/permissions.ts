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

export const PERMISSION_SHEET_COPY = {
  title: 'Autorisez la localisation pour explorer autour de vous',
  subtitle:
    'NOOK utilise votre position pour afficher les lieux à proximité et vous guider sur la carte.',
  footer:
    'Vous pouvez modifier ces autorisations à tout moment dans les paramètres de l’appareil. Nous prenons votre vie privée au sérieux — consultez notre Politique de confidentialité.',
  footerSettingsLink: 'paramètres de l’appareil',
  privacyLink: 'Politique de confidentialité',
  blockedHint: 'Activez dans les paramètres de l’appareil',
  authorizedLabel: 'Autorisé',
} as const;

export const GEOLOC_CONTROL_COPY = {
  normal: 'Afficher ma position sur la carte',
  attention: 'Autoriser la localisation — requis pour vous situer sur la carte',
  missingBadge: 'Autorisation de localisation manquante',
} as const;

export const PERMISSION_CARDS: PermissionCardConfig[] = [
  {
    type: 'location_when_in_use',
    icon: 'location-outline',
    title: 'Localisation',
    description:
      'Indiquez où vous vous trouvez pour voir les lieux autour de vous et centrer la carte.',
    cta: 'Autoriser la localisation',
  },
];
