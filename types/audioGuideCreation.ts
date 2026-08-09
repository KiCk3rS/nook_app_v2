export type DurationTier = 'short' | 'normal' | 'detailed';

export type AudioGuideJobStatus = 'pending' | 'ready' | 'error';

export interface AudioGuideJob {
  id: string;
  status: AudioGuideJobStatus;
  /** Identifiant guide/audio produit ; `null` tant que non disponible. */
  guideId: string | null;
  errorMessage: string | null;
}

export interface CreditsBalance {
  creditsBalance: number;
  subscriptionGenerationsRemaining: number;
}

export interface CreditPack {
  productId: string;
  credits: number;
  priceLabel: string;
  currency?: string;
  priceCents?: number;
}

export interface CreditPacksResponse {
  items: CreditPack[];
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
