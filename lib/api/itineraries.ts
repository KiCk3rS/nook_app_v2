import type {
  ItineraryDifficulty,
  PaginatedResponse,
  UserItinerary,
  UserItineraryStep,
} from '../../types/api';
import {
  buildItinerariesLoadMoreQuery,
  ITINERARIES_PAGE_SIZE,
  mapItineraryDetailResponse,
  type ItineraryDetailApiResponse,
} from '../mappers/itineraries';
import { apiRequest, buildQuery } from './client';

export interface ListItinerariesQuery {
  limit?: number;
  offset?: number;
}

export function fetchItineraries(
  query: ListItinerariesQuery = {},
): Promise<PaginatedResponse<UserItinerary>> {
  const qs = buildQuery({
    limit: query.limit ?? ITINERARIES_PAGE_SIZE,
    offset: query.offset ?? 0,
  });
  return apiRequest<PaginatedResponse<UserItinerary>>(
    `/itineraries?${qs}`,
    { auth: true },
  );
}

export interface UserItineraryDetail extends UserItinerary {
  steps: UserItineraryStep[];
  poiIds: string[];
}

export interface CreateItineraryPayload {
  title: string;
  poiIds: string[];
  estimatedDurationMinutes?: number;
  distanceMeters?: number;
  difficulty?: ItineraryDifficulty;
}

export interface PatchItineraryPayload {
  title?: string;
  poiIds?: string[];
  estimatedDurationMinutes?: number | null;
  distanceMeters?: number | null;
  difficulty?: ItineraryDifficulty;
}

export async function fetchItineraryById(id: string): Promise<UserItineraryDetail> {
  const raw = await apiRequest<ItineraryDetailApiResponse>(`/itineraries/${id}`, {
    auth: true,
  });
  return mapItineraryDetailResponse(raw);
}

export async function createItinerary(
  payload: CreateItineraryPayload,
): Promise<UserItineraryDetail> {
  const raw = await apiRequest<ItineraryDetailApiResponse>('/itineraries', {
    method: 'POST',
    body: payload,
    auth: true,
  });
  return mapItineraryDetailResponse(raw);
}

export async function patchItinerary(
  id: string,
  payload: PatchItineraryPayload,
): Promise<UserItineraryDetail> {
  const raw = await apiRequest<ItineraryDetailApiResponse>(`/itineraries/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
  return mapItineraryDetailResponse(raw);
}

export function deleteItinerary(id: string): Promise<void> {
  return apiRequest<void>(`/itineraries/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export { buildItinerariesLoadMoreQuery, ITINERARIES_PAGE_SIZE };
