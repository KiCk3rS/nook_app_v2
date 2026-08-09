import type {
  AffiliateExperienceItem,
  MockCity,
  TouristPassItem,
} from '../../constants/mockCities';
import type { MockDistrict } from '../../constants/mockDistricts';
import { getPlaceById, type MockPlace } from '../../constants/mockPlaces';
import { PLACE_IMAGE_PLACEHOLDER } from '../../constants/placeImages';
import type { CityHub, CityHubPoiSnippet } from '../../types/api';
import { poiCardLikeToMockPlace } from './poi';

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
}

function resolveMockPlacesByIds(ids: string[]): MockPlace[] {
  return ids
    .map((id) => getPlaceById(id))
    .filter((p): p is MockPlace => p !== undefined);
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
  });
}

/**
 * `GET /cities/:slug/hub` → données TerritorialHubView.
 * Pass / premium / expériences : stubs API vides jusqu’à F-018-d / T21.
 * Catégories éditoriales : encore mock côté vue (T21).
 */
export function cityHubToHubData(hub: CityHub): TerritorialHubData {
  return {
    citySlug: hub.slug,
    name: hub.name,
    coverImageUrl: hub.coverImage?.url?.trim() || PLACE_IMAGE_PLACEHOLDER,
    subtitle: hub.subtitle?.trim() ?? '',
    mustSeePlaces: hub.mustSeePois.map(cityHubPoiSnippetToMockPlace),
    recommendedPlaces: hub.recommendedPois.map(cityHubPoiSnippetToMockPlace),
    featuredPremiumItineraryId: null,
    touristPasses: [],
    affiliateExperiences: [],
  };
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
  };
}

/** Hub quartier mock (T19 API plus tard). */
export function mockDistrictToHubData(
  cityName: string,
  citySlug: string,
  district: MockDistrict,
): TerritorialHubData {
  return {
    citySlug,
    districtSlug: district.slug,
    name: district.name,
    coverImageUrl: district.coverImageUrl,
    subtitle: district.subtitle,
    mustSeePlaces: resolveMockPlacesByIds(district.mustSeePoiIds),
    recommendedPlaces: resolveMockPlacesByIds(district.recommendedPoiIds),
    featuredPremiumItineraryId: district.featuredPremiumItineraryId,
    touristPasses: [],
    affiliateExperiences: district.affiliateExperiences,
    parentCityName: cityName,
  };
}
