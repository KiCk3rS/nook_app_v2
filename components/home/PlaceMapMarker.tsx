import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

import type { MockPlace } from '../../constants/mockPlaces';

import { POI_MARKER_ANCHOR, PoiMarkerVisual } from './PoiMarkerVisual';

interface PlaceMapMarkerProps {
  place: MockPlace;
  selected: boolean;
  onPress: () => void;
}

/** Délai court avant de figer le snapshot du marqueur (évite OOM Android). */
const TRACKS_OFF_DELAY_MS = Platform.OS === 'android' ? 300 : 150;

export function PlaceMapMarker({ place, selected, onPress }: PlaceMapMarkerProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), TRACKS_OFF_DELAY_MS);
    return () => clearTimeout(timer);
  }, [selected]);

  return (
    <Marker
      key={`${place.id}-${selected ? '1' : '0'}`}
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      anchor={POI_MARKER_ANCHOR}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
      accessibilityLabel={place.name}
    >
      <View style={styles.markerTouchTarget} collapsable={false} pointerEvents="none">
        <PoiMarkerVisual
          categoryId={place.categoryId}
          name={place.name}
          selected={selected}
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
