import { searchAllAsync, searchAllLocal } from '../searchPlaces';

jest.mock('../config', () => ({
  isApiConfigured: jest.fn(),
}));

jest.mock('../api/pois', () => ({
  fetchPois: jest.fn(),
}));

const { isApiConfigured } = jest.requireMock('../config') as {
  isApiConfigured: jest.Mock;
};

const { fetchPois } = jest.requireMock('../api/pois') as {
  fetchPois: jest.Mock;
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
    expect(result).toEqual(local);
  });

  it('appelle fetchPois quand API configurée', async () => {
    isApiConfigured.mockReturnValue(true);
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

    expect(fetchPois).toHaveBeenCalledWith({
      q: 'louvre',
      sort: 'relevance',
      limit: 50,
    });
    expect(result.some((r) => r.type === 'place' && r.place.id === 'api-1')).toBe(
      true,
    );
  });

  it('retombe sur mock en cas d’erreur API', async () => {
    isApiConfigured.mockReturnValue(true);
    fetchPois.mockRejectedValue(new Error('network'));

    const local = searchAllLocal('louvre');
    const result = await searchAllAsync('louvre');

    expect(result).toEqual(local);
  });
});
