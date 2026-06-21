import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { GUIDANCE_COPY } from '../../constants/guidanceCopy';
import type { MockPlace } from '../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface GuidanceMapSectionProps {
  places: MockPlace[];
  currentStepIndex: number;
  stepName: string;
  onOpenMap: () => void;
  onViewPlace: () => void;
  canViewPlace: boolean;
}

export function GuidanceMapSection({
  places,
  currentStepIndex,
  stepName,
  onOpenMap,
  onViewPlace,
  canViewPlace,
}: GuidanceMapSectionProps) {
  if (places.length === 0) {
    return null;
  }

  const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;
  const coordinates = places.map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  const lats = places.map((p) => p.latitude);
  const lngs = places.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latDelta = Math.max((maxLat - minLat) * 1.6, 0.01);
  const lngDelta = Math.max((maxLng - minLng) * 1.6, 0.01);

  const region = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{GUIDANCE_COPY.mapSection}</Text>

      <Pressable
        onPress={onOpenMap}
        style={({ pressed }) => [styles.mapCard, pressed && styles.mapCardPressed]}
        accessibilityRole="button"
        accessibilityLabel={GUIDANCE_COPY.a11yMap(currentStepIndex + 1, stepName)}
      >
        <View style={styles.mapClip}>
          <MapView
            style={styles.map}
            provider={mapProvider}
            region={region}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            pointerEvents="none"
          >
            {coordinates.length >= 2 ? (
              <Polyline
                coordinates={coordinates}
                strokeColor={colors.primary}
                strokeWidth={3}
              />
            ) : null}
            {places.map((place, index) => (
              <Marker
                key={place.id}
                coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                pinColor={index === currentStepIndex ? colors.primary : colors.muted}
              />
            ))}
          </MapView>
          <View style={styles.mapOverlay} pointerEvents="none">
            <View style={styles.mapCtaBar}>
              <Ionicons name="map-outline" size={18} color={colors.onPrimary} />
              <Text style={styles.mapCtaText}>{GUIDANCE_COPY.openMap}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.onPrimary} />
            </View>
          </View>
        </View>
      </Pressable>

      {canViewPlace ? (
        <Pressable
          onPress={onViewPlace}
          style={({ pressed }) => [styles.placeRow, pressed && styles.placeRowPressed]}
          accessibilityRole="button"
          accessibilityLabel={GUIDANCE_COPY.viewPlace}
        >
          <Ionicons name="document-text-outline" size={18} color={colors.primary} />
          <Text style={styles.placeRowText}>{GUIDANCE_COPY.viewPlace}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: 'hidden',
  },
  sectionTitle: {
    ...textStyle('titleSm'),
    color: colors.ink,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  mapCard: {
    marginHorizontal: spacing.md,
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  mapCardPressed: {
    opacity: 0.94,
  },
  mapClip: {
    height: 148,
    backgroundColor: colors.surfaceStrong,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  mapCtaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
  },
  mapCtaText: {
    ...textStyle('buttonSm'),
    color: colors.onPrimary,
    fontWeight: '600',
    flex: 1,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    minHeight: componentSizes.buttonPrimaryHeight,
  },
  placeRowPressed: {
    backgroundColor: colors.canvas,
  },
  placeRowText: {
    ...textStyle('buttonSm'),
    color: colors.primary,
    flex: 1,
  },
});
