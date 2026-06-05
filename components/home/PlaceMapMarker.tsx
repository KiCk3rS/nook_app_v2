import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

import type { MockPlace } from '../../constants/mockPlaces';

import { POI_MARKER_ANCHOR, PoiMarkerVisual } from './PoiMarkerVisual';

interface PlaceMapMarkerProps {
  place: MockPlace;
  selected: boolean;
  onPress: () => void;
}

const TRACKS_OFF_DELAY_MS = 150;

export function PlaceMapMarker({ place, selected, onPress }: PlaceMapMarkerProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const tracksOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTracksViewChanges(true);

    tracksOffTimerRef.current = setTimeout(() => {
      setTracksViewChanges(false);
    }, TRACKS_OFF_DELAY_MS);

    return () => {
      if (tracksOffTimerRef.current) clearTimeout(tracksOffTimerRef.current);
    };
  }, [selected]);

  return (
    <Marker
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
