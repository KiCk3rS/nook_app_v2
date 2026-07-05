export type DurationTier = 'short' | 'normal' | 'detailed';

export type AudioGuideJobStatus = 'pending' | 'ready' | 'error';

export interface AudioGuideJob {
  id: string;
  status: AudioGuideJobStatus;
  guideId: string;
  errorMessage: string | null;
}

export interface CreditsBalance {
  creditsBalance: number;
  subscriptionGenerationsRemaining: number;
}

export interface GenerateAudioGuidePayload {
  wikipediaUrl: string;
  durationTier: DurationTier;
  language: string;
}

export interface GenerateAudioGuideResponse {
  jobId: string;
  guideId: string;
  paymentType: 'credits' | 'subscription_quota';
}

export type GenerateAudioGuideErrorCode =
  | 'INSUFFICIENT_CREDITS'
  | 'INVALID_URL'
  | 'RATE_LIMITED'
  | 'VALIDATION'
  | 'NETWORK'
  | 'POLL_TIMEOUT'
  | 'JOB_NOT_FOUND';

export class AudioGuideGenerationError extends Error {
  constructor(
    public readonly code: GenerateAudioGuideErrorCode,
    message?: string,
    public readonly statusCode?: number,
  ) {
    super(message ?? code);
    this.name = 'AudioGuideGenerationError';
  }
}
