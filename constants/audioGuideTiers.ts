import type { DurationTier } from '../types/audioGuideCreation';

export interface AudioGuideTierConfig {
  id: DurationTier;
  creditCost: number;
  durationLabelKey: 'tierShortDuration' | 'tierNormalDuration' | 'tierDetailedDuration';
  labelKey: 'tierShort' | 'tierNormal' | 'tierDetailed';
}

export const AUDIO_GUIDE_TIERS: AudioGuideTierConfig[] = [
  {
    id: 'short',
    creditCost: 1,
    labelKey: 'tierShort',
    durationLabelKey: 'tierShortDuration',
  },
  {
    id: 'normal',
    creditCost: 2,
    labelKey: 'tierNormal',
    durationLabelKey: 'tierNormalDuration',
  },
  {
    id: 'detailed',
    creditCost: 3,
    labelKey: 'tierDetailed',
    durationLabelKey: 'tierDetailedDuration',
  },
];

export const DEFAULT_DURATION_TIER: DurationTier = 'normal';

export function getTierCreditCost(tier: DurationTier): number {
  return AUDIO_GUIDE_TIERS.find((item) => item.id === tier)?.creditCost ?? 2;
}
