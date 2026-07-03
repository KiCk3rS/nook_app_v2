import { isApiConfigured } from '../config';
import type { AudioGuide } from '../../constants/mockPlaces';
import type {
  CreditsBalance,
  GenerateAudioGuidePayload,
  GenerateAudioGuideResponse,
} from '../../types/audioGuideCreation';
import { apiRequest } from './client';
import {
  mockFetchCreditsBalance,
  mockFetchPrivateGuidesForPlace,
  mockGenerateAudioGuide,
  mockPurchaseCreditsPack,
  resetDemoCreditsBalance,
} from '../mockAudioGuideCreation';

export { resetDemoCreditsBalance };

function useMockAudioGuideLayer(demoSession?: boolean): boolean {
  return !isApiConfigured() || demoSession === true;
}

export function fetchCreditsBalance(options?: {
  demoSession?: boolean;
  hasSubscription?: boolean;
}): Promise<CreditsBalance> {
  if (useMockAudioGuideLayer(options?.demoSession)) {
    return mockFetchCreditsBalance(options);
  }
  return apiRequest<CreditsBalance>('/me/credits', { auth: true });
}

export function generateAudioGuide(
  userId: string,
  poiId: string,
  placeName: string,
  payload: GenerateAudioGuidePayload,
  hasSubscription: boolean,
  demoSession = false,
): Promise<GenerateAudioGuideResponse> {
  if (useMockAudioGuideLayer(demoSession)) {
    return mockGenerateAudioGuide(userId, poiId, placeName, payload, hasSubscription);
  }
  return apiRequest<GenerateAudioGuideResponse>(`/me/pois/${poiId}/audio-guides/generate`, {
    method: 'POST',
    auth: true,
    body: payload,
  });
}

export function fetchPrivateGuidesForPlace(
  userId: string,
  poiId: string,
  demoSession = false,
): Promise<AudioGuide[]> {
  if (useMockAudioGuideLayer(demoSession)) {
    return mockFetchPrivateGuidesForPlace(userId, poiId);
  }
  return apiRequest<AudioGuide[]>(`/me/pois/${poiId}/audio-guides`, { auth: true });
}

export function purchaseCreditsPack(
  credits: number,
  demoSession = false,
): Promise<CreditsBalance> {
  if (useMockAudioGuideLayer(demoSession)) {
    return mockPurchaseCreditsPack(credits);
  }
  return apiRequest<CreditsBalance>('/me/credits/purchase', {
    method: 'POST',
    auth: true,
    body: { credits },
  });
}
