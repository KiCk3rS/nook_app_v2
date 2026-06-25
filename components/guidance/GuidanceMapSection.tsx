import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { MockPlace } from '../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  elevation,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import {
  getCoordinatesForPlaces,
  getRegionForPlaces,
} from '../../lib/itineraryMap';

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
  const { t } = useTranslation('guidance');

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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('mapSection')}</Text>

      <Pressable
        onPress={onOpenMap}
        style={({ pressed }) => [styles.mapCard, pressed && styles.mapCardPressed]}
        accessibilityRole="button"
        accessibilityLabel={t('a11yMap', {
          step: currentStepIndex + 1,
          name: stepName,
        })}
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
                pinColor={index === currentStepIndex ? colors.primary : colors.muted}
              />
            ))}
          </MapView>
          <View style={styles.expandHint} pointerEvents="none">
            <View style={styles.expandBadge}>
              <Ionicons name="expand-outline" size={16} color={colors.ink} />
            </View>
          </View>
        </View>
      </Pressable>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={onOpenMap}
          style={({ pressed }) => [
            styles.secondaryBtn,
            !canViewPlace && styles.secondaryBtnFull,
            pressed && styles.secondaryBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('openMap')}
        >
          <Ionicons name="map-outline" size={18} color={colors.ink} />
          <Text style={styles.secondaryBtnText} numberOfLines={1}>
            {t('openMapShort')}
          </Text>
        </Pressable>

        {canViewPlace ? (
          <Pressable
            onPress={onViewPlace}
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('viewPlace')}
          >
            <Ionicons name="document-text-outline" size={18} color={colors.ink} />
            <Text style={styles.secondaryBtnText} numberOfLines={1}>
              {t('viewPlaceShort')}
            </Text>
          </Pressable>
        ) : null}
      </View>
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
  expandHint: {
    ...StyleSheet.absoluteFill,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  expandBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
    ...elevation.card,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: componentSizes.buttonPrimaryHeight,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.canvas,
  },
  secondaryBtnFull: {
    flex: 0,
    flexGrow: 1,
  },
  secondaryBtnPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  secondaryBtnText: {
    ...textStyle('buttonSm'),
    color: colors.ink,
    flexShrink: 1,
  },
});
