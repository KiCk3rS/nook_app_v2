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
  partitionFavoriteItems: jest.requireActual('../../api/favorites').partitionFavoriteItems,
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
    expect(result.itineraries.order).toEqual(['itin-1']);
    expect(result.useServer).toBe(false);
  });

  it('mode serveur : source of truth API (POI + éditoriaux) et purge locale', async () => {
    loadStoredFavorites.mockResolvedValue({
      placeIds: ['ghost-local'],
      itineraryIds: ['itin-local'],
    });
    fetchAllFavorites.mockResolvedValue([
      {
        targetType: 'poi',
        id: 'poi-server',
        createdAt: '2026-07-05T10:00:00.000Z',
        target: { id: 'poi-server', title: 'Serveur', status: 'PUBLISHED' },
      },
      {
        targetType: 'editorial_itinerary',
        id: 'ei-server',
        createdAt: '2026-07-05T09:00:00.000Z',
        target: {
          id: 'ei-server',
          slug: 'balade',
          title: 'Balade',
          coverImageUrl: null,
        },
      },
    ]);

    const result = await bootstrapFavoritePlaces(true);

    expect(result.places.order).toEqual(['poi-server']);
    expect(result.itineraries.order).toEqual(['ei-server']);
    expect(result.itineraries.items.get('ei-server')?.target.title).toBe('Balade');
    expect(saveStoredFavorites).toHaveBeenCalledWith({
      placeIds: [],
      itineraryIds: [],
    });
    expect(result.useServer).toBe(true);
  });

  it('mode serveur offline : fallback local sans merge fantôme post-fetch', async () => {
    loadStoredFavorites.mockResolvedValue({
      placeIds: ['offline-a'],
      itineraryIds: ['itin-offline'],
    });
    fetchAllFavorites.mockRejectedValue(new Error('network'));

    const result = await bootstrapFavoritePlaces(true);

    expect(result.places.order).toEqual(['offline-a']);
    expect(result.itineraries.order).toEqual(['itin-offline']);
    expect(saveStoredFavorites).not.toHaveBeenCalled();
  });
});
