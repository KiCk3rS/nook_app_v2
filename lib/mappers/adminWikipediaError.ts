import { ApiError } from '../../types/api';

/** Clés i18n `adminAddPlace` pour erreurs search / create. */
export type AdminWikipediaErrorKey =
  | 'errorForbidden'
  | 'errorUnauthorized'
  | 'errorValidation'
  | 'errorRateLimited'
  | 'errorNetwork'
  | 'errorGeneric';

export function mapAdminWikipediaErrorKey(
  error: unknown,
): AdminWikipediaErrorKey {
  if (!(error instanceof ApiError)) {
    return 'errorGeneric';
  }
  if (error.statusCode === 403) return 'errorForbidden';
  if (ApiError.isUnauthorized(error)) return 'errorUnauthorized';
  if (ApiError.isValidation(error)) return 'errorValidation';
  if (ApiError.isRateLimited(error)) return 'errorRateLimited';
  if (error.statusCode === 0 || error.statusCode >= 500) return 'errorNetwork';
  return 'errorGeneric';
}
