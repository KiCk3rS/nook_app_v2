import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AudioGuide } from '../constants/mockPlaces';
import { getTierCreditCost } from '../constants/audioGuideTiers';
import type {
  AudioGuideJob,
  CreditsBalance,
  DurationTier,
  GenerateAudioGuidePayload,
  GenerateAudioGuideResponse,
} from '../types/audioGuideCreation';
import { AudioGuideGenerationError } from '../types/audioGuideCreation';
import { isValidWikipediaUrl } from './wikipediaUrl';

const STORAGE_KEY = 'nook:audioGuideCreation:v1';

const MOCK_READY_DELAY_MS = 8000;

/** Solde généreux pour la session démo (tests génération A3.3). */
export const DEMO_MOCK_CREDITS: CreditsBalance = {
  creditsBalance: 50,
  subscriptionGenerationsRemaining: 10,
};

export const DEFAULT_MOCK_CREDITS: CreditsBalance = {
  creditsBalance: 4,
  subscriptionGenerationsRemaining: 2,
};

export const CREDIT_PACK_OPTIONS = [
  { productId: 'credits_5', credits: 5, priceLabel: '2,99 €' },
  { productId: 'credits_15', credits: 15, priceLabel: '6,99 €' },
  { productId: 'credits_30', credits: 30, priceLabel: '11,99 €' },
] as const;

interface StoredJob {
  id: string;
  guideId: string;
  poiId: string;
  userId: string;
  status: 'pending' | 'ready' | 'error';
  tier: DurationTier;
  wikipediaUrl: string;
  language: string;
  createdAt: number;
  readyAt?: number;
}

interface StoredGuide extends AudioGuide {
  poiId: string;
  userId: string;
  jobId: string;
  wikipediaUrl: string;
}

interface AudioGuideCreationStore {
  credits: CreditsBalance;
  jobs: Record<string, StoredJob>;
  guides: Record<string, StoredGuide>;
}

function createEmptyStore(): AudioGuideCreationStore {
  return {
    credits: { ...DEFAULT_MOCK_CREDITS },
    jobs: {},
    guides: {},
  };
}

async function loadStore(): Promise<AudioGuideCreationStore> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyStore();
    const parsed = JSON.parse(raw) as AudioGuideCreationStore;
    return {
      credits: { ...DEFAULT_MOCK_CREDITS, ...parsed.credits },
      jobs: parsed.jobs ?? {},
      guides: parsed.guides ?? {},
    };
  } catch {
    return createEmptyStore();
  }
}

async function saveStore(store: AudioGuideCreationStore): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function tierDurationSec(tier: DurationTier): number {
  if (tier === 'short') return 150;
  if (tier === 'detailed') return 540;
  return 270;
}

function tierTitle(tier: DurationTier, placeName: string): string {
  if (tier === 'short') return `${placeName} — version courte`;
  if (tier === 'detailed') return `${placeName} — version détaillée`;
  return `${placeName} — mon guide`;
}

function makeGuideFromJob(
  job: StoredJob,
  placeName: string,
  status: AudioGuide['status'],
): StoredGuide {
  return {
    id: job.guideId,
    poiId: job.poiId,
    userId: job.userId,
    jobId: job.id,
    wikipediaUrl: job.wikipediaUrl,
    title: tierTitle(job.tier, placeName),
    summary: `Guide privé généré à partir de l’article Wikipedia indiqué.`,
    durationSec: status === 'ready' ? tierDurationSec(job.tier) : null,
    language: job.language,
    authorName: 'Moi',
    publishedAt: 'À l’instant',
    status,
    rating: null,
    isPrivate: true,
  };
}

export async function resetDemoCreditsBalance(): Promise<CreditsBalance> {
  const store = await loadStore();
  store.credits = { ...DEMO_MOCK_CREDITS };
  await saveStore(store);
  return { ...store.credits };
}

/** Regarnit le solde démo si insuffisant pour lancer une génération. */
export async function ensureDemoCreditsBalance(
  hasSubscription: boolean,
): Promise<CreditsBalance> {
  const store = await loadStore();
  const canGenerate = resolveAffordance(store.credits, 'detailed', hasSubscription).canAfford;
  if (!canGenerate) {
    store.credits = {
      creditsBalance: Math.max(store.credits.creditsBalance, DEMO_MOCK_CREDITS.creditsBalance),
      subscriptionGenerationsRemaining: Math.max(
        store.credits.subscriptionGenerationsRemaining,
        DEMO_MOCK_CREDITS.subscriptionGenerationsRemaining,
      ),
    };
    await saveStore(store);
  }
  return { ...store.credits };
}

export async function mockFetchCreditsBalance(
  options?: { demoSession?: boolean; hasSubscription?: boolean },
): Promise<CreditsBalance> {
  if (options?.demoSession) {
    return ensureDemoCreditsBalance(options.hasSubscription ?? false);
  }
  const store = await loadStore();
  return { ...store.credits };
}

