export interface User {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  birthDate: string | null;
  role: string;
}

/** Réponse paginée standard (listes POI, discovery, favoris, etc.). */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface PoiCategory {
  slug: string;
  label: string;
}

/** Item carte / liste POI (`GET /api/v1/pois`). */
export interface PoiSummary {
  id: string;
  title: string;
  lat: number;
  lng: number;
  categories: PoiCategory[];
  parentPoiId?: string | null;
}

export interface PoiDetailImage {
  id: string;
  sortOrder: number;
  altText: string | null;
}

export interface PoiDetailPopularity {
  averageRating: number | null;
  reviewCount: number | null;
  playCountTotal: number | null;
  playCountLast7Days: number | null;
}

/** Fiche POI (`GET /api/v1/pois/:id`). */
export interface PoiDetail {
  id: string;
  title: string;
  description: string | null;
  parentPoiId: string | null;
  childrenCount: number;
  lat: number | null;
  lng: number | null;
  categories: PoiCategory[];
  images: PoiDetailImage[];
  audios?: AudioTrack[];
  popularity: PoiDetailPopularity | null;
}

export interface DiscoveryCoverImage {
  id: string;
  url: string;
  expiresAt: string;
  altText: string | null;
}

export interface DiscoveryPopularity {
  averageRating: number | null;
  reviewCount: number | null;
  playCountLast7Days: number | null;
  playCountTotal: number | null;
}

/** Item feed découverte (`GET /api/v1/discovery/*`). */
export interface DiscoveryItem {
  id: string;
  title: string;
  parentPoiId: string | null;
  lat: number | null;
  lng: number | null;
  categories: PoiCategory[];
  publishedAt: string | null;
  popularity: DiscoveryPopularity | null;
  coverImage: DiscoveryCoverImage | null;
}

export interface AudioAudience {
  slug: string;
  label: string;
}

/** Métadonnées piste audio publiée (`GET /api/v1/pois/:poiId/audios`). */
export interface AudioTrack {
  id: string;
  title: string | null;
  language: string;
  durationSeconds: number | null;
  sortOrder: number;
  sourceType: 'MANUAL' | 'WIKIPEDIA' | 'OTHER';
  attribution: string | null;
  mimeType: string | null;
  audienceCategories: AudioAudience[];
}

/** URL de lecture pré-signée (`GET .../audios/:audioId/playback`). */
export interface PlaybackUrl {
  playbackUrl: string;
  expiresAt: string;
}

export interface UserPreferences {
  language?: 'fr' | 'en';
  notifications?: {
    pushEnabled?: boolean;
    routeReminders?: boolean;
    marketingEnabled?: boolean;
  };
  units?: 'metric';
}

export interface MeProfile extends User {
  preferences?: UserPreferences;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface UserItinerary {
  id: string;
  title: string;
  stepCount?: number;
  poiIds?: string[];
  estimatedDurationMinutes?: number | null;
  distanceMeters?: number | null;
  difficulty?: string | null;
  updatedAt?: string;
  createdAt?: string;
}

export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  details?: Record<string, string[]>;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: Record<string, string[]>;
  readonly code?: string;

  constructor(
    message: string,
    statusCode: number,
    options?: { details?: Record<string, string[]>; code?: string },
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = options?.details;
    this.code = options?.code;
  }

  static isRateLimited(error: unknown): boolean {
    return error instanceof ApiError && error.statusCode === 429;
  }

  static isUnauthorized(error: unknown): boolean {
    return error instanceof ApiError && error.statusCode === 401;
  }

  static isConflict(error: unknown): boolean {
    return error instanceof ApiError && error.statusCode === 409;
  }

  static isValidation(error: unknown): boolean {
    return error instanceof ApiError && error.statusCode === 422;
  }
}
