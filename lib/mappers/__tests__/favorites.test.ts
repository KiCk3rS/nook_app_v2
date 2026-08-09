import { favoriteItemToPlaceView, resolveFavoritePlaceViews } from '../favorites';
import { placeStateFromItems } from '../../favorites/placeStore';

describe('favoriteItemToPlaceView', () => {
  it('utilise le snippet API sans enrichissement mock', () => {
    const view = favoriteItemToPlaceView({
      targetType: 'poi',
      id: '1',
      createdAt: '2026-07-05T10:00:00.000Z',
      target: { id: '1', title: 'Musée du Louvre API', status: 'PUBLISHED' },
    });

    expect(view).toEqual({
      id: '1',
      name: 'Musée du Louvre API',
      subtitle: '',
      imageUrl: null,
    });
  });

  it('évite un nom vide si le snippet API est incomplet', () => {
    const view = favoriteItemToPlaceView({
      targetType: 'poi',
      id: '00000000-0000-4000-8000-000000000099',
      createdAt: '2026-07-05T10:00:00.000Z',
      target: { id: '00000000-0000-4000-8000-000000000099', title: '', status: 'PUBLISHED' },
    });

    expect(view.name).toBe('00000000-0000-4000-8000-000000000099');
  });
});

describe('resolveFavoritePlaceViews', () => {
  it('résout depuis l’état unifié (snippet API)', () => {
    const views = resolveFavoritePlaceViews(
      placeStateFromItems([
        {
          targetType: 'poi',
          id: '00000000-0000-4000-8000-000000000002',
          createdAt: '2026-07-05T10:00:00.000Z',
          target: {
            id: '00000000-0000-4000-8000-000000000002',
            title: 'Orsay',
            status: 'PUBLISHED',
          },
        },
      ]),
    );

    expect(views).toHaveLength(1);
    expect(views[0]?.name).toBe('Orsay');
    expect(views[0]?.imageUrl).toBeNull();
  });
});
