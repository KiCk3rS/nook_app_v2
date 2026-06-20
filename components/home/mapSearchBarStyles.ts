import { StyleSheet } from 'react-native';

import {
  colors,
  componentSizes,
  elevation,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

/** Layout partagé barre recherche carte (A1.1) et feuille recherche (A2.1). */
export const MAP_SEARCH_BAR_GUTTER = spacing.base;

export const mapSearchBarStyles = StyleSheet.create({
  container: {
    paddingHorizontal: MAP_SEARCH_BAR_GUTTER,
    paddingTop: spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: componentSizes.searchBarHeight,
    backgroundColor: colors.canvas,
    borderRadius: radius.full,
    paddingLeft: spacing.base,
    paddingRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
    ...elevation.control,
  },
  barPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  input: {
    flex: 1,
    ...textStyle('bodyMd'),
    color: colors.ink,
    padding: 0,
  },
  searchOrb: {
    width: componentSizes.searchOrbSize,
    height: componentSizes.searchOrbSize,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
