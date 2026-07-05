type GlobalWithDev = typeof globalThis & { __DEV__?: boolean };

describe('config', () => {
  const globalDev = globalThis as GlobalWithDev;
  const originalDev = globalDev.__DEV__;

  afterEach(() => {
    globalDev.__DEV__ = originalDev;
    jest.resetModules();
    jest.dontMock('expo-constants');
  });

  function loadConfig(apiBaseUrl: string) {
    jest.resetModules();
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: {
        expoConfig: {
          extra: { apiBaseUrl },
          version: '1.0.0',
        },
      },
    }));
    return require('../config') as typeof import('../config');
  }

  describe('getApiBaseUrl', () => {
    it('retire le slash final', () => {
      expect(loadConfig('http://localhost:3000/').getApiBaseUrl()).toBe(
        'http://localhost:3000',
      );
    });

    it('retourne une chaîne vide sans configuration', () => {
      const config = loadConfig('');
      expect(config.getApiBaseUrl()).toBe('');
      expect(config.isApiConfigured()).toBe(false);
    });
  });

  describe('shouldShowDemoLogin', () => {
    it('est true sans API', () => {
      globalDev.__DEV__ = false;
      expect(loadConfig('').shouldShowDemoLogin()).toBe(true);
    });

    it('est false avec API en production', () => {
      globalDev.__DEV__ = false;
      expect(loadConfig('http://localhost:3000').shouldShowDemoLogin()).toBe(false);
    });

    it('est true en dev même avec API', () => {
      globalDev.__DEV__ = true;
      expect(loadConfig('http://localhost:3000').shouldShowDemoLogin()).toBe(true);
    });
  });
});
