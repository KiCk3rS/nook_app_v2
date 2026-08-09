import type {
  AffiliateExperienceItem,
  MockCity,
  TouristPassItem,
} from '../../constants/mockCities';
import type { MockDistrict } from '../../constants/mockDistricts';
import { getPlaceById, type MockPlace } from '../../constants/mockPlaces';
import { PLACE_IMAGE_PLACEHOLDER } from '../../constants/placeImages';
import type {
  CityHub,
  CityHubMap,
  CityHubPoiSnippet,
  DistrictHub,
  DistrictHubRef,
} from '../../types/api';
import { poiCardLikeToMockPlace } from './poi';

/** Région carte pour CTA hub → A1.1. */
export type HubMapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

/** Données hub (sans callbacks analytics) — contrat unique pour mapper + vue. */
export interface TerritorialHubData {
  citySlug: string;
  districtSlug?: string;
  name: string;
  coverImageUrl: string;
  subtitle: string;
  mustSeePlaces: MockPlace[];
  recommendedPlaces: MockPlace[];
  featuredPremiumItineraryId: string | null;
  touristPasses: TouristPassItem[];
  affiliateExperiences: AffiliateExperienceItem[];
  parentCityName?: string;
  /** Toujours renseigné si le hub API/mock a un centre carte. */
  mapRegion?: HubMapRegion;
}

function resolveMockPlacesByIds(ids: string[]): MockPlace[] {
  return ids
    .map((id) => getPlaceById(id))
    .filter((p): p is MockPlace => p !== undefined);
}

function hubMapToRegion(map: CityHubMap): HubMapRegion | undefined {
  if (!map.center) return undefined;
  return {
    latitude: map.center.lat,
    longitude: map.center.lng,
    latitudeDelta: map.latitudeDelta,
    longitudeDelta: map.longitudeDelta,
  };
}

function mapHubPois(pois: CityHubPoiSnippet[]): MockPlace[] {
  return pois.map(cityHubPoiSnippetToMockPlace);
}

export function cityHubPoiSnippetToMockPlace(poi: CityHubPoiSnippet): MockPlace {
  return poiCardLikeToMockPlace({
    id: poi.id,
    title: poi.title,
    lat: poi.lat,
    lng: poi.lng,
    categories: poi.categories,
    parentPoiId: poi.parentPoiId,
    coverImageUrl: poi.coverImage?.url,
    districtHub: poi.districtHub,
  });
}

function hubCoreToData(
  hub: Pick<
    CityHub,
    | 'name'
    | 'subtitle'
    | 'coverImage'
    | 'map'
    | 'mustSeePois'
    | 'recommendedPois'
  >,
  extras: Pick<
    TerritorialHubData,
    'citySlug' | 'districtSlug' | 'parentCityName'
  > & {
    featuredPremiumItineraryId?: string | null;
    touristPasses?: TouristPassItem[];
    affiliateExperiences?: AffiliateExperienceItem[];
  },
): TerritorialHubData {
  return {
    citySlug: extras.citySlug,
    districtSlug: extras.districtSlug,
    name: hub.name,
    coverImageUrl: hub.coverImage?.url?.trim() || PLACE_IMAGE_PLACEHOLDER,
    subtitle: hub.subtitle?.trim() ?? '',
    mustSeePlaces: mapHubPois(hub.mustSeePois),
    recommendedPlaces: mapHubPois(hub.recommendedPois),
    featuredPremiumItineraryId: extras.featuredPremiumItineraryId ?? null,
    touristPasses: extras.touristPasses ?? [],
    affiliateExperiences: extras.affiliateExperiences ?? [],
    parentCityName: extras.parentCityName,
    mapRegion: hubMapToRegion(hub.map),
  };
}

/**
 * `GET /cities/:slug/hub` → données TerritorialHubView.
 * Pass / premium / expériences : stubs API vides jusqu’à F-018-d / T21.
 */
export function cityHubToHubData(hub: CityHub): TerritorialHubData {
  return hubCoreToData(hub, { citySlug: hub.slug });
}

/**
 * `GET /cities/:citySlug/districts/:districtSlug/hub` → TerritorialHubView.
 * Pass touristiques toujours masqués (A4.5).
 */
export function districtHubToHubData(hub: DistrictHub): TerritorialHubData {
  return hubCoreToData(hub, {
    citySlug: hub.citySlug,
    districtSlug: hub.slug,
    parentCityName: hub.cityName,
  });
}

/** Mode démo (`!isApiConfigured()`). */
export function mockCityToHubData(city: MockCity): TerritorialHubData {
  return {
    citySlug: city.slug,
    name: city.name,
    coverImageUrl: city.coverImageUrl,
    subtitle: city.subtitle,
    mustSeePlaces: resolveMockPlacesByIds(city.mustSeePoiIds),
    recommendedPlaces: resolveMockPlacesByIds(city.recommendedPoiIds),
    featuredPremiumItineraryId: city.featuredPremiumItineraryId,
    touristPasses: city.touristPasses,
    affiliateExperiences: city.affiliateExperiences,
    mapRegion: city.mapRegion,
  };
}

/** Hub quartier mock (offline / `!isApiConfigured()`). */
export function mockDistrictToHubData(
  cityName: string,
  citySlug: string,
  district: MockDistrict,
): TerritorialHubData {
  const places = resolveMockPlacesByIds(district.mustSeePoiIds).map((p) =>
    p.id === district.anchorPoiId
      ? {
          ...p,
          districtHub: {
            citySlug,
            districtSlug: district.slug,
          } satisfies DistrictHubRef,
        }
      : p,
  );
  // Ancre peut ne pas être dans must-see : on n’enrichit que les lieux résolus.
  return {
    citySlug,
    districtSlug: district.slug,
    name: district.name,
    coverImageUrl: district.coverImageUrl,
    subtitle: district.subtitle,
    mustSeePlaces: places,
    recommendedPlaces: resolveMockPlacesByIds(district.recommendedPoiIds),
    featuredPremiumItineraryId: district.featuredPremiumItineraryId,
    touristPasses: [],
    affiliateExperiences: district.affiliateExperiences,
    parentCityName: cityName,
    mapRegion: district.mapRegion,
  };
}
