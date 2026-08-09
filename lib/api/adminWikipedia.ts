import { apiRequest, buildQuery } from './client';

export interface WikipediaSearchItem {
  title: string;
  wikipediaUrl: string;
  description: string | null;
  thumbnailUrl: string | null;
}

export interface WikipediaSearchResponse {
  items: WikipediaSearchItem[];
}

export interface SearchWikipediaQuery {
  q: string;
  lang?: string;
  limit?: number;
}

/** `GET /api/v1/admin/wikipedia/search` — JWT ADMIN requis. */
export function searchWikipedia(
  query: SearchWikipediaQuery,
): Promise<WikipediaSearchResponse> {
  const qs = buildQuery({
    q: query.q,
    lang: query.lang,
    limit: query.limit,
  });
  return apiRequest<WikipediaSearchResponse>(`/admin/wikipedia/search?${qs}`, {
    auth: true,
  });
}
