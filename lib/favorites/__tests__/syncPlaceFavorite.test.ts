import {
  shouldApplyToggleResult,
  syncPlaceFavoriteWithServer,
} from '../syncPlaceFavorite';

describe('syncPlaceFavoriteWithServer', () => {
  it('ajoute via POST et retourne l’item', async () => {
    const item = {
      id: 'f1',
      poiId: 'poi-a',
      createdAt: '2026-07-05T10:00:00.000Z',
      poi: { title: 'Lieu', status: 'PUBLISHED' },
    };
    const api = {
      addFavorite: jest.fn().mockResolvedValue(item),
      removeFavorite: jest.fn(),
    };

    const result = await syncPlaceFavoriteWithServer('poi-a', true, api);

    expect(result).toEqual({ success: true, item });
    expect(api.addFavorite).toHaveBeenCalledWith('poi-a');
  });

  it('supprime via DELETE', async () => {
    const api = {
      addFavorite: jest.fn(),
      removeFavorite: jest.fn().mockResolvedValue(undefined),
    };

    const result = await syncPlaceFavoriteWithServer('poi-a', false, api);

    expect(result).toEqual({ success: true, item: null });
    expect(api.removeFavorite).toHaveBeenCalledWith('poi-a');
  });

  it('rollback signal : échec réseau', async () => {
    const api = {
      addFavorite: jest.fn().mockRejectedValue(new Error('network')),
      removeFavorite: jest.fn(),
    };

    const result = await syncPlaceFavoriteWithServer('poi-a', true, api);

    expect(result).toEqual({ success: false });
  });
});

describe('shouldApplyToggleResult', () => {
  it('ignore les réponses obsolètes', () => {
    expect(shouldApplyToggleResult(2, 1)).toBe(false);
    expect(shouldApplyToggleResult(2, 2)).toBe(true);
  });
});
