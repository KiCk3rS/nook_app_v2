import { searchAllAsync, searchAllLocal } from '../searchPlaces';

jest.mock('../config', () => ({
  isApiConfigured: jest.fn(),
}));

jest.mock('../api/pois', () => ({
  fetchPois: jest.fn(),
}));

jest.mock('../api/cities', () => ({
  searchCities: jest.fn(),
}));

const { isApiConfigured } = jest.requireMock('../config') as {
  isApiConfigured: jest.Mock;
};

const { fetchPois } = jest.requireMock('../api/pois') as {
  fetchPois: jest.Mock;
};

const { searchCities } = jest.requireMock('../api/cities') as {
  searchCities: jest.Mock;
};

const apiCity = {
  id: 'city-api-1',
  slug: 'paris',
  name: 'Paris',
  subtitle: 'API subtitle',
  coverImage: {
    id: 'img-1',
    url: 'https://cdn.example.com/paris.jpg',
    expiresAt: '2026-08-10T00:00:00.000Z',
    altText: null,
  },
  stats: {
    publishedPoiCount: 0,
    editorialItineraryCount: 0,
    districtHubCount: 0,
  },
  isPromoted: true,
};

describe('searchAllAsync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('délègue au mock local si API non configurée', async () => {
    isApiConfigured.mockReturnValue(false);
    const local = searchAllLocal('notre');
    const result = await searchAllAsync('notre');
    expect(fetchPois).not.toHaveBeenCalled();
    expect(searchCities).not.toHaveBeenCalled();
    expect(result).toEqual(local);
  });

  it('appelle searchCities + fetchPois en parallèle quand API configurée', async () => {
    isApiConfigured.mockReturnValue(true);
    searchCities.mockResolvedValue([apiCity]);
    fetchPois.mockResolvedValue({
      items: [
        {
          id: 'api-1',
          title: 'Louvre API',
          lat: 48.86,
          lng: 2.33,
          categories: [{ slug: 'musee', label: 'Musée' }],
        },
      ],
      total: 1,
      limit: 50,
      offset: 0,
    });

    const result = await searchAllAsync('louvre');

    expect(searchCities).toHaveBeenCalledWith('louvre');
    expect(fetchPois).toHaveBeenCalledWith({
      q: 'louvre',
      sort: 'relevance',
      limit: 50,
    });
    expect(
      result.some((r) => r.type === 'city' && r.city.id === 'city-api-1'),
    ).toBe(true);
    expect(result.some((r) => r.type === 'place' && r.place.id === 'api-1')).toBe(
      true,
    );
  });

  it('conserve les villes API si fetchPois échoue (POI mock locaux)', async () => {
    isApiConfigured.mockReturnValue(true);
    searchCities.mockResolvedValue([apiCity]);
    fetchPois.mockRejectedValue(new Error('network'));

    const result = await searchAllAsync('paris');

    expect(
      result.some((r) => r.type === 'city' && r.city.id === 'city-api-1'),
    ).toBe(true);
    expect(result.some((r) => r.type === 'place')).toBe(true);
  });

  it('retombe sur villes mock si searchCities échoue, POI API ok', async () => {
    isApiConfigured.mockReturnValue(true);
    searchCities.mockRejectedValue(new Error('cities down'));
    fetchPois.mockResolvedValue({
      items: [
        {
          id: 'api-2',
          title: 'Orsay',
          lat: 48.86,
          lng: 2.32,
          categories: [],
        },
      ],
      total: 1,
      limit: 50,
      offset: 0,
    });

    const result = await searchAllAsync('orsay');

    expect(result.some((r) => r.type === 'place' && r.place.id === 'api-2')).toBe(
      true,
    );
    expect(searchCities).toHaveBeenCalled();
  });

  it('conserve presentation HUB sur les POI API (routing hub site)', async () => {
    isApiConfigured.mockReturnValue(true);
    searchCities.mockResolvedValue([]);
    fetchPois.mockResolvedValue({
      items: [
        {
          id: 'uuid-louvre',
          title: 'Musée du Louvre',
          lat: 48.86,
          lng: 2.33,
          categories: [{ slug: 'culture', label: 'Culture' }],
          presentation: 'HUB',
        },
      ],
      total: 1,
      limit: 50,
      offset: 0,
    });

    const result = await searchAllAsync('louvre');
    const place = result.find(
      (r): r is Extract<typeof r, { type: 'place' }> =>
        r.type === 'place' && r.place.id === 'uuid-louvre',
    );

    expect(place?.place.presentation).toBe('HUB');
  });

  it('retombe sur mock complet si les deux sources échouent', async () => {
    isApiConfigured.mockReturnValue(true);
    searchCities.mockRejectedValue(new Error('cities down'));
    fetchPois.mockRejectedValue(new Error('pois down'));

    const local = searchAllLocal('louvre');
    const result = await searchAllAsync('louvre');

    expect(result).toEqual(local);
  });
});
