import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { MockPlace } from '../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import {
  getCoordinatesForPlaces,
  getRegionForPlaces,
} from '../../lib/itineraryMap';

interface ItineraryRouteMapPreviewProps {
  places: MockPlace[];
  currentStepIndex?: number;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function ItineraryRouteMapPreview({
  places,
  currentStepIndex,
  onPress,
  accessibilityLabel,
}: ItineraryRouteMapPreviewProps) {
  const { t } = useTranslation('hub');
  const mapCtaLabel = accessibilityLabel ?? t('itineraryMapCta');

  if (places.length === 0) {
    return null;
  }

  const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;
  const region = getRegionForPlaces(places);
  const coordinates = getCoordinatesForPlaces(places);

  if (!region) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.clip}>
        <MapView
          style={styles.map}
          provider={mapProvider}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          pointerEvents="none"
          liteMode={Platform.OS === 'android'}
          cacheEnabled={Platform.OS === 'android'}
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
              pinColor={
                currentStepIndex === index ? colors.primary : colors.muted
              }
            />
          ))}
        </MapView>
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.ctaBar}>
            <Ionicons name="map-outline" size={18} color={colors.onPrimary} />
            <Text style={styles.ctaText}>{mapCtaLabel}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.onPrimary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  cardPressed: {
    opacity: 0.94,
  },
  clip: {
    height: 148,
    backgroundColor: colors.surfaceStrong,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  ctaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    minHeight: componentSizes.buttonPrimaryHeight,
  },
  ctaText: {
    ...textStyle('buttonSm'),
    color: colors.onPrimary,
    fontWeight: '600',
    flex: 1,
  },
});
