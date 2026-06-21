import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

import type { MockPlace } from '../../constants/mockPlaces';
import { colors, textStyle } from '../../constants/theme';

interface ItineraryStepMarkerProps {
  place: MockPlace;
  order: number;
  isCurrent: boolean;
  isSelected: boolean;
  onPress: () => void;
}

const MARKER_ANCHOR = { x: 0.5, y: 0.5 };
const TRACKS_OFF_DELAY_MS = Platform.OS === 'android' ? 300 : 150;

export function ItineraryStepMarker({
  place,
  order,
  isCurrent,
  isSelected,
  onPress,
}: ItineraryStepMarkerProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const active = isCurrent || isSelected;

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), TRACKS_OFF_DELAY_MS);
    return () => clearTimeout(timer);
  }, [active, order]);

  return (
    <Marker
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      anchor={MARKER_ANCHOR}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
      accessibilityLabel={`Étape ${order}, ${place.name}`}
    >
      <View style={styles.wrapper} collapsable={false}>
        <View
          style={[
            styles.badge,
            active ? styles.badgeActive : styles.badgeDefault,
            isSelected && styles.badgeSelected,
          ]}
        >
          <Text style={[styles.label, active ? styles.labelActive : styles.labelDefault]}>
            {order}
          </Text>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    paddingHorizontal: 6,
  },
  badgeDefault: {
    backgroundColor: colors.canvas,
    borderColor: colors.primary,
  },
  badgeActive: {
    backgroundColor: colors.primary,
    borderColor: colors.canvas,
  },
  badgeSelected: {
    transform: [{ scale: 1.12 }],
  },
  label: {
    ...textStyle('badge'),
  },
  labelDefault: {
    color: colors.primary,
  },
  labelActive: {
    color: colors.onPrimary,
  },
});
