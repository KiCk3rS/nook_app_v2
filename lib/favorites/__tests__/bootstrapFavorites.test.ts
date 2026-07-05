import { bootstrapFavoritePlaces, shouldUseServerFavorites } from '../bootstrapFavorites';

jest.mock('../../config', () => ({
  shouldUseMockData: jest.fn((isMockSession: boolean) => isMockSession),
}));

jest.mock('../../favoritesStorage', () => ({
  loadStoredFavorites: jest.fn(),
  saveStoredFavorites: jest.fn(),
}));

jest.mock('../../api/favorites', () => ({
  fetchAllFavorites: jest.fn(),
}));

const { shouldUseMockData } = jest.requireMock('../../config') as {
  shouldUseMockData: jest.Mock;
};
const { loadStoredFavorites, saveStoredFavorites } = jest.requireMock(
  '../../favoritesStorage',
) as {
  loadStoredFavorites: jest.Mock;
  saveStoredFavorites: jest.Mock;
};
const { fetchAllFavorites } = jest.requireMock('../../api/favorites') as {
  fetchAllFavorites: jest.Mock;
};

describe('shouldUseServerFavorites', () => {
  beforeEach(() => {
    shouldUseMockData.mockImplementation((isMockSession: boolean) => isMockSession);
  });

  it('ignore l’API en mode demo', () => {
    expect(shouldUseServerFavorites(true, true)).toBe(false);
  });

  it('utilise l’API quand connecté et pas demo', () => {
    expect(shouldUseServerFavorites(true, false)).toBe(true);
  });
});

describe('bootstrapFavoritePlaces', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mode local : charge AsyncStorage sans appeler l’API', async () => {
    loadStoredFavorites.mockResolvedValue({
      placeIds: ['mock-a'],
      itineraryIds: ['itin-1'],
    });

    const result = await bootstrapFavoritePlaces(false);

    expect(fetchAllFavorites).not.toHaveBeenCalled();
    expect(result.places.order).toEqual(['mock-a']);
    expect(result.itineraryIds).toEqual(['itin-1']);
    expect(result.useServer).toBe(false);
  });

  it('mode serveur : source of truth API et purge des placeIds locaux', async () => {
    loadStoredFavorites.mockResolvedValue({
      placeIds: ['ghost-local'],
      itineraryIds: ['itin-1'],
    });
    fetchAllFavorites.mockResolvedValue([
      {
        id: 'f1',
        poiId: 'poi-server',
        createdAt: '2026-07-05T10:00:00.000Z',
        poi: { title: 'Serveur', status: 'PUBLISHED' },
      },
    ]);

    const result = await bootstrapFavoritePlaces(true);

    expect(result.places.order).toEqual(['poi-server']);
    expect(saveStoredFavorites).toHaveBeenCalledWith({
      placeIds: [],
      itineraryIds: ['itin-1'],
    });
    expect(result.useServer).toBe(true);
  });

  it('mode serveur offline : fallback local sans merge fantôme post-fetch', async () => {
    loadStoredFavorites.mockResolvedValue({
      placeIds: ['offline-a'],
      itineraryIds: [],
    });
    fetchAllFavorites.mockRejectedValue(new Error('network'));

    const result = await bootstrapFavoritePlaces(true);

    expect(result.places.order).toEqual(['offline-a']);
    expect(saveStoredFavorites).not.toHaveBeenCalled();
  });
});
