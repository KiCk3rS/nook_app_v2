import { ApiError } from '../../types/api';

export type ServiceHealthFailure = 'offline' | 'unavailable';

export function classifyHealthError(error: unknown): ServiceHealthFailure {
  if (error instanceof TypeError) {
    return 'offline';
  }
  if (error instanceof ApiError && error.statusCode === 0) {
    return 'offline';
  }
  return 'unavailable';
}
