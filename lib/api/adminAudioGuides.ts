import type {
  AudioGuideJob,
  AudioGuideJobStatus,
} from '../../types/audioGuideCreation';
import {
  awaitAudioGuideJob,
  mapGenerateAudioGuideError,
  type AudioGuideGenerationOutcome,
  type AwaitAudioGuideJobOptions,
} from '../mappers/audioGuideCreation';
import { apiRequest } from './client';

/** Statuts Prisma renvoyés par `GET /admin/audio-guides/jobs/:jobId`. */
export type AdminAudioGuideJobRawStatus =
  | 'PENDING'
  | 'FETCHING_SOURCE'
  | 'SCRIPTING'
  | 'SYNTHESIZING'
  | 'UPLOADING'
  | 'COMPLETED'
  | 'FAILED';

export interface GenerateAdminAudioGuidePayload {
  wikipediaUrl: string;
  language?: string;
  targetDurationMinutes?: number;
}

export interface GenerateAdminAudioGuideResponse {
  jobId: string;
}

export interface AdminAudioGuideJobDto {
  id: string;
  status: AdminAudioGuideJobRawStatus;
  poiId: string;
  sourceUrl: string;
  language: string;
  targetDurationMinutes: number | null;
  audioId: string | null;
  errorMessage: string | null;
}

export interface RetryAdminAudioGuideJobResponse {
  accepted: true;
  jobId: string;
}

export interface AdminGenerateAudioGuideAwaitResult {
  response: GenerateAdminAudioGuideResponse;
  job: AudioGuideJob | null;
  outcome: AudioGuideGenerationOutcome;
  errorMessage?: string | null;
}

/** Mappe le statut Prisma / admin vers le modèle UI `pending` | `ready` | `error`. */
export function mapAdminAudioGuideJobStatus(
  status: AdminAudioGuideJobRawStatus,
): AudioGuideJobStatus {
  if (status === 'COMPLETED') return 'ready';
  if (status === 'FAILED') return 'error';
  return 'pending';
}

export function toAudioGuideJobFromAdmin(
  job: AdminAudioGuideJobDto,
): AudioGuideJob {
  return {
    id: job.id,
    status: mapAdminAudioGuideJobStatus(job.status),
    guideId: job.audioId,
    errorMessage: job.errorMessage,
  };
}

/** Infère `fr` / `en` depuis `https://{lang}.wikipedia.org/wiki/...`. */
export function inferLanguageFromWikipediaUrl(url: string): string | undefined {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const match = /^([a-z]{2,3})\.wikipedia\.org$/.exec(host);
    return match?.[1];
  } catch {
    return undefined;
  }
}

/** `POST /api/v1/admin/pois/:poiId/audio-guides/generate` — 202 + jobId. */
export async function generateAdminAudioGuide(
  poiId: string,
  payload: GenerateAdminAudioGuidePayload,
): Promise<GenerateAdminAudioGuideResponse> {
  try {
    return await apiRequest<GenerateAdminAudioGuideResponse>(
      `/admin/pois/${poiId}/audio-guides/generate`,
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

/** `GET /api/v1/admin/audio-guides/jobs/:jobId`. */
export async function getAdminAudioGuideJob(
  jobId: string,
): Promise<AudioGuideJob> {
  const raw = await apiRequest<AdminAudioGuideJobDto>(
    `/admin/audio-guides/jobs/${jobId}`,
    { auth: true },
  );
  return toAudioGuideJobFromAdmin(raw);
}

/** `POST /api/v1/admin/audio-guides/jobs/:jobId/retry`. */
export async function retryAdminAudioGuideJob(
  jobId: string,
): Promise<RetryAdminAudioGuideJobResponse> {
  try {
    return await apiRequest<RetryAdminAudioGuideJobResponse>(
      `/admin/audio-guides/jobs/${jobId}/retry`,
      {
        method: 'POST',
        auth: true,
      },
    );
  } catch (error) {
    mapGenerateAudioGuideError(error);
  }
}

/**
 * Lance la génération admin puis poll jusqu’à ready / error.
 * Ne touche pas aux crédits.
 */
export async function generateAdminAudioGuideAndAwaitJob(
  poiId: string,
  payload: GenerateAdminAudioGuidePayload,
  options?: AwaitAudioGuideJobOptions,
): Promise<AdminGenerateAudioGuideAwaitResult> {
  const response = await generateAdminAudioGuide(poiId, payload);
  return {
    response,
    ...(await awaitAudioGuideJob(response.jobId, getAdminAudioGuideJob, options)),
  };
}

/** Relance un job terminal puis poll jusqu’à ready / error. */
export async function retryAdminAudioGuideAndAwaitJob(
  jobId: string,
  options?: AwaitAudioGuideJobOptions,
): Promise<AdminGenerateAudioGuideAwaitResult> {
  const retry = await retryAdminAudioGuideJob(jobId);
  return {
    response: { jobId: retry.jobId },
    ...(await awaitAudioGuideJob(retry.jobId, getAdminAudioGuideJob, options)),
  };
}
