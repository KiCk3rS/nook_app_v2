import {
  buildProfileStats,
  mapRecentListensFromHistory,
  resolveFavoritesCount,
  resolveListenCount,
} from '../profileStats';
import type { ListenHistoryEntry } from '../../../types/api';

const sampleEntry: ListenHistoryEntry = {
  id: 'lh-1',
  audioId: 'audio-1',
  poiId: 'poi-1',
  listenedAt: '2026-07-05T10:00:00.000Z',
  progressSeconds: 120,
  audio: {
    id: 'audio-1',
    title: 'Guide du Louvre',
    durationSeconds: 600,
  },
  poi: {
    title: 'Musée du Louvre',
    status: 'PUBLISHED',
  },
};

describe('profileStats', () => {
  describe('resolveFavoritesCount', () => {
    it('additionne lieux et parcours en mode mock', () => {
      expect(
        resolveFavoritesCount({
          useMockData: true,
          placeFavoritesCount: 3,
          itineraryFavoritesCount: 2,
        }),
      ).toBe(5);
    });

    it('ne compte que les lieux côté API', () => {
      expect(
        resolveFavoritesCount({
          useMockData: false,
          placeFavoritesCount: 4,
          itineraryFavoritesCount: 2,
        }),
      ).toBe(4);
    });
  });

  describe('resolveListenCount', () => {
    it('utilise le total API hors mock', () => {
      expect(resolveListenCount({ total: 12, items: [] }, 0, false)).toBe(12);
    });

    it('retombe à 0 si l’historique API est absent', () => {
      expect(resolveListenCount(null, 0, false)).toBe(0);
    });

    it('utilise le compteur mock en session démo', () => {
      expect(resolveListenCount({ total: 12, items: [] }, 24, true)).toBe(24);
    });
  });

  describe('buildProfileStats', () => {
    it('agrège favoris et écoutes depuis l’API', () => {
      const stats = buildProfileStats({
        useMockData: false,
        routesCount: 2,
        placeFavoritesCount: 5,
        itineraryFavoritesCount: 1,
        listenHistory: { total: 8, items: [sampleEntry] },
        mockListenCount: 24,
        mockCitiesCount: 2,
        memberSinceLabel: 'mock',
      });

      expect(stats).toEqual({
        routesCount: 2,
        favoritesCount: 5,
        listenCount: 8,
        citiesCount: 0,
        memberSinceLabel: undefined,
      });
    });
  });

  describe('mapRecentListensFromHistory', () => {
    it('mappe les entrées API vers les cartes récentes', () => {
      const recent = mapRecentListensFromHistory([sampleEntry], 'fr', 3);

      expect(recent).toHaveLength(1);
      expect(recent[0]).toMatchObject({
        placeId: 'poi-1',
        name: 'Musée du Louvre',
        durationLabel: '10:00',
      });
      expect(recent[0]?.listenedAtLabel.length).toBeGreaterThan(0);
    });
  });
});
