export const PRIVACY_SECTION_KEYS = [
  'intro',
  'dataCollected',
  'location',
  'account',
  'audioAndAi',
  'retention',
  'rights',
  'contact',
] as const;

export const TERMS_SECTION_KEYS = [
  'intro',
  'service',
  'account',
  'content',
  'purchases',
  'acceptableUse',
  'liability',
  'changes',
  'contact',
] as const;

export type PrivacySectionKey = (typeof PRIVACY_SECTION_KEYS)[number];
export type TermsSectionKey = (typeof TERMS_SECTION_KEYS)[number];
