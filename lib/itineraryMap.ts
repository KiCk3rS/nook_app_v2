import type { MockPlace } from '../constants/mockPlaces';
import { getPlaceById } from '../constants/mockPlaces';

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
    .filter((place): place is MockPlace => place != null);
}

export function getRegionForPlaces(places: MockPlace[]): MapRegion | null {
  if (places.length === 0) return null;

  const lats = places.map((p) => p.latitude);
  const lngs = places.map((p) => p.longitude);
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

export function getCoordinatesForPlaces(places: MockPlace[]) {
  return places.map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));
}

export function clampStepIndex(stepIndex: number | undefined, stepCount: number): number | undefined {
  if (stepIndex == null || stepCount <= 0) return undefined;
  return Math.min(Math.max(stepIndex, 0), stepCount - 1);
}
