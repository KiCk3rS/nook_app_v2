/**
 * Tokens design NOOK — alignés sur docs/DESIGN.md v0.3.
 *
 * Noms canoniques : primary, ink, canvas, spacing.base, typography.displayXl, etc.
 * Alias legacy (brand, textPrimary, background…) conservés pour le code existant.
 */

import type { TextStyle } from 'react-native';

const colorTokens = {
  primary: '#2E6BFF',
  primaryActive: '#214FBF',
  primaryDisabled: '#C5D7FF',
  primaryErrorText: '#C13B3B',
  primaryErrorTextHover: '#A32F2F',

  ink: '#0E1116',
  body: '#3F3F46',
  muted: '#5B6470',
  mutedSoft: '#8A929B',

  hairline: '#E5E7EB',
  hairlineSoft: '#EEF0F2',
  borderStrong: '#CBD0D6',

  canvas: '#FFFFFF',
  surfaceSoft: '#F7F7F8',
  surfaceCard: '#FFFFFF',
  surfaceStrong: '#F1F2F4',

  onPrimary: '#FFFFFF',
  onDark: '#FFFFFF',
  legalLink: '#428BFF',

  success: '#1DA371',
  warning: '#B8731A',
  starRating: '#0E1116',

  scrim: 'rgba(14, 17, 22, 0.45)',
  mapOfflineOverlay: 'rgba(14, 17, 22, 0.18)',

  markerIdleBorder: '#6B7580',
  markerIdleIcon: '#4A5360',
  markerActiveBorder: '#2E6BFF',
  markerActiveIcon: '#2E6BFF',
  /** @deprecated Préférer markerIdleIcon / markerActiveIcon */
  markerDefault: '#4A5360',
  /** @deprecated Préférer markerActiveBorder — sélection = brand */
  markerSelected: '#2E6BFF',
  clusterFill: '#0E1116',
  clusterText: '#FFFFFF',
} as const;

/** Couleurs — tokens DESIGN.md + alias legacy */
export const colors = {
  ...colorTokens,

  // Alias legacy (préférer les noms canoniques dans le nouveau code)
  background: colorTokens.canvas,
  surface: colorTokens.canvas,
  surfaceElevated: colorTokens.surfaceSoft,
  surfaceSunken: colorTokens.surfaceStrong,
  textPrimary: colorTokens.ink,
  textSecondary: colorTokens.muted,
  textMuted: colorTokens.mutedSoft,
  textInverse: colorTokens.onPrimary,
  border: colorTokens.hairline,
  divider: colorTokens.hairlineSoft,
  brand: colorTokens.primary,
  brandPressed: colorTokens.primaryActive,
  brandOnSurface: colorTokens.primary,
  error: colorTokens.primaryErrorText,
} as const;

const typographyTokens = {
  displayXl: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 1.43,
    letterSpacing: 0,
  },
  displayLg: {
    fontSize: 22,
    fontWeight: '500' as const,
    lineHeight: 1.18,
    letterSpacing: -0.44,
  },
  displayMd: {
    fontSize: 21,
    fontWeight: '700' as const,
    lineHeight: 1.43,
    letterSpacing: 0,
  },
  displaySm: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 1.2,
    letterSpacing: -0.18,
  },
  titleMd: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 1.25,
    letterSpacing: 0,
  },
  titleSm: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 1.25,
    letterSpacing: 0,
  },
  ratingDisplay: {
    fontSize: 64,
    fontWeight: '700' as const,
    lineHeight: 1.1,
    letterSpacing: -1,
  },
  bodyMd: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  bodySm: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 1.43,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 1.29,
    letterSpacing: 0,
  },
  captionSm: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 1.23,
    letterSpacing: 0,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  microLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 1.33,
    letterSpacing: 0,
  },
  uppercaseTag: {
    fontSize: 8,
    fontWeight: '700' as const,
    lineHeight: 1.25,
    letterSpacing: 0.32,
    textTransform: 'uppercase' as const,
  },
  buttonMd: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 1.25,
    letterSpacing: 0,
  },
  buttonSm: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 1.29,
    letterSpacing: 0,
  },
  link: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 1.43,
    letterSpacing: 0,
  },
  navLink: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 1.25,
    letterSpacing: 0,
  },
} as const;

/** Noms de famille après chargement via `@expo-google-fonts/inter` */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

type FontWeight = (typeof fontWeights)[keyof typeof fontWeights];

/** Associe un poids typo à la variante Inter chargée (requis sur Android). */
export function fontFamilyForWeight(weight: FontWeight = fontWeights.regular): string {
  switch (weight) {
    case fontWeights.bold:
      return fonts.bold;
    case fontWeights.semibold:
      return fonts.semibold;
    case fontWeights.medium:
      return fonts.medium;
    default:
      return fonts.regular;
  }
}

/** Applique un token typo canonique (docs/DESIGN.md) en style React Native. */
export function textStyle(token: TypographyToken): TextStyle {
  const style = typographyTokens[token];
  return {
    fontFamily: fontFamilyForWeight(style.fontWeight),
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.fontSize * style.lineHeight,
    letterSpacing: style.letterSpacing,
    ...('textTransform' in style ? { textTransform: style.textTransform } : {}),
  };
}

/** Tailles composants — docs/DESIGN.md §4 */
export const componentSizes = {
  searchBarHeight: 64,
  searchOrbSize: 48,
  buttonPrimaryHeight: 48,
  iconControlSize: 44,
} as const;

export const typography = {
  /** Variante regular — préférer `fontFamilyForWeight` si poids ≠ 400 */
  fontFamily: fonts.regular,
  fontFamilyStack:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",

  ...typographyTokens,

  /** Échelle simplifiée — alias vers les tokens canoniques */
  size: {
    xs: typographyTokens.microLabel.fontSize,
    sm: typographyTokens.bodySm.fontSize,
    md: typographyTokens.bodyMd.fontSize,
    lg: 18,
    xl: typographyTokens.displaySm.fontSize,
    xxl: 24,
    display: typographyTokens.displayXl.fontSize,
  },
  weight: fontWeights,
  lineHeight: {
    tight: 1.25,
    normal: 1.4,
    relaxed: 1.55,
  },
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 64,
} as const;

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 32,
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

/** Carte liste / carrousel — bordure discrète sans ombre (évite le clipping RN sur overflow). */
export const surfaceCardBorder = {
  backgroundColor: colors.surfaceCard,
  borderWidth: 1,
  borderColor: colors.hairline,
} as const;

/** Hauteur tab bar — alignée sur `app/(tabs)/_layout.tsx` */
export const tabBarHeight = 64;

/** Hauteur corps du mini-player audio (hors barre de progression) */
export const miniPlayerHeight = 64;

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
  componentSizes,
} as const;

export type Theme = typeof theme;
export type ColorToken = keyof typeof colorTokens;
export type TypographyToken = keyof typeof typographyTokens;
