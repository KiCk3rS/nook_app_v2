import { ApiError } from '../../types/api';
import type {
  AudioGuideJob,
  AudioGuideJobStatus,
  GenerateAudioGuideResponse,
} from '../../types/audioGuideCreation';
import {
  AudioGuideGenerationError,
  type GenerateAudioGuideErrorCode,
} from '../../types/audioGuideCreation';

const DEFAULT_POLL_INTERVAL_MS = 2000;
const DEFAULT_POLL_MAX_ATTEMPTS = 150;

export type AudioGuideGenerationOutcome = 'ready' | 'launched' | 'failed';

export interface GenerateAudioGuideAwaitResult {
  response: GenerateAudioGuideResponse;
  job: AudioGuideJob | null;
  outcome: AudioGuideGenerationOutcome;
  errorMessage?: string | null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function isTerminalAudioGuideJobStatus(status: AudioGuideJobStatus): boolean {
  return status === 'ready' || status === 'error';
}

export function mapGenerateAudioGuideError(error: unknown): never {
  if (error instanceof AudioGuideGenerationError) {
    throw error;
  }
  if (error instanceof ApiError) {
    let code: GenerateAudioGuideErrorCode = 'NETWORK';
    if (
      error.statusCode === 402 ||
      error.code === 'AUDIO_GUIDE_INSUFFICIENT_CREDITS'
    ) {
      code = 'INSUFFICIENT_CREDITS';
    } else if (error.statusCode === 429) {
      code = 'RATE_LIMITED';
    } else if (error.statusCode === 422) {
      code =
        error.code === 'INVALID_URL' || error.details?.wikipediaUrl
          ? 'INVALID_URL'
          : 'VALIDATION';
    }
    throw new AudioGuideGenerationError(code, error.message, error.statusCode);
  }
  throw error;
}

export async function pollAudioGuideJobUntilTerminal(
  jobId: string,
  fetchJob: (id: string) => Promise<AudioGuideJob>,
  options?: {
    intervalMs?: number;
    maxAttempts?: number;
  },
): Promise<AudioGuideJob> {
  const intervalMs = options?.intervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const maxAttempts = options?.maxAttempts ?? DEFAULT_POLL_MAX_ATTEMPTS;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const job = await fetchJob(jobId);
    if (isTerminalAudioGuideJobStatus(job.status)) {
      return job;
    }
    await delay(intervalMs);
  }

  throw new AudioGuideGenerationError(
    'POLL_TIMEOUT',
    'Le délai d’attente de génération est dépassé.',
  );
}

export function resolveAudioGuideAwaitOutcome(
  job: AudioGuideJob,
): Pick<GenerateAudioGuideAwaitResult, 'job' | 'outcome' | 'errorMessage'> {
  if (job.status === 'error') {
    return {
      job,
      outcome: 'failed',
      errorMessage: job.errorMessage,
    };
  }
  return { job, outcome: 'ready' };
}
