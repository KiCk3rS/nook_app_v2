import { favoriteItemToPlaceView } from '../favorites';

describe('favoriteItemToPlaceView', () => {
  it('utilise le snippet API quand le POI mock est absent', () => {
    const view = favoriteItemToPlaceView({
      id: 'fav-1',
      poiId: '00000000-0000-4000-8000-000000000001',
      createdAt: '2026-07-05T10:00:00.000Z',
      poi: { title: 'Musée du Louvre', status: 'PUBLISHED' },
    });

    expect(view).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Musée du Louvre',
      subtitle: '',
      imageUrl: null,
    });
  });
});
