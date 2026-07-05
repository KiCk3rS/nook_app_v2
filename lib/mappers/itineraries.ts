import type {
  PaginatedResponse,
  UserItineraryStep,
} from '../../types/api';
import type { UserItineraryDetail } from '../api/itineraries';

export const ITINERARIES_PAGE_SIZE = 20;

/** Réponse brute GET/POST/PATCH `/itineraries/:id`. */
export interface ItineraryDetailApiResponse {
  id: string;
  title: string;
  estimatedDurationMinutes: number | null;
  distanceMeters: number | null;
  difficulty: string;
  steps: UserItineraryStep[];
  createdAt: string;
  updatedAt: string;
}

export function mapItineraryDetailResponse(
  raw: ItineraryDetailApiResponse,
): UserItineraryDetail {
  const steps = [...raw.steps].sort((a, b) => a.order - b.order);
  return {
    id: raw.id,
    title: raw.title,
    stepCount: steps.length,
    estimatedDurationMinutes: raw.estimatedDurationMinutes,
    distanceMeters: raw.distanceMeters,
    difficulty: raw.difficulty as UserItineraryDetail['difficulty'],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    steps,
    poiIds: steps.map((step) => step.poiId),
  };
}

/** Retourne la query de la page suivante, ou `null` si tout est chargé. */
export function buildItinerariesLoadMoreQuery(
  page: Pick<PaginatedResponse<unknown>, 'offset' | 'limit' | 'total'>,
): { limit: number; offset: number } | null {
  const nextOffset = page.offset + page.limit;
  if (nextOffset >= page.total) {
    return null;
  }
  return { limit: page.limit, offset: nextOffset };
}

/** Coordonnées ordonnées pour la polyligne de guidage (étapes avec lat/lng). */
export function stepsToCoordinates(
  steps: UserItineraryStep[],
): Array<{ latitude: number; longitude: number }> {
  return [...steps]
    .sort((a, b) => a.order - b.order)
    .filter(
      (step): step is UserItineraryStep & { lat: number; lng: number } =>
        step.lat != null && step.lng != null,
    )
    .map((step) => ({ latitude: step.lat, longitude: step.lng }));
}
