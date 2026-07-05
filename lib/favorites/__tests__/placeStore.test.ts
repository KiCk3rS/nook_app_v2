import {
  createOptimisticPlaceItem,
  isPlaceInState,
  placeStateFromItems,
  placeStateFromLocalIds,
  setPlaceFavoriteInState,
} from '../placeStore';

describe('placeStateFromItems', () => {
  it('conserve l’ordre serveur sans doublons', () => {
    const state = placeStateFromItems([
      {
        id: 'f1',
        poiId: 'poi-a',
        createdAt: '2026-07-05T10:00:00.000Z',
        poi: { title: 'A', status: 'PUBLISHED' },
      },
      {
        id: 'f2',
        poiId: 'poi-b',
        createdAt: '2026-07-05T09:00:00.000Z',
        poi: { title: 'B', status: 'PUBLISHED' },
      },
    ]);

    expect(state.order).toEqual(['poi-a', 'poi-b']);
    expect(state.items.get('poi-a')?.poi.title).toBe('A');
  });
});

describe('createOptimisticPlaceItem', () => {
  it('utilise le hint title quand fourni', () => {
    const item = createOptimisticPlaceItem('poi-api', { title: 'Tour Eiffel' });
    expect(item.poi.title).toBe('Tour Eiffel');
  });

  it('retombe sur le mock local si pas de hint', () => {
    const item = createOptimisticPlaceItem('1');
    expect(item.poi.title).toBeTruthy();
  });
});

describe('setPlaceFavoriteInState', () => {
  it('ajoute un favori avec item', () => {
    const item = createOptimisticPlaceItem('poi-b');
    const next = setPlaceFavoriteInState(placeStateFromLocalIds(['poi-a']), 'poi-b', true, item);
    expect(isPlaceInState(next, 'poi-b')).toBe(true);
    expect(next.items.get('poi-b')).toBe(item);
  });

  it('retire un favori', () => {
    const base = placeStateFromLocalIds(['poi-a', 'poi-b']);
    const next = setPlaceFavoriteInState(base, 'poi-a', false);
    expect(next.order).toEqual(['poi-b']);
  });

  it('rollback restaure l’état précédent', () => {
    const item = createOptimisticPlaceItem('poi-a');
    const afterFailedAdd = setPlaceFavoriteInState(emptyLocal(), 'poi-a', true, item);
    const rolledBack = setPlaceFavoriteInState(afterFailedAdd, 'poi-a', false);
    expect(isPlaceInState(rolledBack, 'poi-a')).toBe(false);
  });
});

function emptyLocal() {
  return placeStateFromLocalIds([]);
}
