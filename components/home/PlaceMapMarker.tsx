import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Marker } from 'react-native-maps';

import type { CataloguePlaceMarker } from '../../types/catalogue';

import { POI_MARKER_ANCHOR, PoiMarkerVisual } from './PoiMarkerVisual';

interface PlaceMapMarkerProps {
  place: CataloguePlaceMarker;
  selected: boolean;
  onPress: () => void;
}

/** Délai court avant de figer le snapshot du marqueur (évite OOM Android). */
const TRACKS_OFF_DELAY_MS = Platform.OS === 'android' ? 300 : 150;

export function PlaceMapMarker({ place, selected, onPress }: PlaceMapMarkerProps) {
  const { t } = useTranslation('place');
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const isDraft = place.publicationStatus === 'DRAFT';

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), TRACKS_OFF_DELAY_MS);
    return () => clearTimeout(timer);
  }, [selected, isDraft]);

  return (
    <Marker
      key={`${place.id}-${selected ? '1' : '0'}-${isDraft ? 'd' : 'p'}`}
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      anchor={POI_MARKER_ANCHOR}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
      accessibilityLabel={
        isDraft
          ? t('draftMarkerA11y', { name: place.name })
          : place.name
      }
    >
      <View style={styles.markerTouchTarget} collapsable={false} pointerEvents="none">
        <PoiMarkerVisual
          categoryId={place.categoryId}
          name={place.name}
          selected={selected}
          isDraft={isDraft}
          draftLabel={t('draftBadge')}
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
