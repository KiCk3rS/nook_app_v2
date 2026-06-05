/** Stub analytics — branchement futur sans données personnelles. */

export type PermissionSheetSource = 'map_control' | 'banner_a13';

export type PermissionRequestType = 'location_when_in_use';

export type PermissionRequestResult = 'granted' | 'denied' | 'blocked';

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
