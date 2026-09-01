import { getDistrictByAnchorPoiId } from '../constants/mockDistricts';
import { isMockSiteHubPoiId } from '../constants/mockSiteHubs';
import { isApiConfigured } from './config';
import type { MockPlace } from '../constants/mockPlaces';
import type { CataloguePlaceMarker } from '../types/catalogue';

type PlaceLike = Pick<MockPlace, 'id' | 'presentation'> & {
  districtHub?: { citySlug: string; districtSlug: string } | null;
};

function hrefFromDistrictHub(
  hub: { citySlug: string; districtSlug: string } | null | undefined,
): string | null {
  if (!hub?.citySlug || !hub.districtSlug) return null;
  return `/city/${hub.citySlug}/district/${hub.districtSlug}`;
}

function resolveDistrictHref(place: PlaceLike): string | null {
  const fromDto = hrefFromDistrictHub(place.districtHub);
  if (fromDto) return fromDto;

  // Offline / démo : table mock. En API, le contrat `districtHub` sur le POI suffit.
  if (!isApiConfigured()) {
    const district = getDistrictByAnchorPoiId(place.id);
    if (district) {
      return `/city/${district.citySlug}/district/${district.slug}`;
    }
  }

  return null;
}

function resolveSiteHref(place: PlaceLike): string | null {
  if (place.presentation === 'HUB') {
    return `/place/${place.id}/hub`;
  }
  if (!isApiConfigured() && isMockSiteHubPoiId(place.id)) {
    return `/place/${place.id}/hub`;
  }
  return null;
}

export function getPlaceHref(place: PlaceLike): string {
  return resolveDistrictHref(place) ?? resolveSiteHref(place) ?? `/place/${place.id}`;
}

export function getPlaceHrefById(placeId: string): string {
  return getPlaceHref({ id: placeId });
}

/** Marqueur carte → même règle que MockPlace. */
export function getMarkerHref(marker: CataloguePlaceMarker): string {
  return getPlaceHref(marker);
}
