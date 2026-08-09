import { PLACE_IMAGE_PLACEHOLDER } from '../../constants/placeImages';
import type {
  EditorialItinerary,
  EditorialItineraryCategoryCount,
  EditorialItineraryDetail,
  EditorialItineraryHubSummary,
  EditorialItineraryStep,
  ItineraryDifficulty,
} from '../../types/api';

const DIFFICULTIES = new Set<ItineraryDifficulty>(['EASY', 'MEDIUM', 'HARD']);

function asDifficulty(value: unknown): ItineraryDifficulty {
  if (typeof value === 'string' && DIFFICULTIES.has(value as ItineraryDifficulty)) {
    return value as ItineraryDifficulty;
  }
  return 'EASY';
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

/** Clé de navigation / premium / favoris : slug stable seed, sinon id. */
export function editorialItineraryNavKey(
  itinerary: Pick<EditorialItinerary, 'id' | 'slug'>,
): string {
  const slug = itinerary.slug?.trim();
  return slug || itinerary.id;
}

export function editorialCoverImageUrl(
  coverImageUrl: string | null | undefined,
): string {
  const trimmed = coverImageUrl?.trim();
  return trimmed || PLACE_IMAGE_PLACEHOLDER;
}

export function editorialStepCount(
  itinerary: Pick<EditorialItinerary, 'stepCount' | 'stepPoiIds'>,
): number {
  if (typeof itinerary.stepCount === 'number' && itinerary.stepCount >= 0) {
    return itinerary.stepCount;
  }
  return itinerary.stepPoiIds?.length ?? 0;
}

export function mapEditorialItineraryCategoryCounts(
  categories: EditorialItineraryCategoryCount[] | unknown,
): Record<string, number> {
  if (!Array.isArray(categories)) return {};
  const counts: Record<string, number> = {};
  for (const entry of categories) {
    if (!entry || typeof entry !== 'object') continue;
    const slug = asString((entry as EditorialItineraryCategoryCount).slug).trim();
    if (!slug) continue;
    counts[slug] = asNumber(
      (entry as EditorialItineraryCategoryCount).itineraryCount,
      0,
    );
  }
  return counts;
}

export function mapEditorialItineraryHubSummary(
  summary: EditorialItineraryHubSummary | null | undefined,
  citySlug: string,
  districtSlug?: string | null,
): EditorialItinerary | null {
  if (!summary || typeof summary !== 'object') return null;
  const id = asString(summary.id).trim();
  const slug = asString(summary.slug).trim() || id;
  if (!id && !slug) return null;

  return {
    id: id || slug,
    slug,
    citySlug,
    districtSlug: districtSlug ?? null,
    categorySlug: asString(summary.categorySlug),
    title: asString(summary.title),
    description: '',
    coverImageUrl: asNullableString(summary.coverImageUrl),
    durationMinutes: asNumber(summary.durationMinutes),
    distanceMeters: asNumber(summary.distanceMeters),
    difficulty: asDifficulty(summary.difficulty),
    stepCount: 0,
    stepPoiIds: [],
    isPremium: asBoolean(summary.isPremium, true),
    priceLabel: asNullableString(summary.priceLabel),
    editorialOrder: 0,
  };
}

function mapStep(raw: unknown): EditorialItineraryStep | null {
  if (!raw || typeof raw !== 'object') return null;
  const step = raw as Record<string, unknown>;
  const poiId = asString(step.poiId).trim();
  if (!poiId) return null;
  return {
    order: asNumber(step.order),
    poiId,
    title: asString(step.title, poiId),
    lat: typeof step.lat === 'number' ? step.lat : null,
    lng: typeof step.lng === 'number' ? step.lng : null,
  };
}

export function mapEditorialItineraryListItem(
  raw: unknown,
): EditorialItinerary | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = asString(item.id).trim();
  const slug = asString(item.slug).trim() || id;
  if (!id && !slug) return null;

  const stepPoiIds = asStringArray(item.stepPoiIds);
  const stepCount = asNumber(item.stepCount, stepPoiIds.length);

  return {
    id: id || slug,
    slug,
    citySlug: asString(item.citySlug),
    districtSlug: asNullableString(item.districtSlug),
    categorySlug: asString(item.categorySlug),
    title: asString(item.title),
    description: asString(item.description),
    coverImageUrl: asNullableString(item.coverImageUrl),
    durationMinutes: asNumber(item.durationMinutes),
    distanceMeters: asNumber(item.distanceMeters),
    difficulty: asDifficulty(item.difficulty),
    stepCount,
    stepPoiIds,
    isPremium: asBoolean(item.isPremium),
    priceLabel: asNullableString(item.priceLabel),
    editorialOrder: asNumber(item.editorialOrder),
  };
}

export function mapEditorialItineraryDetail(
  raw: unknown,
): EditorialItineraryDetail | null {
  const base = mapEditorialItineraryListItem(raw);
  if (!base) return null;

  const item = raw as Record<string, unknown>;
  const steps = Array.isArray(item.steps)
    ? item.steps
        .map(mapStep)
        .filter((step): step is EditorialItineraryStep => step != null)
        .sort((a, b) => a.order - b.order)
    : [];

  const stepPoiIds =
    steps.length > 0 ? steps.map((step) => step.poiId) : base.stepPoiIds;

  return {
    ...base,
    stepPoiIds,
    stepCount: steps.length > 0 ? steps.length : base.stepCount,
    steps,
  };
}
