import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet, View } from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';



import { CategorySlider } from '../../components/home/CategorySlider';

import { GeolocControl } from '../../components/home/GeolocControl';

import { HomeMap, type HomeMapHandle } from '../../components/home/HomeMap';

import { ItineraryMapBanner } from '../../components/home/ItineraryMapBanner';

import { PermissionSheet } from '../../components/home/PermissionSheet';

import { PoiPreviewCard } from '../../components/home/PoiPreviewCard';

import { SearchHeader } from '../../components/home/SearchHeader';

import { SearchSheet } from '../../components/search/SearchSheet';

import type { PermissionType } from '../../constants/permissions';

import { getPlaceById } from '../../constants/mockPlaces';
import { getCityBySlug } from '../../constants/mockCities';
import { getDistrictBySlug } from '../../constants/mockDistricts';
import { getItineraryById } from '../../constants/mockItineraries';
import { useAudioPlayback } from '../../contexts/AudioPlaybackContext';
import { colors, miniPlayerHeight, spacing, zIndex } from '../../constants/theme';

import { useLocationPermission } from '../../hooks/useLocationPermission';

import type { PermissionSheetSource } from '../../lib/analytics';
import { trackItineraryMapViewed } from '../../lib/analytics';
import {
  clampStepIndex,
  parseFocusItineraryParam,
  resolveItineraryPlaces,
} from '../../lib/itineraryMap';



/** Marge latérale et basse de la carte POI (la tab bar est déjà hors zone contenu). */

const poiCardMargin = spacing.base;



export default function CarteScreen() {
  const { t } = useTranslation('hub');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<HomeMapHandle>(null);
  const { focusCity, focusDistrict, focusItinerary } = useLocalSearchParams<{
    focusCity?: string;
    focusDistrict?: string;
    focusItinerary?: string;
  }>();

  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const [permissionSheetVisible, setPermissionSheetVisible] = useState(false);

  const [searchSheetVisible, setSearchSheetVisible] = useState(false);

  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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

  const itineraryMapSession = useMemo(() => {
    if (typeof focusItinerary !== 'string' || !focusItinerary.trim()) {
      return null;
    }

    const parsed = parseFocusItineraryParam(focusItinerary);
    if (!parsed) return null;

    const itinerary = getItineraryById(parsed.itineraryId);
    if (!itinerary) return null;

    const places = resolveItineraryPlaces(itinerary.stepPoiIds);
    if (places.length === 0) return null;

    const stepIndex = clampStepIndex(parsed.stepIndex, places.length);

    return {
      itinerary,
      places,
      stepIndex,
    };
  }, [focusItinerary]);

  useEffect(() => {
    if (typeof focusCity !== 'string' || focusItinerary) return;
    const city = getCityBySlug(focusCity);
    if (city) {
      mapRef.current?.centerOnRegion(city.mapRegion);
    }
  }, [focusCity, focusItinerary]);

  useEffect(() => {
    if (typeof focusDistrict !== 'string' || focusItinerary) return;
    const [citySlug, districtSlug] = focusDistrict.split('/');
    if (!citySlug || !districtSlug) return;
    const district = getDistrictBySlug(citySlug, districtSlug);
    if (district) {
      mapRef.current?.centerOnRegion(district.mapRegion);
    }
  }, [focusDistrict, focusItinerary]);

  useEffect(() => {
    if (!itineraryMapSession) return;

    trackItineraryMapViewed(
      itineraryMapSession.itinerary.id,
      itineraryMapSession.stepIndex != null ? 'guidance' : 'itinerary_detail',
      itineraryMapSession.stepIndex,
    );

    if (itineraryMapSession.stepIndex != null) {
      const currentPlace = itineraryMapSession.places[itineraryMapSession.stepIndex];
      if (currentPlace) {
        setSelectedPlaceId(currentPlace.id);
      }
    }
  }, [itineraryMapSession]);

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

  const itineraryStepLabel =
    itineraryMapSession?.stepIndex != null
      ? t('itineraryMapModeStep', {
          current: itineraryMapSession.stepIndex + 1,
          total: itineraryMapSession.places.length,
          name: itineraryMapSession.places[itineraryMapSession.stepIndex]?.name ?? '',
        })
      : undefined;

  function handleCloseItineraryMap() {
    setSelectedPlaceId(null);
    router.setParams({ focusItinerary: undefined });
  }

  function handleOpenItineraryDetail() {
    if (!itineraryMapSession) return;
    const { id, citySlug } = itineraryMapSession.itinerary;
    const { stepIndex } = itineraryMapSession;
    setSelectedPlaceId(null);
    router.setParams({ focusItinerary: undefined });

    if (stepIndex != null) {
      router.push(`/city/${citySlug}/itinerary/${id}/guide?step=${stepIndex}`);
      return;
    }

    router.push(`/city/${citySlug}/itinerary/${id}`);
  }

  const statusBarScrimHeight = insets.top + spacing.base;



  async function handleGeolocPress() {

    if (isLocationLoading || isRequestingPermission) return;



    if (locationStatus === 'granted') {

      const coords = await getCurrentPosition();

      if (coords) {
        setUserCoords(coords);
        mapRef.current?.centerOnUser(coords);
      }

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

        if (coords) {
          setUserCoords(coords);
          mapRef.current?.centerOnUser(coords);
        }

      }

    } finally {

      setIsRequestingPermission(false);

    }

  }



  function handleClosePermissionSheet() {

    setPermissionSheetVisible(false);

  }



  function handleOpenSearch() {

    setSearchSheetVisible(true);

  }



  function handleCloseSearchSheet() {

    setSearchSheetVisible(false);

  }



  return (

    <View style={styles.container}>

      <HomeMap

        ref={mapRef}

        selectedPlaceId={selectedPlaceId}

        onSelectPlace={setSelectedPlaceId}

        showsUserLocation={locationStatus === 'granted'}

        itineraryOverlay={
          itineraryMapSession
            ? {
                places: itineraryMapSession.places,
                currentStepIndex: itineraryMapSession.stepIndex,
              }
            : null
        }

      />

      <LinearGradient
        colors={[colors.canvas, 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.statusBarScrim, { height: statusBarScrimHeight }]}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">

        <SearchHeader onPress={handleOpenSearch} />

        <CategorySlider

          selectedCategoryId={selectedCategoryId}

          onSelectCategory={setSelectedCategoryId}

        />

        {itineraryMapSession ? (
          <View style={styles.itineraryBanner}>
            <ItineraryMapBanner
              title={itineraryMapSession.itinerary.title}
              stepLabel={itineraryStepLabel}
              onPress={handleOpenItineraryDetail}
              onClose={handleCloseItineraryMap}
            />
          </View>
        ) : null}

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

      <SearchSheet

        visible={searchSheetVisible}

        locationStatus={locationStatus}

        userCoords={userCoords}

        onClose={handleCloseSearchSheet}

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

  itineraryBanner: {

    marginTop: spacing.sm,

    marginHorizontal: spacing.base,

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

