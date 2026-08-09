import type { MapRegion } from './itineraryMap';

/** Région carte passée depuis un hub (CTA « Voir sur la carte »). */
export function parseFocusMapRegion(params: {
  focusLat?: string;
  focusLng?: string;
  focusLatDelta?: string;
  focusLngDelta?: string;
}): MapRegion | null {
  const lat = Number(params.focusLat);
  const lng = Number(params.focusLng);
  const latitudeDelta = Number(params.focusLatDelta);
  const longitudeDelta = Number(params.focusLngDelta);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !Number.isFinite(latitudeDelta) ||
    !Number.isFinite(longitudeDelta) ||
    latitudeDelta <= 0 ||
    longitudeDelta <= 0
  ) {
    return null;
  }
  return { latitude: lat, longitude: lng, latitudeDelta, longitudeDelta };
}
