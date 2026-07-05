import type { MockPlace } from '../constants/mockPlaces';
import { getPlaceById } from '../constants/mockPlaces';
import type { UserItineraryStep } from '../types/api';

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface ParsedFocusItinerary {
  itineraryId: string;
  stepIndex?: number;
}

/** Point d'étape unifié pour guidage et cartes (API ou mock). */
export interface GuidanceStepPoint {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl?: string;
  address?: string;
}

/** Param route : `{itineraryId}` ou `{itineraryId}/{stepIndex}` (step 0-based). */
export function parseFocusItineraryParam(param: string): ParsedFocusItinerary | null {
  const trimmed = param.trim();
  if (!trimmed) return null;

  const slash = trimmed.lastIndexOf('/');
  if (slash === -1) {
    return { itineraryId: trimmed };
  }

  const itineraryId = trimmed.slice(0, slash);
  const stepRaw = trimmed.slice(slash + 1);
  const stepIndex = parseInt(stepRaw, 10);

  if (!itineraryId || Number.isNaN(stepIndex) || stepIndex < 0) {
    return { itineraryId: trimmed };
  }

  return { itineraryId, stepIndex };
}

export function buildFocusItineraryParam(itineraryId: string, stepIndex?: number): string {
  if (stepIndex == null || stepIndex < 0) {
    return itineraryId;
  }
  return `${itineraryId}/${stepIndex}`;
}

export function resolveItineraryPlaces(stepPoiIds: string[]): MockPlace[] {
  return stepPoiIds
    .map((id) => getPlaceById(id))
    .filter((place): place is MockPlace => place !== undefined);
}

export function guidanceStepsFromPoiIds(poiIds: string[]): GuidanceStepPoint[] {
  return poiIds.map((poiId) => {
    const place = getPlaceById(poiId);
    return {
      id: poiId,
      name: place?.name ?? poiId,
      latitude: place?.latitude ?? null,
      longitude: place?.longitude ?? null,
      imageUrl: place?.imageUrl,
      address: place?.address,
    };
  });
}

export function guidanceStepsFromPlaces(places: MockPlace[]): GuidanceStepPoint[] {
  return places.map((place) => ({
    id: place.id,
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    imageUrl: place.imageUrl,
    address: place.address,
  }));
}

export function guidanceStepsFromApiSteps(steps: UserItineraryStep[]): GuidanceStepPoint[] {
  return [...steps]
    .sort((a, b) => a.order - b.order)
    .map((step) => {
      const place = getPlaceById(step.poiId);
      return {
        id: step.poiId,
        name: step.title || place?.name || step.poiId,
        latitude: step.lat ?? place?.latitude ?? null,
        longitude: step.lng ?? place?.longitude ?? null,
        imageUrl: place?.imageUrl,
        address: place?.address,
      };
    });
}

export function getRegionForPlaces(places: MockPlace[]): MapRegion | null {
  return getRegionForGuidanceSteps(guidanceStepsFromPlaces(places));
}

export function getCoordinatesForPlaces(places: MockPlace[]) {
  return getCoordinatesForGuidanceSteps(guidanceStepsFromPlaces(places));
}

export function getRegionForGuidanceSteps(
  steps: GuidanceStepPoint[],
): MapRegion | null {
  const withCoords = steps.filter(
    (step) => step.latitude != null && step.longitude != null,
  ) as Array<GuidanceStepPoint & { latitude: number; longitude: number }>;

  if (withCoords.length === 0) return null;

  const lats = withCoords.map((step) => step.latitude);
  const lngs = withCoords.map((step) => step.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latDelta = Math.max((maxLat - minLat) * 1.6, 0.01);
  const lngDelta = Math.max((maxLng - minLng) * 1.6, 0.01);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

export function getCoordinatesForGuidanceSteps(steps: GuidanceStepPoint[]) {
  return steps
    .filter(
      (step): step is GuidanceStepPoint & { latitude: number; longitude: number } =>
        step.latitude != null && step.longitude != null,
    )
    .map((step) => ({
      latitude: step.latitude,
      longitude: step.longitude,
    }));
}

export function clampStepIndex(stepIndex: number | undefined, stepCount: number): number | undefined {
  if (stepIndex == null || stepCount <= 0) return undefined;
  return Math.min(Math.max(stepIndex, 0), stepCount - 1);
}
