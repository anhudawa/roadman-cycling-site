// Brand-mention detection for the citation-test runner. A run is considered
// a "mention" if either:
//   * a known brand term appears in the response text (case-insensitive), or
//   * a URL hosted on roadmancycling.com appears in the provider's citation
//     list (currently only Perplexity surfaces these natively).

const TERMS = ["roadman", "roadmancycling.com", "the roadman podcast"] as const;
const URL_HOSTS = ["roadmancycling.com"] as const;

export interface DetectResult {
  mentioned: boolean;
  matchedTerms: string[];
  matchedUrls: string[];
}

export function detect(
  response: string | null,
  citations: string[],
): DetectResult {
  const text = (response ?? "").toLowerCase();
  const matchedTerms = TERMS.filter((t) => text.includes(t));
  const matchedUrls = (citations ?? []).filter((c) => {
    const lower = (c ?? "").toLowerCase();
    return URL_HOSTS.some((h) => lower.includes(h));
  });
  return {
    mentioned: matchedTerms.length > 0 || matchedUrls.length > 0,
    matchedTerms,
    matchedUrls,
  };
}
