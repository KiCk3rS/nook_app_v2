import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';

import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

import { Platform, StyleSheet, View } from 'react-native';

import type { MockPlace } from '../../constants/mockPlaces';
import { rootPlaces, parisRegion } from '../../constants/mockPlaces';
import { colors, zIndex } from '../../constants/theme';
import {
  getCoordinatesForPlaces,
  type MapRegion,
} from '../../lib/itineraryMap';

import { ItineraryStepMarker } from './ItineraryStepMarker';
import { PlaceMapMarker } from './PlaceMapMarker';

export interface ItineraryMapOverlay {
  places: MockPlace[];
  currentStepIndex?: number;
}

interface HomeMapProps {
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string | null) => void;
  showsUserLocation?: boolean;
  itineraryOverlay?: ItineraryMapOverlay | null;
}

export interface HomeMapHandle {
  centerOnUser: (coords: { latitude: number; longitude: number }) => void;
  centerOnRegion: (region: MapRegion) => void;
  fitItineraryRoute: (
    places: MockPlace[],
    edgePadding?: { top: number; right: number; bottom: number; left: number },
  ) => void;
}

const USER_REGION_DELTA = {
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const DEFAULT_ITINERARY_PADDING = {
  top: 140,
  right: 48,
  bottom: 220,
  left: 48,
};

/** Masque les POI natifs Google/Apple pour ne garder que les marqueurs Nook. */
const HIDE_NATIVE_POI_MAP_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

export const HomeMap = forwardRef<HomeMapHandle, HomeMapProps>(function HomeMap(
  { selectedPlaceId, onSelectPlace, showsUserLocation = false, itineraryOverlay = null },
  ref,
) {
  const mapRef = useRef<MapView>(null);
  const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;
  const ignoreNextMapPress = useRef(false);

  const visiblePlaces = useMemo(() => {
    if (itineraryOverlay) return [];
    return rootPlaces;
  }, [itineraryOverlay]);

  const routeCoordinates = useMemo(
    () => (itineraryOverlay ? getCoordinatesForPlaces(itineraryOverlay.places) : []),
    [itineraryOverlay],
  );

  useImperativeHandle(ref, () => ({
    centerOnUser(coords) {
      mapRef.current?.animateToRegion(
        {
          ...coords,
          ...USER_REGION_DELTA,
        },
        350,
      );
    },

    centerOnRegion(region) {
      mapRef.current?.animateToRegion(region, 350);
    },

    fitItineraryRoute(places, edgePadding = DEFAULT_ITINERARY_PADDING) {
      const coordinates = getCoordinatesForPlaces(places);
      if (coordinates.length === 0) return;

      if (coordinates.length === 1) {
        mapRef.current?.animateToRegion(
          {
            ...coordinates[0],
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          350,
        );
        return;
      }

      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding,
        animated: true,
      });
    },
  }));

  useEffect(() => {
    if (!itineraryOverlay || itineraryOverlay.places.length === 0) return;
    mapRef.current?.fitToCoordinates(getCoordinatesForPlaces(itineraryOverlay.places), {
      edgePadding: DEFAULT_ITINERARY_PADDING,
      animated: true,
    });
  }, [itineraryOverlay]);

  function handleMarkerPress(placeId: string) {
    ignoreNextMapPress.current = true;
    const isSelected = placeId === selectedPlaceId;
    onSelectPlace(isSelected ? null : placeId);
  }

  function handleMapPress() {
    if (ignoreNextMapPress.current) {
      ignoreNextMapPress.current = false;
      return;
    }
    onSelectPlace(null);
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={mapProvider}
        style={styles.map}
        initialRegion={parisRegion}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={false}
        zoomControlEnabled={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        cacheEnabled={Platform.OS === 'android'}
        customMapStyle={HIDE_NATIVE_POI_MAP_STYLE}
        showsPointsOfInterests={false}
        onPress={handleMapPress}
      >
        {visiblePlaces.map((place) => (
          <PlaceMapMarker
            key={place.id}
            place={place}
            selected={place.id === selectedPlaceId}
            onPress={() => handleMarkerPress(place.id)}
          />
        ))}

        {itineraryOverlay && routeCoordinates.length >= 2 ? (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.primary}
            strokeWidth={4}
          />
        ) : null}

        {itineraryOverlay?.places.map((place, index) => (
          <ItineraryStepMarker
            key={`itinerary-${place.id}`}
            place={place}
            order={index + 1}
            isCurrent={itineraryOverlay.currentStepIndex === index}
            isSelected={place.id === selectedPlaceId}
            onPress={() => handleMarkerPress(place.id)}
          />
        ))}
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: zIndex.map,
  },
  map: {
    flex: 1,
  },
});
