import type { MapRegion } from '../itineraryMap';

/** Convertit une région carte en bbox API : `minLng,minLat,maxLng,maxLat`. */
export function regionToBbox(region: MapRegion): string {
  const minLat = region.latitude - region.latitudeDelta / 2;
  const maxLat = region.latitude + region.latitudeDelta / 2;
  const minLng = region.longitude - region.longitudeDelta / 2;
  const maxLng = region.longitude + region.longitudeDelta / 2;
  return `${minLng},${minLat},${maxLng},${maxLat}`;
}
