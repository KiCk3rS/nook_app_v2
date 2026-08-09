import type {
  AffiliateExperienceItem,
  MockCity,
  TouristPassItem,
} from '../../constants/mockCities';
import type { MockDistrict } from '../../constants/mockDistricts';
import { itineraryCategories } from '../../constants/itineraryCategories';
import {
  countItinerariesByCategory,
  getItineraryById,
} from '../../constants/mockItineraries';
import { getPlaceById, type MockPlace } from '../../constants/mockPlaces';
import { PLACE_IMAGE_PLACEHOLDER } from '../../constants/placeImages';
import type {
  CityHub,
  CityHubMap,
  CityHubPoiSnippet,
  DistrictHub,
  DistrictHubRef,
  EditorialItinerary,
} from '../../types/api';
import {
  mapEditorialItineraryCategoryCounts,
  mapEditorialItineraryHubSummary,
} from './editorialItineraries';
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
  featuredPremiumItinerary: EditorialItinerary | null;
  itineraryCategoryCounts: Record<string, number>;
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

function mockFeaturedFromId(
  featuredId: string | null | undefined,
): EditorialItinerary | null {
  if (!featuredId) return null;
  return getItineraryById(featuredId) ?? null;
}

function mockCategoryCounts(
  citySlug: string,
  districtSlug?: string,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const cat of itineraryCategories) {
    const n = countItinerariesByCategory(citySlug, cat.slug, districtSlug);
    if (n > 0) counts[cat.slug] = n;
  }
  return counts;
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
    | 'itineraryCategories'
    | 'featuredPremiumItinerary'
  >,
  extras: Pick<
    TerritorialHubData,
    'citySlug' | 'districtSlug' | 'parentCityName'
  > & {
    featuredPremiumItinerary?: EditorialItinerary | null;
    itineraryCategoryCounts?: Record<string, number>;
    touristPasses?: TouristPassItem[];
    affiliateExperiences?: AffiliateExperienceItem[];
  },
): TerritorialHubData {
  const featured =
    extras.featuredPremiumItinerary ??
    mapEditorialItineraryHubSummary(
      hub.featuredPremiumItinerary,
      extras.citySlug,
      extras.districtSlug ?? null,
    );

  return {
    citySlug: extras.citySlug,
    districtSlug: extras.districtSlug,
    name: hub.name,
    coverImageUrl: hub.coverImage?.url?.trim() || PLACE_IMAGE_PLACEHOLDER,
    subtitle: hub.subtitle?.trim() ?? '',
    mustSeePlaces: mapHubPois(hub.mustSeePois),
    recommendedPlaces: mapHubPois(hub.recommendedPois),
    featuredPremiumItinerary: featured,
    itineraryCategoryCounts:
      extras.itineraryCategoryCounts ??
      mapEditorialItineraryCategoryCounts(hub.itineraryCategories),
    touristPasses: extras.touristPasses ?? [],
    affiliateExperiences: extras.affiliateExperiences ?? [],
    parentCityName: extras.parentCityName,
    mapRegion: hubMapToRegion(hub.map),
  };
}

/**
 * `GET /cities/:slug/hub` → données TerritorialHubView.
 * Pass / expériences : stubs API vides jusqu’à F-018-d.
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
  const featured = mockFeaturedFromId(city.featuredPremiumItineraryId);
  return {
    citySlug: city.slug,
    name: city.name,
    coverImageUrl: city.coverImageUrl,
    subtitle: city.subtitle,
    mustSeePlaces: resolveMockPlacesByIds(city.mustSeePoiIds),
    recommendedPlaces: resolveMockPlacesByIds(city.recommendedPoiIds),
    featuredPremiumItinerary: featured,
    itineraryCategoryCounts: mockCategoryCounts(city.slug),
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
  const featured = mockFeaturedFromId(district.featuredPremiumItineraryId);
  return {
    citySlug,
    districtSlug: district.slug,
    name: district.name,
    coverImageUrl: district.coverImageUrl,
    subtitle: district.subtitle,
    mustSeePlaces: places,
    recommendedPlaces: resolveMockPlacesByIds(district.recommendedPoiIds),
    featuredPremiumItinerary: featured,
    itineraryCategoryCounts: mockCategoryCounts(citySlug, district.slug),
    touristPasses: [],
    affiliateExperiences: district.affiliateExperiences,
    parentCityName: cityName,
    mapRegion: district.mapRegion,
  };
}
