import type { AudioGuide, MockPlace } from '../../constants/mockPlaces';
import { PLACE_IMAGE_PLACEHOLDER } from '../../constants/placeImages';
import { getPlaceCategoryLabel } from '../i18n/categoryLabels';
import type {
  AudioTrack,
  PoiCategory,
  PoiDetail,
  PoiSummary,
  PublicationStatus,
} from '../../types/api';
import type {
  CatalogueCategory,
  CataloguePlaceMarker,
  CataloguePlacePreview,
} from '../../types/catalogue';
import type { DistrictHubRef } from '../../types/api';

function primaryCategory(categories: PoiCategory[]): PoiCategory | undefined {
  return categories[0];
}

/** Champs communs summary / snippet hub → carte compacte. */
export interface PoiCardLike {
  id: string;
  title: string;
  lat: number | null;
  lng: number | null;
  categories: PoiCategory[];
  parentPoiId?: string | null;
  coverImageUrl?: string | null;
  status?: PublicationStatus;
  districtHub?: DistrictHubRef | null;
}

export function poiCardLikeToMockPlace(poi: PoiCardLike): MockPlace {
  const cat = primaryCategory(poi.categories);
  return {
    id: poi.id,
    name: poi.title,
    latitude: poi.lat ?? 0,
    longitude: poi.lng ?? 0,
    categoryId: cat?.slug ?? 'monument',
    address: '',
    imageUrl: poi.coverImageUrl?.trim() || PLACE_IMAGE_PLACEHOLDER,
    description: '',
    audioGuides: [],
    parentId: poi.parentPoiId ?? undefined,
    publicationStatus: poi.status,
    districtHub: poi.districtHub ?? null,
  };
}

export function getCategoryDisplayLabel(
  categoryId: string,
  apiLabel?: string,
): string {
  if (apiLabel?.trim()) return apiLabel;
  return getPlaceCategoryLabel(categoryId);
}

export function categoryDtoToCatalogueCategory(item: {
  id: string;
  slug: string;
  label: string;
}): CatalogueCategory {
  return { id: item.id, slug: item.slug, label: item.label };
}

export function poiSummaryToMarker(poi: PoiSummary): CataloguePlaceMarker {
  const cat = primaryCategory(poi.categories);
  return {
    id: poi.id,
    name: poi.title,
    latitude: poi.lat,
    longitude: poi.lng,
    categoryId: cat?.slug ?? 'monument',
    categoryLabel: cat?.label,
    parentId: poi.parentPoiId ?? null,
    publicationStatus: poi.status,
    districtHub: poi.districtHub ?? null,
  };
}

export function poiSummaryToPreview(
  poi: PoiSummary,
  options?: { readyAudioCount?: number },
): CataloguePlacePreview {
  const marker = poiSummaryToMarker(poi);
  return {
    ...marker,
    imageUrl: null,
    address: null,
    readyAudioCount: options?.readyAudioCount ?? 0,
  };
}

export function markerToPreview(marker: CataloguePlaceMarker): CataloguePlacePreview {
  return {
    ...marker,
    imageUrl: null,
    address: null,
    readyAudioCount: 0,
  };
}

export function mockPlaceToMarker(place: MockPlace): CataloguePlaceMarker {
  return {
    id: place.id,
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    categoryId: place.categoryId,
    parentId: place.parentId ?? null,
    publicationStatus: place.publicationStatus,
    districtHub: place.districtHub ?? null,
  };
}

export function mockPlaceToPreview(place: MockPlace): CataloguePlacePreview {
  return {
    ...mockPlaceToMarker(place),
    imageUrl: place.imageUrl,
    address: place.address,
    readyAudioCount: place.audioGuides.filter((g) => g.status === 'ready').length,
  };
}

export function audioTrackToAudioGuide(track: AudioTrack): AudioGuide {
  return {
    id: track.id,
    title: track.title?.trim() || 'Guide audio',
    summary: track.attribution?.trim() || '',
    durationSec: track.durationSeconds,
    language: track.language.toUpperCase(),
    authorName: track.attribution?.trim() || 'NOOK',
    publishedAt: '',
    status: 'ready',
    rating: null,
  };
}

function resolveDetailImageUrl(detail: PoiDetail): string {
  const cover = detail.coverImage?.url?.trim();
  if (cover) {
    return cover;
  }
  return PLACE_IMAGE_PLACEHOLDER;
}

export function poiDetailToMockPlace(detail: PoiDetail): MockPlace {
  const cat = primaryCategory(detail.categories);
  return {
    id: detail.id,
    name: detail.title,
    latitude: detail.lat ?? 0,
    longitude: detail.lng ?? 0,
    categoryId: cat?.slug ?? 'monument',
    address: detail.address?.trim() ?? '',
    imageUrl: resolveDetailImageUrl(detail),
    description: detail.description?.trim() ?? '',
    audioGuides: (detail.audios ?? []).map(audioTrackToAudioGuide),
    parentId: detail.parentPoiId ?? undefined,
    publicationStatus: detail.status,
    wikipediaUrl: detail.wikipediaUrl?.trim() || undefined,
    districtHub: detail.districtHub ?? null,
  };
}

export function poiSummaryToMockPlaceSummary(poi: PoiSummary): MockPlace {
  return poiCardLikeToMockPlace({
    id: poi.id,
    title: poi.title,
    lat: poi.lat,
    lng: poi.lng,
    categories: poi.categories,
    parentPoiId: poi.parentPoiId,
    status: poi.status,
    districtHub: poi.districtHub,
  });
}
