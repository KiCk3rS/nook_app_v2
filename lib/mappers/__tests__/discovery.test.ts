import {
  discoveryItemToCardProps,
  formatDiscoverySubtitle,
} from '../discovery';
import type { DiscoveryItem } from '../../../types/api';

const baseItem: DiscoveryItem = {
  id: 'poi-1',
  title: 'Musée du Louvre',
  parentPoiId: null,
  lat: 48.8606,
  lng: 2.3376,
  categories: [{ slug: 'museum', label: 'Musée' }],
  publishedAt: '2026-06-15T08:00:00.000Z',
  popularity: {
    averageRating: 4.8,
    reviewCount: 24,
    playCountLast7Days: 540,
    playCountTotal: 2100,
  },
  coverImage: {
    id: 'img-1',
    url: 'https://cdn.example.com/louvre.jpg',
    expiresAt: '2026-07-05T20:00:00.000Z',
    altText: 'Louvre',
  },
};

describe('discoveryItemToCardProps', () => {
  it('mappe les champs API vers la carte', () => {
    const card = discoveryItemToCardProps(baseItem, 'popular', 'fr');

    expect(card).toEqual({
      id: 'poi-1',
      title: 'Musée du Louvre',
      categoryLabel: 'Musée',
      subtitle: expect.any(String),
      imageUrl: 'https://cdn.example.com/louvre.jpg',
      usesPlaceholder: false,
    });
  });

  it('active le placeholder quand coverImage est null', () => {
    const card = discoveryItemToCardProps(
      { ...baseItem, coverImage: null },
      'latest',
      'fr',
    );

    expect(card.imageUrl).toBeNull();
    expect(card.usesPlaceholder).toBe(true);
  });
});

describe('formatDiscoverySubtitle', () => {
  it('formate la section top_rated avec une note', () => {
    const subtitle = formatDiscoverySubtitle(baseItem, 'top_rated', 'fr');
    expect(subtitle).toMatch(/^★ /);
    expect(subtitle).toContain('4');
  });

  it('formate la section popular avec le nombre d’écoutes', () => {
    const subtitle = formatDiscoverySubtitle(baseItem, 'popular', 'fr');
    expect(subtitle.length).toBeGreaterThan(0);
  });
});
