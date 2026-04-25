// Answer-engine (AI) referrer detection for AEO-003.
//
// Classifies inbound traffic that came from an AI assistant, either via:
//   (a) an explicit utm_source=<ai-host> parameter on the landing URL, or
//   (b) the browser's document.referrer header pointing at a known AI host.
//
// First-touch attribution is persisted to sessionStorage so subsequent
// in-session pageviews/signups are attributed back to the AI that sent them,
// not to the internal link the user happened to click after landing.
//
// Kept framework-agnostic so it can be imported by the client Tracker and
// by any future route-aware handlers (middleware, server components).

export type AIReferrerHost =
  | "chatgpt.com"
  | "perplexity.ai"
  | "claude.ai"
  | "gemini.google.com"
  | "copilot.microsoft.com"
  | "bing.com"
  | "you.com"
  | "phind.com"
  | "meta.ai"
  | "llms-txt";

/**
 * Canonicalised AI host slugs keyed by any hostname variant we might see in
 * the wild. Keys are matched via endsWith() against the inbound hostname so
 * www., chat., m. etc. subdomain prefixes all fold onto the same slug.
 *
 * `llms-txt` is a synthetic slug we stamp onto outbound URLs inside
 * /llms.txt and /llms-full.txt via `utm_source=llms-txt`. AI assistants
 * that strip referrer headers still preserve query strings, so this
 * survives where document.referrer doesn't.
 */
const HOST_MAP: Record<string, AIReferrerHost> = {
  "chatgpt.com": "chatgpt.com",
  "chat.openai.com": "chatgpt.com", // legacy ChatGPT hostname
  "perplexity.ai": "perplexity.ai",
  "claude.ai": "claude.ai",
  "gemini.google.com": "gemini.google.com",
  "bard.google.com": "gemini.google.com", // legacy Bard hostname
  "copilot.microsoft.com": "copilot.microsoft.com",
  "bing.com": "bing.com", // Bing Chat / Copilot search surface
  "you.com": "you.com",
  "phind.com": "phind.com",
  "meta.ai": "meta.ai",
  // Synthetic UTM-only slugs (never appear as hostnames $€” utm_source only).
  "llms-txt": "llms-txt",
  "llms.txt": "llms-txt",
  "llms-full-txt": "llms-txt",
  "llms-full.txt": "llms-txt",
};

const STORAGE_KEY = "roadman_ai_referrer";

/**
 * Match a hostname (or utm_source value) against the AI host map. Returns the
 * canonical slug or undefined. Safe to call with empty / undefined input.
 */
export function matchAIHost(input: string | null | undefined): AIReferrerHost | undefined {
  if (!input) return undefined;
  const lowered = input.toLowerCase().trim();
  if (!lowered) return undefined;

  // Direct hit (utm_source=chatgpt.com).
  if (HOST_MAP[lowered]) return HOST_MAP[lowered];

  // Subdomain fold (www.perplexity.ai $†’ perplexity.ai).
  for (const candidate of Object.keys(HOST_MAP)) {
    if (lowered === candidate || lowered.endsWith(`.${candidate}`)) {
      return HOST_MAP[candidate];
    }
  }
  return undefined;
}

/**
 * Detect an AI referrer from the current browser context. Prefers an explicit
 * `utm_source` parameter (since AI assistants increasingly tag outbound links)
 * and falls back to document.referrer. Returns undefined in non-browser envs.
 */
export function detectAIReferrerFromBrowser(): AIReferrerHost | undefined {
  if (typeof window === "undefined") return undefined;

  // 1. utm_source $€” strongest signal, survives cross-origin referrer loss.
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    const fromUtm = matchAIHost(utmSource);
    if (fromUtm) return fromUtm;
  } catch {
    // Ignore $€” malformed query string, keep going.
  }

  // 2. document.referrer hostname.
  const ref = typeof document !== "undefined" ? document.referrer : "";
  if (!ref) return undefined;
  try {
    const url = new URL(ref);
    return matchAIHost(url.hostname);
  } catch {
    return undefined;
  }
}

/**
 * Read the first-touch AI referrer for the current session, if any. Returns
 * undefined in non-browser envs or when no AI referrer has been recorded.
 */
export function getStoredAIReferrer(): AIReferrerHost | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return matchAIHost(raw);
  } catch {
    return undefined;
  }
}

/**
 * Persist the first-touch AI referrer for the current session. Idempotent $€”
 * if a value is already stored we don't overwrite it, preserving first-touch
 * attribution across the session.
 */
export function persistAIReferrer(host: AIReferrerHost): void {
  if (typeof window === "undefined") return;
  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    if (existing) return; // first-touch wins
    window.sessionStorage.setItem(STORAGE_KEY, host);
  } catch {
    // sessionStorage can throw in privacy modes $€” fail silent.
  }
}

/**
 * Ensure any AI referrer present in the current browser context is persisted.
 * Call this once per page load (idempotent). Returns the stored slug.
 */
export function ensureAIReferrerPersisted(): AIReferrerHost | undefined {
  const existing = getStoredAIReferrer();
  if (existing) return existing;
  const detected = detectAIReferrerFromBrowser();
  if (detected) {
    persistAIReferrer(detected);
    return detected;
  }
  return undefined;
}

/**
 * Full ordered list of canonical AI referrer slugs, useful for admin UIs and
 * server-side SQL filters.
 */
export const AI_REFERRER_HOSTS: readonly AIReferrerHost[] = [
  "chatgpt.com",
  "perplexity.ai",
  "claude.ai",
  "gemini.google.com",
  "copilot.microsoft.com",
  "bing.com",
  "you.com",
  "phind.com",
  "meta.ai",
  "llms-txt",
] as const;

/**
 * Append `?utm_source=<slug>&utm_medium=ai-crawler` to an absolute Roadman URL.
 * Used by /llms.txt and /llms-full.txt route handlers so outbound links carry
 * a durable attribution signal even when the AI assistant strips the
 * Referer header (which most do, because of strict referrer-policy).
 *
 * Idempotent: if the URL already has a utm_source it's left alone.
 */
export function tagUrlForAICrawler(
  url: string,
  slug: AIReferrerHost = "llms-txt",
): string {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("utm_source")) return url;
    parsed.searchParams.set("utm_source", slug);
    parsed.searchParams.set("utm_medium", "ai-crawler");
    return parsed.toString();
  } catch {
    return url;
  }
}
