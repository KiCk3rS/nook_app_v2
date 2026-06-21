import { getDistrictByAnchorPoiId } from '../constants/mockDistricts';
import type { MockPlace } from '../constants/mockPlaces';

export function getPlaceHref(place: MockPlace): string {
  const district = getDistrictByAnchorPoiId(place.id);
  if (district) {
    return `/city/${district.citySlug}/district/${district.slug}`;
  }
  return `/place/${place.id}`;
}

export function getPlaceHrefById(placeId: string): string {
  const district = getDistrictByAnchorPoiId(placeId);
  if (district) {
    return `/city/${district.citySlug}/district/${district.slug}`;
  }
  return `/place/${placeId}`;
}
