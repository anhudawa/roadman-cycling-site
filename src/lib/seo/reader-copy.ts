/** Narrow checks for internal publishing instructions leaking into reader copy.
 * These detect literal editorial mistakes, not literary quality or factual truth.
 */
const INTERNAL_SEARCH_LANGUAGE = [
  /\b(?:this|that|the) (?:page|guide|article|episode page) owns\b/i,
  /\b(?:what|why) this (?:page|guide|article) owns\b/i,
  /\bcanonical owner\b/i,
  /\bSearch Console footprint\b/i,
  /\b(?:search|query|diagnostic-checklist|kit-and-caps|biography-and-racecraft) intent\b/i,
];

export function findInternalSearchLanguage(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ");
  return INTERNAL_SEARCH_LANGUAGE.flatMap((pattern) => {
    const match = normalized.match(pattern);
    return match ? [match[0]] : [];
  });
}