export async function mockPurchaseCreditsPack(credits: number): Promise<CreditsBalance> {
  const store = await loadStore();
  store.credits.creditsBalance += credits;
  await saveStore(store);
  return { ...store.credits };
}

export type AffordanceResult = {
  canAfford: boolean;
  paymentType: 'subscription_quota' | 'credits' | null;
};

export function resolveAffordance(
  balance: CreditsBalance,
  tier: DurationTier,
  hasSubscription: boolean,
): AffordanceResult {
  const cost = getTierCreditCost(tier);
  if (hasSubscription && balance.subscriptionGenerationsRemaining > 0) {
    return { canAfford: true, paymentType: 'subscription_quota' };
  }
  if (balance.creditsBalance >= cost) {
    return { canAfford: true, paymentType: 'credits' };
  }
  return { canAfford: false, paymentType: null };
}

export async function mockGenerateAudioGuide(
  userId: string,
  poiId: string,
  placeName: string,
  payload: GenerateAudioGuidePayload,
  hasSubscription: boolean,
): Promise<GenerateAudioGuideResponse> {
  if (!isValidWikipediaUrl(payload.wikipediaUrl)) {
    throw new AudioGuideGenerationError('INVALID_URL', undefined, 422);
  }

  const store = await loadStore();
  const affordance = resolveAffordance(store.credits, payload.durationTier, hasSubscription);

  if (!affordance.canAfford || !affordance.paymentType) {
    throw new AudioGuideGenerationError('INSUFFICIENT_CREDITS', undefined, 402);
  }

  if (affordance.paymentType === 'subscription_quota') {
    store.credits.subscriptionGenerationsRemaining = Math.max(
      0,
      store.credits.subscriptionGenerationsRemaining - 1,
    );
  } else {
    store.credits.creditsBalance -= getTierCreditCost(payload.durationTier);
  }

  const jobId = `job-${Date.now()}`;
  const guideId = `user-guide-${Date.now()}`;
  const job: StoredJob = {
    id: jobId,
    guideId,
    poiId,
    userId,
    status: 'pending',
    tier: payload.durationTier,
    wikipediaUrl: payload.wikipediaUrl.trim(),
    language: payload.language,
    createdAt: Date.now(),
  };

  store.jobs[jobId] = job;
  store.guides[guideId] = makeGuideFromJob(job, placeName, 'pending');
  await saveStore(store);

  setTimeout(() => {
    void completeMockJob(jobId, placeName);
  }, MOCK_READY_DELAY_MS);

  return {
    jobId,
    guideId,
    paymentType: affordance.paymentType,
  };
}

function advanceMockJobIfReady(
  store: AudioGuideCreationStore,
  job: StoredJob,
  now = Date.now(),
): boolean {
  if (job.status !== 'pending' || now - job.createdAt < MOCK_READY_DELAY_MS) {
    return false;
  }

  job.status = 'ready';
  job.readyAt = now;
  const placeName =
    store.guides[job.guideId]?.title.split(' — ')[0] ?? 'Ce lieu';
  store.guides[job.guideId] = makeGuideFromJob(job, placeName, 'ready');
  return true;
}

function advancePendingMockJobsForPlace(
  store: AudioGuideCreationStore,
  userId: string,
  poiId: string,
  now = Date.now(),
): boolean {
  let changed = false;
  for (const job of Object.values(store.jobs)) {
    if (job.userId === userId && job.poiId === poiId && advanceMockJobIfReady(store, job, now)) {
      changed = true;
    }
  }
  return changed;
}

export async function mockFetchAudioGuideJob(jobId: string): Promise<AudioGuideJob> {
  const store = await loadStore();
  const job = store.jobs[jobId];
  if (!job) {
    throw new AudioGuideGenerationError('JOB_NOT_FOUND', undefined, 404);
  }

  if (advanceMockJobIfReady(store, job)) {
    await saveStore(store);
  }

  return {
    id: job.id,
    status: job.status,
    guideId: job.guideId,
    errorMessage: job.status === 'error' ? 'La génération a échoué.' : null,
  };
}

async function completeMockJob(jobId: string, placeName: string): Promise<void> {
  const store = await loadStore();
  const job = store.jobs[jobId];
  if (!job || job.status !== 'pending') return;

  job.status = 'ready';
  job.readyAt = Date.now();
  store.guides[job.guideId] = makeGuideFromJob(job, placeName, 'ready');
  await saveStore(store);
}

export async function mockFetchPrivateGuidesForPlace(
  userId: string,
  poiId: string,
): Promise<AudioGuide[]> {
  const store = await loadStore();

  if (advancePendingMockJobsForPlace(store, userId, poiId)) {
    await saveStore(store);
  }

  return Object.values(store.guides)
    .filter((guide) => guide.userId === userId && guide.poiId === poiId)
    .map(
      ({
        poiId: _poiId,
        userId: _userId,
        jobId: _jobId,
        wikipediaUrl: _url,
        ...guide
      }) => guide,
    )
    .sort((a, b) => (a.status === 'pending' ? -1 : 1));
}
