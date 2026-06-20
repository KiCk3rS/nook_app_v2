import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';



import { CategorySlider } from '../../components/home/CategorySlider';

import { GeolocControl } from '../../components/home/GeolocControl';

import { HomeMap, type HomeMapHandle } from '../../components/home/HomeMap';

import { PermissionSheet } from '../../components/home/PermissionSheet';

import { PoiPreviewCard } from '../../components/home/PoiPreviewCard';

import { SearchHeader } from '../../components/home/SearchHeader';

import type { PermissionType } from '../../constants/permissions';

import { getPlaceById } from '../../constants/mockPlaces';
import { useAudioPlayback } from '../../contexts/AudioPlaybackContext';
import { colors, miniPlayerHeight, spacing, zIndex } from '../../constants/theme';

import { useLocationPermission } from '../../hooks/useLocationPermission';

import type { PermissionSheetSource } from '../../lib/analytics';



/** Marge latérale et basse de la carte POI (la tab bar est déjà hors zone contenu). */

const poiCardMargin = spacing.base;



export default function CarteScreen() {

  const insets = useSafeAreaInsets();
  const mapRef = useRef<HomeMapHandle>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const [permissionSheetVisible, setPermissionSheetVisible] = useState(false);

  const [permissionSheetSource, setPermissionSheetSource] =

    useState<PermissionSheetSource>('map_control');

  const [isRequestingPermission, setIsRequestingPermission] = useState(false);



  const {

    status: locationStatus,

    isAttention,

    isLoading: isLocationLoading,

    requestWhenInUse,

    getCurrentPosition,

  } = useLocationPermission();



  const [poiCardHeight, setPoiCardHeight] = useState(0);
  const { viewMode } = useAudioPlayback();

  const selectedPlace =
    selectedPlaceId ? getPlaceById(selectedPlaceId) ?? null : null;

  const miniPlayerInset =
    viewMode === 'mini' ? miniPlayerHeight + spacing.sm + 2 : 0;
  const poiCardBottom = poiCardMargin + miniPlayerInset;

  const geolocControlBottom = selectedPlace

    ? poiCardBottom + poiCardHeight + spacing.base

    : poiCardBottom;

  const statusBarScrimHeight = insets.top + spacing.base;



  async function handleGeolocPress() {

    if (isLocationLoading || isRequestingPermission) return;



    if (locationStatus === 'granted') {

      const coords = await getCurrentPosition();

      if (coords) mapRef.current?.centerOnUser(coords);

      return;

    }



    setPermissionSheetSource('map_control');

    setPermissionSheetVisible(true);

  }



  async function handleRequestPermission(type: PermissionType) {

    if (type !== 'location_when_in_use') return;

    setIsRequestingPermission(true);

    try {

      const result = await requestWhenInUse();

      if (result === 'granted') {

        const coords = await getCurrentPosition();

        if (coords) mapRef.current?.centerOnUser(coords);

      }

    } finally {

      setIsRequestingPermission(false);

    }

  }



  function handleClosePermissionSheet() {

    setPermissionSheetVisible(false);

  }



  return (

    <View style={styles.container}>

      <HomeMap

        ref={mapRef}

        selectedPlaceId={selectedPlaceId}

        onSelectPlace={setSelectedPlaceId}

        showsUserLocation={locationStatus === 'granted'}

      />

      <LinearGradient
        colors={[colors.canvas, 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.statusBarScrim, { height: statusBarScrimHeight }]}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">

        <SearchHeader />

        <CategorySlider

          selectedCategoryId={selectedCategoryId}

          onSelectCategory={setSelectedCategoryId}

        />

      </SafeAreaView>

      <View

        style={[styles.geolocControl, { bottom: geolocControlBottom }]}

        pointerEvents="box-none"

      >

        <GeolocControl

          isAttention={isAttention}

          isLoading={isLocationLoading}

          onPress={() => void handleGeolocPress()}

        />

      </View>

      {selectedPlace ? (

        <View

          style={[styles.poiPreview, { bottom: poiCardBottom }]}

          pointerEvents="box-none"

          onLayout={(event) => setPoiCardHeight(event.nativeEvent.layout.height)}

        >

          <PoiPreviewCard

            place={selectedPlace}

            onClose={() => setSelectedPlaceId(null)}

          />

        </View>

      ) : null}

      <PermissionSheet

        visible={permissionSheetVisible}

        source={permissionSheetSource}

        locationStatus={locationStatus}

        isRequesting={isRequestingPermission}

        onClose={handleClosePermissionSheet}

        onRequestPermission={handleRequestPermission}

      />

    </View>

  );

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

  },

  statusBarScrim: {

    position: 'absolute',

    top: 0,

    left: 0,

    right: 0,

    zIndex: zIndex.mapControls,

  },

  overlay: {

    position: 'absolute',

    top: 0,

    left: 0,

    right: 0,

    zIndex: zIndex.chrome,

  },

  geolocControl: {

    position: 'absolute',

    right: spacing.base,

    zIndex: zIndex.mapControls,

  },

  poiPreview: {

    position: 'absolute',

    left: poiCardMargin,

    right: poiCardMargin,

    zIndex: zIndex.poiPreview,

  },

});

