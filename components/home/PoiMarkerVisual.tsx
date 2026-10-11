import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON_KEY,
  ioniconForCategoryIconKey,
} from '../../lib/categoryIcons';
import { colors, elevation, spacing, textStyle } from '../../constants/theme';

interface PoiMarkerVisualProps {
  name: string;
  iconKey: string;
  colorHex: string;
  selected?: boolean;
  isDraft?: boolean;
  draftLabel?: string;
}

/** Taille proche des pastilles Google Maps (pas des pins RN géants). */
export const MARKER_SIZE = 28;
export const MARKER_SIZE_SELECTED = 32;
export const BORDER_WIDTH = 2;
export const TAIL_WIDTH = 10;
/** ~1/3 de l’ancienne queue (~8 → ~3). */
export const TAIL_HEIGHT = 3;
export const LABEL_MAX_WIDTH = 120;

/** Point d’ancrage : base de la queue, au-dessus du libellé. */
export const POI_MARKER_ANCHOR = { x: 0.5, y: 0.74 } as const;

export function PoiMarkerVisual({
  name,
  iconKey = DEFAULT_CATEGORY_ICON_KEY,
  colorHex = DEFAULT_CATEGORY_COLOR,
  selected = false,
  isDraft = false,
  draftLabel,
}: PoiMarkerVisualProps) {
  const size = selected ? MARKER_SIZE_SELECTED : MARKER_SIZE;
  const ringSize = size + BORDER_WIDTH * 2;
  const ringBorderColor = isDraft
    ? colors.warning
    : selected
      ? colors.markerActiveBorder
      : '#FFFFFF';
  const iconName = ioniconForCategoryIconKey(iconKey);
  const displayName =
    isDraft && draftLabel ? `${name} · ${draftLabel}` : name;

  return (
    <View style={styles.container} collapsable={false}>
      <View
        style={[styles.pin, selected && styles.pinSelected]}
        collapsable={false}
      >
        <View
          collapsable={false}
          style={[
            styles.photoRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              backgroundColor: colorHex,
              borderColor: ringBorderColor,
              borderStyle: isDraft ? 'dashed' : 'solid',
            },
          ]}
        >
          <Ionicons
            name={iconName}
            size={selected ? 15 : 13}
            color={colors.onPrimary}
            accessibilityElementsHidden
          />
        </View>
        <View
          collapsable={false}
          style={[
            styles.tail,
            {
              borderLeftWidth: TAIL_WIDTH / 2,
              borderRightWidth: TAIL_WIDTH / 2,
              borderTopWidth: TAIL_HEIGHT,
              borderTopColor: '#FFFFFF',
            },
          ]}
        />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected, isDraft && styles.labelDraft]} numberOfLines={2}>
        {displayName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    maxWidth: LABEL_MAX_WIDTH + 16,
    backgroundColor: 'transparent',
  },
  pin: {
    alignItems: 'center',
    ...elevation.control,
  },
  pinSelected: {
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  photoRing: {
    borderWidth: BORDER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tail: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    backgroundColor: 'transparent',
  },
  label: {
    marginTop: spacing.xxs,
    maxWidth: LABEL_MAX_WIDTH,
    textAlign: 'center',
    ...textStyle('microLabel'),
    color: colors.muted,
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  labelSelected: {
    color: colors.ink,
  },
  labelDraft: {
    color: colors.warning,
  },
});
