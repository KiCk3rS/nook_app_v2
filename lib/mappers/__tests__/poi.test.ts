import {
  audioTrackToAudioGuide,
  getCategoryDisplayLabel,
  poiCardLikeToMockPlace,
  poiDetailToMockPlace,
  poiSummaryToMarker,
  poiSummaryToMockPlaceSummary,
  poiSummaryToPreview,
} from '../poi';
import type { PoiDetail, PoiSummary } from '../../../types/api';

describe('poiSummaryToMarker', () => {
  const summary: PoiSummary = {
    id: 'poi-1',
    title: 'Musée',
    lat: 48.86,
    lng: 2.33,
    categories: [{ slug: 'musee', label: 'Musée' }],
    parentPoiId: null,
  };

  it('mappe les champs carte', () => {
    expect(poiSummaryToMarker(summary)).toEqual({
      id: 'poi-1',
      name: 'Musée',
      latitude: 48.86,
      longitude: 2.33,
      categoryId: 'musee',
      categoryLabel: 'Musée',
      parentId: null,
    });
  });

  it('preview null-safe sans images', () => {
    expect(poiSummaryToPreview(summary)).toMatchObject({
      imageUrl: null,
      address: null,
      readyAudioCount: 0,
    });
  });

  it('gère categories vide', () => {
    const marker = poiSummaryToMarker({ ...summary, categories: [] });
    expect(marker.categoryId).toBe('monument');
    expect(marker.categoryLabel).toBeUndefined();
  });
});

describe('getCategoryDisplayLabel', () => {
  it('priorise le libellé API', () => {
    expect(getCategoryDisplayLabel('musee', 'Musée API')).toBe('Musée API');
  });
});

describe('poiDetailToMockPlace', () => {
  it('mappe description et audios', () => {
    const detail: PoiDetail = {
      id: 'd1',
      title: 'Tour Eiffel',
      description: 'Monument emblématique',
      parentPoiId: null,
      childrenCount: 0,
      lat: 48.858,
      lng: 2.294,
      categories: [{ slug: 'monument', label: 'Monument' }],
      images: [{ id: 'img-1', sortOrder: 0, altText: null }],
      audios: [
        {
          id: 'a1',
          title: 'Guide',
          language: 'fr',
          durationSeconds: 120,
          sortOrder: 0,
          sourceType: 'MANUAL',
          attribution: 'NOOK',
          mimeType: 'audio/mpeg',
          audienceCategories: [],
        },
      ],
      popularity: null,
    };

    const place = poiDetailToMockPlace(detail);
    expect(place.name).toBe('Tour Eiffel');
    expect(place.description).toBe('Monument emblématique');
    expect(place.audioGuides).toHaveLength(1);
    expect(audioTrackToAudioGuide(detail.audios![0]).status).toBe('ready');
  });
});

describe('poiSummaryToMockPlaceSummary', () => {
  it('délègue à poiCardLikeToMockPlace', () => {
    const summary: PoiSummary = {
      id: 'poi-1',
      title: 'Musée',
      lat: 48.86,
      lng: 2.33,
      categories: [{ slug: 'musee', label: 'Musée' }],
      parentPoiId: null,
    };
    expect(poiSummaryToMockPlaceSummary(summary)).toEqual(
      poiCardLikeToMockPlace({
        id: 'poi-1',
        title: 'Musée',
        lat: 48.86,
        lng: 2.33,
        categories: [{ slug: 'musee', label: 'Musée' }],
        parentPoiId: null,
      }),
    );
  });
});
