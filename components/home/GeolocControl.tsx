import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { GEOLOC_CONTROL_COPY } from '../../constants/permissions';
import { colors, componentSizes, elevation, radius } from '../../constants/theme';

const CONTROL_SIZE = componentSizes.iconControlSize;

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
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Ionicons
          name="navigate"
          size={22}
          color={isAttention ? colors.warning : colors.ink}
        />
      )}
      {isAttention && !isLoading ? (
        <View style={styles.badge} accessibilityLabel={GEOLOC_CONTROL_COPY.missingBadge}>
          <Ionicons name="help" size={10} color={colors.onPrimary} />
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
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
    ...elevation.control,
  },
  controlPressed: {
    backgroundColor: colors.surfaceStrong,
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
    borderColor: colors.canvas,
  },
});

export const geolocControlSize = CONTROL_SIZE;
