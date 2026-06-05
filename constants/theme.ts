/**
 * Tokens design NOOK — version provisoire.
 *
 * Ces valeurs servent de base pour la maquette code de l'écran A1. Elles devront
 * être confrontées au design system final (palette officielle, typographie,
 * contrastes WCAG AA validés). Voir docs/ecran-A1-carte-accueil.md § Livrables.
 */

export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#F7F7F8',
  surfaceSunken: '#F1F2F4',

  textPrimary: '#0E1116',
  textSecondary: '#5B6470',
  textMuted: '#8A929B',
  textInverse: '#FFFFFF',

  border: '#E5E7EB',
  borderStrong: '#CBD0D6',
  divider: '#EEF0F2',

  brand: '#2E6BFF',
  brandPressed: '#214FBF',
  brandOnSurface: '#2E6BFF',

  success: '#1DA371',
  warning: '#B8731A',
  error: '#C13B3B',

  scrim: 'rgba(14, 17, 22, 0.45)',
  mapOfflineOverlay: 'rgba(14, 17, 22, 0.18)',

  markerDefault: '#2E6BFF',
  markerSelected: '#0E1116',
  clusterFill: '#0E1116',
  clusterText: '#FFFFFF',
} as const;

export const typography = {
  fontFamily: undefined,
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 28,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.4,
    relaxed: 1.55,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  '3xl': 32,
  '4xl': 40,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const elevation = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  control: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

/** Hauteur tab bar — alignée sur `app/(tabs)/_layout.tsx` */
export const tabBarHeight = 64;

export const zIndex = {
  map: 0,
  mapControls: 10,
  poiPreview: 15,
  chrome: 20,
  miniPlayer: 30,
  banner: 40,
  sheet: 50,
  modalFullscreen: 60,
  toast: 70,
} as const;

export const motion = {
  durationShort: 150,
  durationMedium: 220,
  durationLong: 320,
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  elevation,
  zIndex,
  motion,
} as const;

export type Theme = typeof theme;
