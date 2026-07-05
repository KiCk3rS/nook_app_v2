import { classifyHealthError } from '../classifyHealthError';
import { ApiError } from '../../../types/api';

describe('classifyHealthError', () => {
  it('classe une erreur réseau comme offline', () => {
    expect(classifyHealthError(new TypeError('Network request failed'))).toBe('offline');
  });

  it('classe ApiError 0 comme offline', () => {
    expect(classifyHealthError(new ApiError('offline', 0))).toBe('offline');
  });

  it('classe les autres erreurs comme unavailable', () => {
    expect(classifyHealthError(new ApiError('down', 503))).toBe('unavailable');
    expect(classifyHealthError(new Error('boom'))).toBe('unavailable');
  });
});
