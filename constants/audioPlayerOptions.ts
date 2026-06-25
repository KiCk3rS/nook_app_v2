export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export type SleepTimerMode = 'off' | 'minutes' | 'endOfGuide';

export interface SleepTimerValue {
  mode: SleepTimerMode;
  minutes?: number;
}
