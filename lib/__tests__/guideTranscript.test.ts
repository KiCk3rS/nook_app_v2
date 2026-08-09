import {
  findActiveSegmentIndex,
  getGuideTranscript,
} from '../guideTranscript';
import type { TranscriptSegment } from '../../types/api';

describe('getGuideTranscript', () => {
  it('retourne les mocks connus', () => {
    expect(getGuideTranscript('1-a').length).toBeGreaterThan(0);
    expect(getGuideTranscript('2-a').length).toBeGreaterThan(0);
  });

  it('retourne [] pour un id inconnu', () => {
    expect(getGuideTranscript('uuid-inconnu')).toEqual([]);
  });
});

describe('findActiveSegmentIndex', () => {
  const segments: TranscriptSegment[] = [
    { id: '1', startMs: 0, endMs: 1000, text: 'a' },
    { id: '2', startMs: 1000, endMs: 2000, text: 'b' },
    { id: '3', startMs: 2000, endMs: 3000, text: 'c' },
  ];

  it('retourne -1 si vide', () => {
    expect(findActiveSegmentIndex([], 100)).toBe(-1);
  });

  it('trouve le segment actif', () => {
    expect(findActiveSegmentIndex(segments, 0)).toBe(0);
    expect(findActiveSegmentIndex(segments, 1500)).toBe(1);
    expect(findActiveSegmentIndex(segments, 2500)).toBe(2);
  });

  it('reste sur le dernier après la fin', () => {
    expect(findActiveSegmentIndex(segments, 5000)).toBe(2);
  });
});
