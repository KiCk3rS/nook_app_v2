/** POI mock avec hub site A4.6 (`presentation: HUB`). */
export const LOUVRE_SITE_HUB_POI_ID = '2';

export const LOUVRE_SITE_HUB_MUST_SEE_IDS = ['7', '8', '9', '11'] as const;

export const LOUVRE_SITE_HUB_RECOMMENDED_IDS = [] as const;

export function isMockSiteHubPoiId(poiId: string): boolean {
  return poiId === LOUVRE_SITE_HUB_POI_ID;
}
