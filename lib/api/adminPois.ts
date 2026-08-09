import { apiRequest } from './client';

export type AdminPoiPublicationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface AdminPoiCategory {
  id: string;
  slug: string;
  label: string;
}

export interface AdminPoiImage {
  id: string;
  sortOrder: number;
  altText: string | null;
}

/** Réponse `AdminPoiResponseDto` (création / détail admin). */
export interface AdminPoi {
  id: string;
  title: string;
  description: string | null;
  status: AdminPoiPublicationStatus;
  publishedAt: string | null;
  parentPoiId: string | null;
  lat: number | null;
  lng: number | null;
  wikipediaUrl: string | null;
  categories: AdminPoiCategory[];
  images: AdminPoiImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePoiFromWikipediaPayload {
  wikipediaUrl: string;
  status?: AdminPoiPublicationStatus;
  categoryIds?: string[];
  lat?: number | null;
  lng?: number | null;
}

/** `POST /api/v1/admin/pois/from-wikipedia` — JWT ADMIN requis. */
export function createPoiFromWikipedia(
  payload: CreatePoiFromWikipediaPayload,
): Promise<AdminPoi> {
  return apiRequest<AdminPoi>('/admin/pois/from-wikipedia', {
    method: 'POST',
    auth: true,
    body: payload,
  });
}
