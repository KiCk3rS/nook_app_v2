import { forwardRef, useImperativeHandle, useRef } from 'react';

import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { Platform, StyleSheet, View } from 'react-native';



import { rootPlaces, parisRegion } from '../../constants/mockPlaces';

import { zIndex } from '../../constants/theme';

import { PlaceMapMarker } from './PlaceMapMarker';



interface HomeMapProps {

  selectedPlaceId: string | null;

  onSelectPlace: (placeId: string | null) => void;

  showsUserLocation?: boolean;

}



export interface HomeMapHandle {

  centerOnUser: (coords: { latitude: number; longitude: number }) => void;

  centerOnRegion: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;

}



const USER_REGION_DELTA = {

  latitudeDelta: 0.02,

  longitudeDelta: 0.02,

};



/** Masque les POI natifs Google/Apple pour ne garder que les marqueurs Nook. */

const HIDE_NATIVE_POI_MAP_STYLE = [

  { featureType: 'poi', stylers: [{ visibility: 'off' }] },

];



export const HomeMap = forwardRef<HomeMapHandle, HomeMapProps>(function HomeMap(

  { selectedPlaceId, onSelectPlace, showsUserLocation = false },

  ref,

) {

  const mapRef = useRef<MapView>(null);

  const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

  const ignoreNextMapPress = useRef(false);



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

  }));



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

        customMapStyle={HIDE_NATIVE_POI_MAP_STYLE}

        showsPointsOfInterests={false}

        onPress={handleMapPress}

      >

        {rootPlaces.map((place) => (
          <PlaceMapMarker
            key={place.id}
            place={place}
            selected={place.id === selectedPlaceId}
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

