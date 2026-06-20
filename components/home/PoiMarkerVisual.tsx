import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, elevation, spacing, textStyle } from '../../constants/theme';

interface PoiMarkerVisualProps {
  categoryId: string;
  name: string;
  selected?: boolean;
}

export const MARKER_SIZE = 48;
export const MARKER_SIZE_SELECTED = 54;
export const BORDER_WIDTH = 3;
export const TAIL_WIDTH = 12;
export const TAIL_HEIGHT = 8;
export const LABEL_MAX_WIDTH = 120;

/** Point d’ancrage : base de la queue, au-dessus du libellé. */
export const POI_MARKER_ANCHOR = { x: 0.5, y: 0.74 } as const;

const categoryIconNames: Partial<Record<string, ComponentProps<typeof Ionicons>['name']>> = {
  monument: 'business-outline',
  musee: 'color-palette-outline',
  parc: 'leaf-outline',
  quartier: 'map-outline',
};

export function PoiMarkerVisual({
  categoryId,
  name,
  selected = false,
}: PoiMarkerVisualProps) {
  const size = selected ? MARKER_SIZE_SELECTED : MARKER_SIZE;
  const ringSize = size + BORDER_WIDTH * 2;
  const ringBorderColor = selected ? colors.markerActiveBorder : colors.markerIdleBorder;
  const iconColor = selected ? colors.markerActiveIcon : colors.markerIdleIcon;
  const iconName = categoryIconNames[categoryId] ?? 'location-outline';

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
              backgroundColor: colors.surfaceSoft,
              borderColor: ringBorderColor,
            },
          ]}
        >
          <Ionicons
            name={iconName}
            size={selected ? 28 : 25}
            color={iconColor}
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
              borderTopColor: ringBorderColor,
            },
          ]}
        />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={2}>
        {name}
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
});
