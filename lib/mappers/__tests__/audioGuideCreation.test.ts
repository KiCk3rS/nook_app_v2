import { ApiError } from '../../../types/api';
import {
  isTerminalAudioGuideJobStatus,
  mapGenerateAudioGuideError,
  pollAudioGuideJobUntilTerminal,
  resolveAudioGuideAwaitOutcome,
} from '../audioGuideCreation';
import type { AudioGuideJob } from '../../../types/audioGuideCreation';
import { AudioGuideGenerationError } from '../../../types/audioGuideCreation';

describe('isTerminalAudioGuideJobStatus', () => {
  it('considère ready et error comme terminaux', () => {
    expect(isTerminalAudioGuideJobStatus('ready')).toBe(true);
    expect(isTerminalAudioGuideJobStatus('error')).toBe(true);
    expect(isTerminalAudioGuideJobStatus('pending')).toBe(false);
  });
});

describe('mapGenerateAudioGuideError', () => {
  it('mappe 402 vers INSUFFICIENT_CREDITS', () => {
    expect(() =>
      mapGenerateAudioGuideError(
        new ApiError('Crédits insuffisants.', 402, {
          code: 'AUDIO_GUIDE_INSUFFICIENT_CREDITS',
        }),
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'INSUFFICIENT_CREDITS',
        statusCode: 402,
      }),
    );
  });
});

describe('pollAudioGuideJobUntilTerminal', () => {
  it('s’arrête sur ready', async () => {
    const fetchJob = jest
      .fn<Promise<AudioGuideJob>, [string]>()
      .mockResolvedValueOnce({
        id: 'job-1',
        status: 'pending',
        guideId: 'guide-1',
        errorMessage: null,
      })
      .mockResolvedValueOnce({
        id: 'job-1',
        status: 'ready',
        guideId: 'guide-1',
        errorMessage: null,
      });

    const job = await pollAudioGuideJobUntilTerminal('job-1', fetchJob, {
      intervalMs: 0,
      maxAttempts: 5,
    });

    expect(job.status).toBe('ready');
    expect(fetchJob).toHaveBeenCalledTimes(2);
  });

  it('s’arrête sur error', async () => {
    const fetchJob = jest.fn<Promise<AudioGuideJob>, [string]>().mockResolvedValue({
      id: 'job-1',
      status: 'error',
      guideId: 'guide-1',
      errorMessage: 'Échec pipeline',
    });

    const job = await pollAudioGuideJobUntilTerminal('job-1', fetchJob, {
      intervalMs: 0,
      maxAttempts: 3,
    });

    expect(job.status).toBe('error');
    expect(job.errorMessage).toBe('Échec pipeline');
  });

  it('lève POLL_TIMEOUT après épuisement des tentatives', async () => {
    const fetchJob = jest.fn<Promise<AudioGuideJob>, [string]>().mockResolvedValue({
      id: 'job-1',
      status: 'pending',
      guideId: 'guide-1',
      errorMessage: null,
    });

    await expect(
      pollAudioGuideJobUntilTerminal('job-1', fetchJob, {
        intervalMs: 0,
        maxAttempts: 2,
      }),
    ).rejects.toMatchObject({ code: 'POLL_TIMEOUT' });
  });
});

describe('resolveAudioGuideAwaitOutcome', () => {
  it('retourne failed pour un job en erreur', () => {
    expect(
      resolveAudioGuideAwaitOutcome({
        id: 'job-1',
        status: 'error',
        guideId: 'guide-1',
        errorMessage: 'boom',
      }),
    ).toEqual({
      job: expect.objectContaining({ status: 'error' }),
      outcome: 'failed',
      errorMessage: 'boom',
    });
  });

  it('retourne ready pour un job terminé', () => {
    expect(
      resolveAudioGuideAwaitOutcome({
        id: 'job-1',
        status: 'ready',
        guideId: 'guide-1',
        errorMessage: null,
      }),
    ).toEqual({
      job: expect.objectContaining({ status: 'ready' }),
      outcome: 'ready',
    });
  });
});
