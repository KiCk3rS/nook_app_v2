import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

import type { PlacementPinPreview } from '../admin/AdminAddPlaceContext';
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON_KEY,
} from '../../lib/categoryIcons';

import { POI_MARKER_ANCHOR, PoiMarkerVisual } from './PoiMarkerVisual';

const TRACKS_OFF_DELAY_MS = Platform.OS === 'android' ? 300 : 150;

interface PlacementPinMarkerProps {
  latitude: number;
  longitude: number;
  preview: PlacementPinPreview | null;
  onDragStart: () => void;
  onDragEnd: (coord: { latitude: number; longitude: number }) => void;
}

export function PlacementPinMarker({
  latitude,
  longitude,
  preview,
  onDragStart,
  onDragEnd,
}: PlacementPinMarkerProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const iconKey = preview?.iconKey ?? DEFAULT_CATEGORY_ICON_KEY;
  const colorHex = preview?.colorHex ?? DEFAULT_CATEGORY_COLOR;
  const name = preview?.name?.trim() || 'Nouveau lieu';

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), TRACKS_OFF_DELAY_MS);
    return () => clearTimeout(timer);
  }, [iconKey, colorHex, name]);

  return (
    <Marker
      key={`placement-${iconKey}-${colorHex}`}
      coordinate={{ latitude, longitude }}
      anchor={POI_MARKER_ANCHOR}
      draggable
      tracksViewChanges={tracksViewChanges}
      onDragStart={onDragStart}
      onDragEnd={(e) => onDragEnd(e.nativeEvent.coordinate)}
      accessibilityLabel="Point de création de lieu"
    >
      <View style={styles.markerTouchTarget} collapsable={false} pointerEvents="none">
        <PoiMarkerVisual
          name={name}
          iconKey={iconKey}
          colorHex={colorHex}
          isDraft
        />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerTouchTarget: {
    alignItems: 'center',
  },
});
