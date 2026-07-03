const WIKIPEDIA_HOST_PATTERN = /^([a-z]{2,3})\.wikipedia\.org$/i;

export function isValidWikipediaUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return false;
  }

  const hostMatch = WIKIPEDIA_HOST_PATTERN.exec(parsed.hostname);
  if (!hostMatch) return false;

  const path = decodeURIComponent(parsed.pathname);
  if (!path.startsWith('/wiki/')) return false;

  const articlePath = path.slice('/wiki/'.length);
  if (!articlePath || articlePath.includes('/Special:') || articlePath.startsWith('Special:')) {
    return false;
  }

  return true;
}
