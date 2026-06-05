import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../../constants/theme';

interface PoiMarkerVisualProps {
  categoryId: string;
  name: string;
  selected?: boolean;
}

export const MARKER_SIZE = 48;
export const MARKER_SIZE_SELECTED = 54;
export const BORDER_WIDTH = 5;
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
  const fillColor = selected ? colors.markerSelected : colors.brand;
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
              backgroundColor: fillColor,
            },
          ]}
        >
          <Ionicons
            name={iconName}
            size={selected ? 28 : 25}
            color={colors.textInverse}
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
              borderTopColor: colors.background,
            },
          ]}
        />
      </View>
      <Text style={styles.label} numberOfLines={2}>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pinSelected: {
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 10,
  },
  photoRing: {
    borderWidth: BORDER_WIDTH,
    borderColor: colors.background,
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
    marginTop: 4,
    maxWidth: LABEL_MAX_WIDTH,
    textAlign: 'center',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
