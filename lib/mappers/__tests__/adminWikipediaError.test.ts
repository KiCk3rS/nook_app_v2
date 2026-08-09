import { ApiError } from '../../../types/api';
import { mapAdminWikipediaErrorKey } from '../adminWikipediaError';

describe('mapAdminWikipediaErrorKey', () => {
  it('mappe 403 / 401 / 422 / 429', () => {
    expect(mapAdminWikipediaErrorKey(new ApiError('x', 403))).toBe(
      'errorForbidden',
    );
    expect(mapAdminWikipediaErrorKey(new ApiError('x', 401))).toBe(
      'errorUnauthorized',
    );
    expect(mapAdminWikipediaErrorKey(new ApiError('x', 422))).toBe(
      'errorValidation',
    );
    expect(mapAdminWikipediaErrorKey(new ApiError('x', 429))).toBe(
      'errorRateLimited',
    );
  });

  it('mappe timeout / 5xx vers errorNetwork', () => {
    expect(mapAdminWikipediaErrorKey(new ApiError('x', 0))).toBe(
      'errorNetwork',
    );
    expect(mapAdminWikipediaErrorKey(new ApiError('x', 503))).toBe(
      'errorNetwork',
    );
  });

  it('mappe le reste vers errorGeneric', () => {
    expect(mapAdminWikipediaErrorKey(new ApiError('x', 418))).toBe(
      'errorGeneric',
    );
    expect(mapAdminWikipediaErrorKey(new Error('boom'))).toBe('errorGeneric');
  });
});
