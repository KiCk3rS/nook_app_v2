export interface User {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  birthDate: string | null;
  role: string;
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
