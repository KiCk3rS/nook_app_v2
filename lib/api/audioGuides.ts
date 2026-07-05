import { shouldUseMockData } from '../config';
import type { AudioGuide } from '../../constants/mockPlaces';
import type {
  AudioGuideJob,
  CreditsBalance,
  GenerateAudioGuidePayload,
  GenerateAudioGuideResponse,
} from '../../types/audioGuideCreation';
import { AudioGuideGenerationError } from '../../types/audioGuideCreation';
import {
  mapGenerateAudioGuideError,
  pollAudioGuideJobUntilTerminal,
  resolveAudioGuideAwaitOutcome,
  type GenerateAudioGuideAwaitResult,
} from '../mappers/audioGuideCreation';
import { apiRequest } from './client';
import {
  mockFetchAudioGuideJob,
  mockFetchCreditsBalance,
  mockFetchPrivateGuidesForPlace,
  mockGenerateAudioGuide,
  mockPurchaseCreditsPack,
  resetDemoCreditsBalance,
} from '../mockAudioGuideCreation';

export { resetDemoCreditsBalance };
export type { GenerateAudioGuideAwaitResult } from '../mappers/audioGuideCreation';
export {
  isTerminalAudioGuideJobStatus,
  mapGenerateAudioGuideError,
  pollAudioGuideJobUntilTerminal,
} from '../mappers/audioGuideCreation';

function usesMockLayer(demoSession = false): boolean {
  return shouldUseMockData(demoSession);
}

export function fetchCreditsBalance(options?: {
  demoSession?: boolean;
  hasSubscription?: boolean;
}): Promise<CreditsBalance> {
  if (usesMockLayer(options?.demoSession)) {
    return mockFetchCreditsBalance(options);
  }
  return apiRequest<CreditsBalance>('/me/credits', { auth: true });
}

export async function generateAudioGuide(
  userId: string,
  poiId: string,
  placeName: string,
  payload: GenerateAudioGuidePayload,
  hasSubscription: boolean,
  demoSession = false,
): Promise<GenerateAudioGuideResponse> {
  if (usesMockLayer(demoSession)) {
    return mockGenerateAudioGuide(userId, poiId, placeName, payload, hasSubscription);
  }
  try {
    return await apiRequest<GenerateAudioGuideResponse>(
      `/me/pois/${poiId}/audio-guides/generate`,
      {
        method: 'POST',
        auth: true,
        body: payload,
      },
    );
  } catch (error) {
    mapGenerateAudioGuideError(error);
  }
}

export function fetchAudioGuideJob(
  jobId: string,
  demoSession = false,
): Promise<AudioGuideJob> {
  if (usesMockLayer(demoSession)) {
    return mockFetchAudioGuideJob(jobId);
  }
  return apiRequest<AudioGuideJob>(`/me/audio-guides/jobs/${jobId}`, { auth: true });
}

export async function generateAudioGuideAndAwaitJob(
  userId: string,
  poiId: string,
  placeName: string,
  payload: GenerateAudioGuidePayload,
  hasSubscription: boolean,
  options?: {
    demoSession?: boolean;
    onGenerating?: () => void;
    poll?: {
      intervalMs?: number;
      maxAttempts?: number;
    };
  },
): Promise<GenerateAudioGuideAwaitResult> {
  const demoSession = options?.demoSession ?? false;
  const response = await generateAudioGuide(
    userId,
    poiId,
    placeName,
    payload,
    hasSubscription,
    demoSession,
  );

  options?.onGenerating?.();

  try {
    const job = await pollAudioGuideJobUntilTerminal(
      response.jobId,
      (id) => fetchAudioGuideJob(id, demoSession),
      options?.poll,
    );
    return { response, ...resolveAudioGuideAwaitOutcome(job) };
  } catch (error) {
    if (error instanceof AudioGuideGenerationError && error.code === 'POLL_TIMEOUT') {
      return { response, job: null, outcome: 'launched' };
    }
    throw error;
  }
}

export function fetchPrivateGuidesForPlace(
  userId: string,
  poiId: string,
  demoSession = false,
): Promise<AudioGuide[]> {
  if (usesMockLayer(demoSession)) {
    return mockFetchPrivateGuidesForPlace(userId, poiId);
  }
  return apiRequest<AudioGuide[]>(`/me/pois/${poiId}/audio-guides`, { auth: true });
}

export function purchaseCreditsPack(
  credits: number,
  demoSession = false,
): Promise<CreditsBalance> {
  if (usesMockLayer(demoSession)) {
    return mockPurchaseCreditsPack(credits);
  }
  return apiRequest<CreditsBalance>('/me/credits/purchase', {
    method: 'POST',
    auth: true,
    body: { credits },
  });
}
