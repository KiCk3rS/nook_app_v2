import type { UserItinerary } from '../../types/api';
import { apiRequest } from './client';

export interface ListItinerariesQuery {
  limit?: number;
  offset?: number;
}

export function fetchItineraries(
  query: ListItinerariesQuery = {},
): Promise<UserItinerary[]> {
  const params = new URLSearchParams();
  if (query.limit != null) params.set('limit', String(query.limit));
  if (query.offset != null) params.set('offset', String(query.offset));
  const qs = params.toString();
  return apiRequest<UserItinerary[]>(`/itineraries${qs ? `?${qs}` : ''}`, {
    auth: true,
  });
}

export interface UserItineraryDetail extends UserItinerary {
  poiIds: string[];
}

export function fetchItineraryById(id: string): Promise<UserItineraryDetail> {
  return apiRequest<UserItineraryDetail>(`/itineraries/${id}`, { auth: true });
}

export function deleteItinerary(id: string): Promise<void> {
  return apiRequest<void>(`/itineraries/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}
