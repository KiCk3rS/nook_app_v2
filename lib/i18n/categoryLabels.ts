import i18n from './index';

export function getPlaceCategoryLabel(categoryId: string): string {
  const key = `categories:place.${categoryId}`;
  if (i18n.exists(key)) {
    return i18n.t(key);
  }
  return categoryId;
}

export function getItineraryCategoryLabel(slug: string): string {
  const key = `categories:itinerary.${slug}`;
  if (i18n.exists(key)) {
    return i18n.t(key);
  }
  return slug;
}

export function getDifficultyLabel(difficulty: string): string {
  const key = `categories:difficulty.${difficulty}`;
  if (i18n.exists(key)) {
    return i18n.t(key);
  }
  return difficulty;
}
