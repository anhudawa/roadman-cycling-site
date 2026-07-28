import {
  ensureAIReferrerPersisted,
  getStoredAIReferrer,
} from "./ai-referrer";

const STORAGE_KEY = "roadman_application_attribution";

const QUERY_PARAM_MAP = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm",
  gclid: "gclid",
  gbraid: "gbraid",
  wbraid: "wbraid",
  fbclid: "fbclid",
  msclkid: "msclkid",
} as const;

export interface ApplicationAttribution {
  landingPath?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  msclkid?: string;
  aiReferrer?: string;
  capturedAt?: string;
}

const ATTRIBUTION_QUERY_FIELDS = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm",
  gclid: "gclid",
  gbraid: "gbraid",
  wbraid: "wbraid",
  fbclid: "fbclid",
  msclkid: "msclkid",
} as const satisfies Record<string, keyof ApplicationAttribution>;

function bounded(value: string | null | undefined, maxLength = 500) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function safeExternalReferrer() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return undefined;
  }
  const raw = document.referrer;
  if (!raw) return undefined;

  try {
    const referrer = new URL(raw);
    if (referrer.origin === window.location.origin) return undefined;
    return bounded(`${referrer.origin}${referrer.pathname}`);
  } catch {
    return undefined;
  }
}

function parseStored(raw: string | null): ApplicationAttribution | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as ApplicationAttribution)
      : undefined;
  } catch {
    return undefined;
  }
}

export function captureApplicationAttribution():
  | ApplicationAttribution
  | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const existing = parseStored(sessionStorage.getItem(STORAGE_KEY));
    if (existing) return existing;

    const url = new URL(window.location.href);
    const attribution: ApplicationAttribution = {
      landingPath: bounded(url.pathname, 500),
      referrer: safeExternalReferrer(),
      capturedAt: new Date().toISOString(),
    };

    for (const [queryName, fieldName] of Object.entries(QUERY_PARAM_MAP)) {
      const value = bounded(url.searchParams.get(queryName), 500);
      if (value) attribution[fieldName] = value;
    }

    const aiReferrer =
      ensureAIReferrerPersisted() ?? getStoredAIReferrer();
    if (aiReferrer) attribution.aiReferrer = aiReferrer;

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    return attribution;
  } catch {
    return undefined;
  }
}

export function readApplicationAttribution():
  | ApplicationAttribution
  | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return (
      parseStored(sessionStorage.getItem(STORAGE_KEY)) ??
      captureApplicationAttribution()
    );
  } catch {
    return undefined;
  }
}

/**
 * Restore first-touch campaign IDs onto the application URL before consented
 * ad tags initialise. Google/Meta can then perform their normal click matching
 * even when the rider moved to /apply before accepting marketing cookies.
 */
export function restoreAttributionToApplicationUrl(): boolean {
  if (
    typeof window === "undefined" ||
    !window.location.pathname.startsWith("/apply")
  ) {
    return false;
  }

  try {
    const attribution = readApplicationAttribution();
    if (!attribution) return false;
    const url = new URL(window.location.href);
    let changed = false;

    for (const [queryName, fieldName] of Object.entries(
      ATTRIBUTION_QUERY_FIELDS,
    )) {
      const value = attribution[fieldName];
      if (!value || url.searchParams.has(queryName)) continue;
      url.searchParams.set(queryName, value);
      changed = true;
    }

    if (!changed) return false;
    window.history.replaceState(window.history.state, "", url);
    return true;
  } catch {
    return false;
  }
}
