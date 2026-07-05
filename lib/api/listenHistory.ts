import type {
  ListenHistoryEntry,
  PaginatedResponse,
} from '../../types/api';
import { apiRequest, buildQuery } from './client';

export interface ListListenHistoryQuery {
  limit?: number;
  offset?: number;
}

export interface PostListenProgressPayload {
  audioId: string;
  poiId?: string;
  progressSeconds?: number;
}

export function fetchListenHistory(
  query: ListListenHistoryQuery = {},
): Promise<PaginatedResponse<ListenHistoryEntry>> {
  const qs = buildQuery({
    limit: query.limit,
    offset: query.offset,
  });
  const suffix = qs ? `?${qs}` : '';
  return apiRequest<PaginatedResponse<ListenHistoryEntry>>(
    `/me/listen-history${suffix}`,
    { auth: true },
  );
}

export function postListenProgress(
  payload: PostListenProgressPayload,
): Promise<ListenHistoryEntry> {
  return apiRequest<ListenHistoryEntry>('/me/listen-history', {
    method: 'POST',
    auth: true,
    body: payload,
  });
}
