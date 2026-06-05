import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { GEOLOC_CONTROL_COPY } from '../../constants/permissions';
import { colors, elevation, radius, spacing, zIndex } from '../../constants/theme';

const CONTROL_SIZE = 44;

interface GeolocControlProps {
  isAttention: boolean;
  isLoading: boolean;
  onPress: () => void;
}

export function GeolocControl({ isAttention, isLoading, onPress }: GeolocControlProps) {
  const accessibilityLabel = isAttention
    ? GEOLOC_CONTROL_COPY.attention
    : GEOLOC_CONTROL_COPY.normal;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.control,
        pressed && !isLoading && styles.controlPressed,
      ]}
      onPress={onPress}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isLoading, busy: isLoading }}
      hitSlop={4}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.brand} />
      ) : (
        <Ionicons
          name="navigate"
          size={22}
          color={isAttention ? colors.warning : colors.textPrimary}
        />
      )}
      {isAttention && !isLoading ? (
        <View style={styles.badge} accessibilityLabel={GEOLOC_CONTROL_COPY.missingBadge}>
          <Ionicons name="help" size={10} color={colors.textInverse} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  control: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: zIndex.mapControls,
    ...elevation.control,
  },
  controlPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
});

export const geolocControlSize = CONTROL_SIZE;
