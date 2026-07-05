import {
  assertApiAuthAvailable,
  shouldAllowMockLogin,
  shouldFallbackToMockAfterLoginFailure,
} from '../demoSessionPolicy';
import { ApiError } from '../../../types/api';

describe('demoSessionPolicy', () => {
  describe('shouldAllowMockLogin', () => {
    it('autorise la démo explicite même avec API', () => {
      expect(shouldAllowMockLogin(true, true)).toBe(true);
    });

    it('autorise le mock sans API', () => {
      expect(shouldAllowMockLogin(false, false)).toBe(true);
    });

    it('refuse le mock implicite quand l’API est configurée', () => {
      expect(shouldAllowMockLogin(true, false)).toBe(false);
    });
  });

  describe('assertApiAuthAvailable', () => {
    it('lève une ApiError sans API configurée', () => {
      expect(() => assertApiAuthAvailable(false)).toThrow(ApiError);
      expect(() => assertApiAuthAvailable(false)).toThrow(/non configuré/i);
    });

    it('ne lève pas quand l’API est configurée', () => {
      expect(() => assertApiAuthAvailable(true)).not.toThrow();
    });
  });

  describe('shouldFallbackToMockAfterLoginFailure', () => {
    it('ne bascule pas en mock quand l’API est configurée', () => {
      expect(shouldFallbackToMockAfterLoginFailure(true)).toBe(false);
    });

    it('peut basculer en mock seulement sans API', () => {
      expect(shouldFallbackToMockAfterLoginFailure(false)).toBe(true);
    });
  });
});
