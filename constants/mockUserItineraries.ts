import type { UserItinerary } from '../types/api';

export const MOCK_USER_ITINERARIES: UserItinerary[] = [
  {
    id: 'mock-itinerary-1',
    title: 'Balade du Marais',
    stepCount: 5,
    estimatedDurationMinutes: 90,
    distanceMeters: 3200,
    updatedAt: '2026-06-10T14:00:00Z',
  },
  {
    id: 'mock-itinerary-2',
    title: 'Monuments de Paris',
    stepCount: 4,
    estimatedDurationMinutes: 120,
    distanceMeters: 5100,
    updatedAt: '2026-06-05T09:30:00Z',
  },
  {
    id: 'mock-itinerary-3',
    title: 'Pause café & culture',
    stepCount: 1,
    estimatedDurationMinutes: 45,
    distanceMeters: 800,
    updatedAt: '2026-05-28T16:15:00Z',
  },
];
