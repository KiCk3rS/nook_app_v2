import {
  createOptimisticItineraryItem,
  isItineraryInState,
  itineraryStateFromItems,
  itineraryStateFromLocalIds,
  setItineraryFavoriteInState,
} from '../itineraryStore';

describe('itineraryStateFromItems', () => {
  it('conserve l’ordre serveur sans doublons', () => {
    const state = itineraryStateFromItems([
      {
        targetType: 'editorial_itinerary',
        id: 'ei-a',
        createdAt: '2026-07-05T10:00:00.000Z',
        target: {
          id: 'ei-a',
          slug: 'a',
          title: 'A',
          coverImageUrl: null,
        },
      },
      {
        targetType: 'editorial_itinerary',
        id: 'ei-b',
        createdAt: '2026-07-05T09:00:00.000Z',
        target: {
          id: 'ei-b',
          slug: 'b',
          title: 'B',
          coverImageUrl: 'https://cdn.example.com/b.jpg',
        },
      },
    ]);

    expect(state.order).toEqual(['ei-a', 'ei-b']);
    expect(state.items.get('ei-b')?.target.slug).toBe('b');
  });
});

describe('createOptimisticItineraryItem', () => {
  it('utilise le hint quand fourni', () => {
    const item = createOptimisticItineraryItem('uuid-1', {
      title: 'Paris by Night',
      slug: 'itin-paris-premium',
      coverImageUrl: null,
    });
    expect(item.id).toBe('uuid-1');
    expect(item.target.title).toBe('Paris by Night');
    expect(item.target.slug).toBe('itin-paris-premium');
  });
});

describe('setItineraryFavoriteInState', () => {
  it('ajoute et retire', () => {
    const item = createOptimisticItineraryItem('ei-b', { title: 'B', slug: 'b' });
    const added = setItineraryFavoriteInState(
      itineraryStateFromLocalIds(['ei-a']),
      'ei-b',
      true,
      item,
    );
    expect(isItineraryInState(added, 'ei-b')).toBe(true);
    const removed = setItineraryFavoriteInState(added, 'ei-a', false);
    expect(removed.order).toEqual(['ei-b']);
  });
});
