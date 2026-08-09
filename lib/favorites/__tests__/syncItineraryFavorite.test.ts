import { syncItineraryFavoriteWithServer } from '../syncItineraryFavorite';

describe('syncItineraryFavoriteWithServer', () => {
  it('ajoute via POST editorial', async () => {
    const item = {
      targetType: 'editorial_itinerary' as const,
      id: 'ei-1',
      createdAt: '2026-07-05T10:00:00.000Z',
      target: {
        id: 'ei-1',
        slug: 'balade',
        title: 'Balade',
        coverImageUrl: null,
      },
    };
    const api = {
      addEditorialItineraryFavorite: jest.fn().mockResolvedValue(item),
      removeFavorite: jest.fn(),
    };

    const result = await syncItineraryFavoriteWithServer('ei-1', true, api);

    expect(result).toEqual({ success: true, item });
    expect(api.addEditorialItineraryFavorite).toHaveBeenCalledWith('ei-1');
  });

  it('supprime via DELETE targetId', async () => {
    const api = {
      addEditorialItineraryFavorite: jest.fn(),
      removeFavorite: jest.fn().mockResolvedValue(undefined),
    };

    const result = await syncItineraryFavoriteWithServer('ei-1', false, api);

    expect(result).toEqual({ success: true, item: null });
    expect(api.removeFavorite).toHaveBeenCalledWith('ei-1');
  });

  it('rollback signal : échec réseau', async () => {
    const api = {
      addEditorialItineraryFavorite: jest.fn().mockRejectedValue(new Error('network')),
      removeFavorite: jest.fn(),
    };

    const result = await syncItineraryFavoriteWithServer('ei-1', true, api);

    expect(result).toEqual({ success: false });
  });
});
