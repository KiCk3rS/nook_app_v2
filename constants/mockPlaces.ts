export interface PlaceCategory {
  id: string;
  label: string;
}

export interface MockPlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  address: string;
  imageUrl: string;
}

export function getCategoryLabel(categoryId: string): string {
  const category = categories.find((c) => c.id === categoryId);
  return category?.label ?? categoryId;
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
  },
];
