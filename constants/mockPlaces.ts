export interface PlaceCategory {
  id: string;
  label: string;
}

export type AudioGuideStatus = 'ready' | 'pending';

export interface AudioGuide {
  id: string;
  title: string;
  summary: string;
  durationSec: number | null;
  language: string;
  authorName: string;
  publishedAt: string;
  status: AudioGuideStatus;
  rating: number | null;
}

export interface MockPlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  address: string;
  imageUrl: string;
  description: string;
  audioGuides: AudioGuide[];
  /** POI parent (ex. musée pour une œuvre) — absent = POI racine affiché sur la carte. */
  parentId?: string;
}

export function getCategoryLabel(categoryId: string): string {
  const category = categories.find((c) => c.id === categoryId);
  return category?.label ?? categoryId;
}

export function getPlaceById(id: string): MockPlace | undefined {
  return mockPlaces.find((p) => p.id === id);
}

export function isRootPlace(place: MockPlace): boolean {
  return place.parentId === undefined;
}

export function formatAudioDuration(durationSec: number): string {
  const totalMinutes = Math.max(1, Math.round(durationSec / 60));
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
}

/** Format mm:ss pour l’affichage des guides (ex. 2:45). */
export function formatAudioDurationClock(durationSec: number): string {
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getLanguageFlag(language: string): string {
  switch (language.toUpperCase()) {
    case 'FR':
      return '🇫🇷';
    case 'EN':
      return '🇬🇧';
    case 'ES':
      return '🇪🇸';
    case 'DE':
      return '🇩🇪';
    default:
      return '🌐';
  }
}

export const parisRegion = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

export const categories: PlaceCategory[] = [
  { id: 'all', label: 'Tous' },
  { id: 'monument', label: 'Monument' },
  { id: 'musee', label: 'Musée' },
  { id: 'parc', label: 'Parc' },
  { id: 'quartier', label: 'Quartier' },
  { id: 'oeuvre', label: 'Œuvre' },
];

export const mockPlaces: MockPlace[] = [
  {
    id: '1',
    name: 'Cathédrale Notre-Dame de Paris',
    latitude: 48.853,
    longitude: 2.3499,
    categoryId: 'monument',
    address: '6 Parvis Notre-Dame - Place Jean-Paul II',
    imageUrl:
      'https://images.unsplash.com/photo-1758204570486-8f49ab989f56?w=800&q=80',
    description:
      'Chef-d\'œuvre de l\'architecture gothique, Notre-Dame domine l\'Île de la Cité depuis le XIIe siècle.',
    audioGuides: [
      {
        id: '1-a',
        title: 'Notre-Dame de Paris',
        summary: 'Chef-d\'œuvre gothique au cœur de l\'Île de la Cité.',
        durationSec: 720,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '15/01/2026',
        status: 'ready',
        rating: null,
      },
      {
        id: '1-b',
        title: 'Les vitraux et la lumière',
        summary: 'Les rosaces et l\'art du vitrail médiéval...',
        durationSec: 540,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '10/01/2026',
        status: 'ready',
        rating: 4.5,
      },
      {
        id: '1-c',
        title: 'La flèche et la restauration',
        summary: 'De Viollet-le-Duc au chantier contemporain...',
        durationSec: null,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '03/01/2026',
        status: 'pending',
        rating: null,
      },
    ],
  },
  {
    id: '2',
    name: 'Musée du Louvre',
    latitude: 48.8606,
    longitude: 2.3376,
    categoryId: 'musee',
    address: 'Rue de Rivoli, 75001 Paris',
    imageUrl:
      'https://images.unsplash.com/photo-1743880475189-e36f80868bcc?w=800&q=80',
    description:
      'Ancien palais royal devenu le plus grand musée du monde, le Louvre abrite des millénaires d\'art.',
    audioGuides: [
      {
        id: '2-a',
        title: 'Musée du Louvre',
        summary: 'Ancien palais royal et collections essentielles.',
        durationSec: 165,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '03/01/2026',
        status: 'ready',
        rating: null,
      },
      {
        id: '2-b',
        title: 'Le réseau des collections en France',
        summary: 'Parcourez la géographie culturelle des trésors dispersés...',
        durationSec: null,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '02/01/2026',
        status: 'pending',
        rating: null,
      },
      {
        id: '2-c',
        title: 'Les compagnons du devoir du bâtiment',
        summary: 'Les compagnons du devoir du bâtiment sont une association...',
        durationSec: null,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '02/01/2026',
        status: 'pending',
        rating: null,
      },
      {
        id: '2-d',
        title: 'La pyramide et l\'architecture du palais',
        summary: 'De la forteresse médiévale à la pyramide de Pei...',
        durationSec: null,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '01/01/2026',
        status: 'pending',
        rating: null,
      },
      {
        id: '2-e',
        title: 'Chefs-d\'œuvre incontournables',
        summary: 'La Joconde, la Vénus de Milo et les incontournables...',
        durationSec: 241,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '28/12/2025',
        status: 'ready',
        rating: 4.8,
      },
    ],
  },
  {
    id: '3',
    name: 'Tour Eiffel',
    latitude: 48.8584,
    longitude: 2.2945,
    categoryId: 'monument',
    address: 'Av. Gustave Eiffel, 75007 Paris',
    imageUrl:
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80',
    description:
      'Symbole de Paris depuis l\'Exposition universelle de 1889, la tour Eiffel fut d\'abord controversée.',
    audioGuides: [
      {
        id: '3-a',
        title: 'Tour Eiffel',
        summary: 'De l\'Exposition universelle à l\'emblème de Paris.',
        durationSec: 600,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '05/01/2026',
        status: 'ready',
        rating: null,
      },
    ],
  },
  {
    id: '4',
    name: 'Basilique du Sacré-Cœur',
    latitude: 48.8867,
    longitude: 2.3431,
    categoryId: 'monument',
    address: '35 Rue du Chevalier de la Barre, 75018 Paris',
    imageUrl:
      'https://images.unsplash.com/photo-1757162381660-5fd3d391bcb4?w=800&q=80',
    description:
      'Perchée sur la butte Montmartre, la basilique du Sacré-Cœur offre l\'un des plus beaux panoramas de Paris.',
    audioGuides: [
      {
        id: '4-a',
        title: 'Basilique du Sacré-Cœur',
        summary: 'Montmartre, la basilique et son panorama.',
        durationSec: 480,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '08/01/2026',
        status: 'ready',
        rating: null,
      },
      {
        id: '4-b',
        title: 'Le dôme et la vue sur Paris',
        summary: 'Montée au dôme et panorama à 360°...',
        durationSec: 420,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '06/01/2026',
        status: 'ready',
        rating: 4.2,
      },
    ],
  },
  {
    id: '5',
    name: 'Jardin du Luxembourg',
    latitude: 48.8462,
    longitude: 2.3372,
    categoryId: 'parc',
    address: 'Rue de Médicis - Rue de Vaugirard, 75006 Paris',
    imageUrl:
      'https://images.unsplash.com/photo-1570688382843-856642db5426?w=800&q=80',
    description:
      'Créé en 1612 à la demande de Marie de Médicis, le jardin du Luxembourg mêle parterres et bosquets.',
    audioGuides: [
      {
        id: '5-a',
        title: 'Jardin du Luxembourg',
        summary: 'Promenade au fil des saisons dans le jardin du Sénat.',
        durationSec: 540,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '12/01/2026',
        status: 'ready',
        rating: null,
      },
    ],
  },
  {
    id: '6',
    name: 'Le Marais',
    latitude: 48.859,
    longitude: 2.3622,
    categoryId: 'quartier',
    address: '3e et 4e arrondissement, Paris',
    imageUrl:
      'https://images.unsplash.com/photo-1594558068774-4bd20990a583?w=800&q=80',
    description:
      'Entre hôtels particuliers du XVIIe siècle et ruelles animées, le Marais concentre histoire et art.',
    audioGuides: [
      {
        id: '6-a',
        title: 'Le Marais',
        summary: 'Balade dans le Marais médiéval et ses hôtels particuliers.',
        durationSec: 840,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '14/01/2026',
        status: 'ready',
        rating: null,
      },
      {
        id: '6-b',
        title: 'Art, galeries et places secrètes',
        summary: 'Du musée Picasso à la place des Vosges...',
        durationSec: null,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '11/01/2026',
        status: 'pending',
        rating: null,
      },
    ],
  },
  {
    id: '7',
    name: 'La Joconde',
    latitude: 48.8606,
    longitude: 2.3376,
    categoryId: 'oeuvre',
    parentId: '2',
    address: 'Musée du Louvre — Aile Denon, 1er étage',
    imageUrl:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
    description:
      'Portrait de Lisa Gherardini peint par Léonard de Vinci entre 1503 et 1519, devenu l\'emblème du musée du Louvre.',
    audioGuides: [
      {
        id: '7-a',
        title: 'La Joconde',
        summary: 'L\'histoire du tableau le plus célèbre du monde.',
        durationSec: 180,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '20/01/2026',
        status: 'ready',
        rating: 4.9,
      },
    ],
  },
  {
    id: '8',
    name: 'La Vénus de Milo',
    latitude: 48.8606,
    longitude: 2.3376,
    categoryId: 'oeuvre',
    parentId: '2',
    address: 'Musée du Louvre — Galerie des Antiques',
    imageUrl:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
    description:
      'Sculpture grecque en marbre de Paros, découverte en 1820 à Milos et entrée au Louvre en 1821.',
    audioGuides: [
      {
        id: '8-a',
        title: 'La Vénus de Milo',
        summary: 'Découverte, restauration et symbolique de la déesse.',
        durationSec: 150,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '18/01/2026',
        status: 'ready',
        rating: 4.6,
      },
    ],
  },
  {
    id: '9',
    name: 'La Victoire de Samothrace',
    latitude: 48.8606,
    longitude: 2.3376,
    categoryId: 'oeuvre',
    parentId: '2',
    address: 'Musée du Louvre — Escalier Daru',
    imageUrl:
      'https://images.unsplash.com/photo-1578321272176-b2a2ad7c3a8e?w=800&q=80',
    description:
      'Chef-d\'œuvre de la sculpture hellénistique, représentant Niké posée sur la proue d\'un navire.',
    audioGuides: [
      {
        id: '9-a',
        title: 'La Victoire de Samothrace',
        summary: 'Un monument hellénistique au sommet de l\'escalier Daru.',
        durationSec: 165,
        language: 'FR',
        authorName: 'Utilisateur',
        publishedAt: '16/01/2026',
        status: 'ready',
        rating: 4.7,
      },
    ],
  },
];

export const rootPlaces = mockPlaces.filter(isRootPlace);

export function getRootPlaces(): MockPlace[] {
  return rootPlaces;
}

export function getPlaceChildren(parentId: string): MockPlace[] {
  return mockPlaces.filter((p) => p.parentId === parentId);
}

export function getPlaceParent(place: MockPlace): MockPlace | undefined {
  return place.parentId ? getPlaceById(place.parentId) : undefined;
}
