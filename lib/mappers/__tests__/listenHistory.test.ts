import {
  computeListenHistoryProgressPercent,
  getListenHistorySectionKey,
  listenHistoryEntryToItem,
} from '../listenHistory';

describe('getListenHistorySectionKey', () => {
  const now = new Date('2026-07-05T15:00:00.000Z');

  it('classe aujourd’hui, hier et cette semaine', () => {
    expect(
      getListenHistorySectionKey('2026-07-05T10:00:00.000Z', now),
    ).toBe('today');
    expect(
      getListenHistorySectionKey('2026-07-04T10:00:00.000Z', now),
    ).toBe('yesterday');
    expect(
      getListenHistorySectionKey('2026-07-02T10:00:00.000Z', now),
    ).toBe('thisWeek');
    expect(
      getListenHistorySectionKey('2026-06-20T10:00:00.000Z', now),
    ).toBe('earlier');
  });
});

describe('computeListenHistoryProgressPercent', () => {
  it('retourne 100 % sans progression enregistrée', () => {
    expect(computeListenHistoryProgressPercent(null)).toBe(100);
    expect(computeListenHistoryProgressPercent(0)).toBe(100);
  });

  it('calcule le ratio quand la durée est connue', () => {
    expect(computeListenHistoryProgressPercent(42, 120)).toBe(35);
  });

  it('retourne 50 % en cours sans durée API', () => {
    expect(computeListenHistoryProgressPercent(42)).toBe(50);
  });
});

describe('listenHistoryEntryToItem', () => {
  it('mappe une entrée API vers l’item UI', () => {
    const item = listenHistoryEntryToItem(
      {
        id: 'hist-1',
        audioId: 'audio-1',
        poiId: 'poi-1',
        listenedAt: '2026-07-05T10:30:00.000Z',
        progressSeconds: 42,
        audio: { id: 'audio-1', title: 'Mon guide' },
        poi: { title: 'Tour Eiffel', status: 'PUBLISHED' },
      },
      'fr',
      new Date('2026-07-05T15:00:00.000Z'),
    );

    expect(item).toMatchObject({
      id: 'hist-1',
      placeId: 'poi-1',
      guideId: 'audio-1',
      placeName: 'Tour Eiffel',
      guideTitle: 'Mon guide',
      sectionKey: 'today',
      progressPercent: 50,
    });
  });

  it('ignore les entrées sans poiId', () => {
    expect(
      listenHistoryEntryToItem(
        {
          id: 'hist-2',
          audioId: 'audio-2',
          poiId: null,
          listenedAt: '2026-07-05T10:30:00.000Z',
          progressSeconds: null,
          audio: { id: 'audio-2', title: null },
          poi: null,
        },
        'fr',
      ),
    ).toBeNull();
  });
});
