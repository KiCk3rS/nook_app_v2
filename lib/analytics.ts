/** Stub analytics — branchement futur sans données personnelles. */

export type PermissionSheetSource = 'map_control' | 'banner_a13';

export type PermissionRequestType = 'location_when_in_use';

export type PermissionRequestResult = 'granted' | 'denied' | 'blocked';

export type HubCitySource = 'search' | 'feed' | 'deeplink' | 'direct' | 'country_hub';

export function trackPermissionSheetOpened(_source: PermissionSheetSource): void {
  // permission_sheet_opened
}

export function trackPermissionSheetDismissed(): void {
  // permission_sheet_dismissed
}

export function trackPermissionRequestStarted(_type: PermissionRequestType): void {
  // permission_request_started
}

export function trackPermissionRequestResult(
  _type: PermissionRequestType,
  _result: PermissionRequestResult,
): void {
  // permission_request_result
}

export function trackSearchSheetOpened(): void {
  // search_sheet_opened
}

export function trackSearchSheetDismissed(): void {
  // search_sheet_dismissed
}

export function trackSearchQuery(_queryLength: number): void {
  // search_query — bucket length only, not raw text
}

export function trackSearchResultTap(_placeId: string): void {
  // search_result_tap
}

export function trackPromotedHidden(): void {
  // promoted_hidden
}

export function trackHubCityViewed(_citySlug: string, _source: HubCitySource): void {
  // hub_city_viewed
}

export function trackHubCityCategoryTapped(_citySlug: string, _categorySlug: string): void {
  // hub_city_category_tapped
}

export function trackHubCityPremiumTapped(
  _citySlug: string,
  _itineraryId: string,
  _isLocked: boolean,
): void {
  // hub_city_premium_tapped
}

export function trackHubCityPoiTapped(
  _citySlug: string,
  _poiId: string,
  _section: 'must_see' | 'recommended',
): void {
  // hub_city_poi_tapped
}

export function trackHubCityAffiliateTapped(
  _citySlug: string,
  _partnerId: string,
  _slot: 'map' | 'experience',
  _itemId: string,
): void {
  // hub_city_affiliate_tapped
}

export function trackHubCityMapCtaTapped(_citySlug: string): void {
  // hub_city_map_cta_tapped
}

export function trackItineraryCategoryListViewed(
  _citySlug: string,
  _categorySlug: string,
  _itemCount: number,
): void {
  // itinerary_category_list_viewed
}

export function trackEditorialItineraryViewed(
  _itineraryId: string,
  _citySlug: string,
  _isLocked: boolean,
): void {
  // editorial_itinerary_viewed
}

export function trackPremiumPaywallViewed(
  _itineraryId: string,
  _sourceScreen: string,
): void {
  // premium_paywall_viewed
}

export function trackPremiumOfferSelected(_offerType: string, _itineraryId: string): void {
  // premium_offer_selected
}

export function trackPremiumPurchaseStarted(_offerType: string, _itineraryId: string): void {
  // premium_purchase_started
}

export function trackPremiumPurchaseSuccess(_offerType: string, _itineraryId: string): void {
  // premium_purchase_success
}

export function trackPremiumRestoreTapped(): void {
  // premium_restore_tapped
}

export function trackPremiumPaywallDismissed(_itineraryId?: string): void {
  // premium_paywall_dismissed
}
