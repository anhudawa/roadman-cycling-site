import {
  ensureAIReferrerPersisted,
  getStoredAIReferrer,
} from "./ai-referrer";

const STORAGE_KEY = "roadman_application_attribution";

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
  lastLandingPath?: string;
  lastReferrer?: string;
  lastUtmSource?: string;
  lastUtmMedium?: string;
  lastUtmCampaign?: string;
  lastUtmContent?: string;
  lastUtmTerm?: string;
  lastGclid?: string;
  lastGbraid?: string;
  lastWbraid?: string;
  lastFbclid?: string;
  lastMsclkid?: string;
  lastAiReferrer?: string;
  lastCapturedAt?: string;
  adUserDataConsent?: "granted" | "denied";
  adPersonalizationConsent?: "granted" | "denied";
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

const LAST_ATTRIBUTION_QUERY_FIELDS = {
  utm_source: "lastUtmSource",
  utm_medium: "lastUtmMedium",
  utm_campaign: "lastUtmCampaign",
  utm_content: "lastUtmContent",
  utm_term: "lastUtmTerm",
  gclid: "lastGclid",
  gbraid: "lastGbraid",
  wbraid: "lastWbraid",
  fbclid: "lastFbclid",
  msclkid: "lastMsclkid",
} as const satisfies Record<string, keyof ApplicationAttribution>;

type AttributionQueryName = keyof typeof ATTRIBUTION_QUERY_FIELDS;
const ATTRIBUTION_QUERY_ENTRIES = Object.entries(
  ATTRIBUTION_QUERY_FIELDS,
) as Array<
  [
    AttributionQueryName,
    (typeof ATTRIBUTION_QUERY_FIELDS)[AttributionQueryName],
  ]
>;

const LAST_TOUCH_FIELDS = [
  "lastReferrer",
  "lastUtmSource",
  "lastUtmMedium",
  "lastUtmCampaign",
  "lastUtmContent",
  "lastUtmTerm",
  "lastGclid",
  "lastGbraid",
  "lastWbraid",
  "lastFbclid",
  "lastMsclkid",
  "lastAiReferrer",
] as const satisfies readonly (keyof ApplicationAttribution)[];

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
    const url = new URL(window.location.href);
    const capturedAt = new Date().toISOString();
    const landingPath = bounded(url.pathname, 500);
    const referrer = safeExternalReferrer();
    const queryTouch: Partial<ApplicationAttribution> = {};
    for (const [queryName, fieldName] of ATTRIBUTION_QUERY_ENTRIES) {
      const value = bounded(url.searchParams.get(queryName), 500);
      if (value) queryTouch[fieldName] = value;
    }

    const aiReferrer = ensureAIReferrerPersisted() ?? getStoredAIReferrer();

    if (!existing) {
      const attribution: ApplicationAttribution = {
        landingPath,
        referrer,
        capturedAt,
        ...queryTouch,
        lastLandingPath: landingPath,
        lastReferrer: referrer,
        lastCapturedAt: capturedAt,
      };
      if (aiReferrer) {
        attribution.aiReferrer = aiReferrer;
        attribution.lastAiReferrer = aiReferrer;
      }
      for (const [queryName, firstField] of ATTRIBUTION_QUERY_ENTRIES) {
        const value = attribution[firstField];
        if (value) attribution[LAST_ATTRIBUTION_QUERY_FIELDS[queryName]] = value;
      }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
      return attribution;
    }

    const attribution: ApplicationAttribution = { ...existing };
    const hasQueryTouch = Object.keys(queryTouch).length > 0;
    const isNewExternalTouch =
      Boolean(referrer) && referrer !== existing.lastReferrer;

    // Backfill last-touch values for sessions captured by the previous format.
    if (!attribution.lastCapturedAt) {
      attribution.lastLandingPath = attribution.landingPath;
      attribution.lastReferrer = attribution.referrer;
      attribution.lastAiReferrer = attribution.aiReferrer;
      attribution.lastCapturedAt = attribution.capturedAt;
      for (const [queryName, firstField] of ATTRIBUTION_QUERY_ENTRIES) {
        const value = attribution[firstField];
        if (value) attribution[LAST_ATTRIBUTION_QUERY_FIELDS[queryName]] = value;
      }
    }

    if (hasQueryTouch || isNewExternalTouch) {
      for (const field of LAST_TOUCH_FIELDS) delete attribution[field];
      attribution.lastLandingPath = landingPath;
      attribution.lastCapturedAt = capturedAt;
      if (referrer) attribution.lastReferrer = referrer;
      if (aiReferrer) attribution.lastAiReferrer = aiReferrer;
      for (const [queryName, firstField] of ATTRIBUTION_QUERY_ENTRIES) {
        const value = queryTouch[firstField];
        if (value) attribution[LAST_ATTRIBUTION_QUERY_FIELDS[queryName]] = value;
      }
    }

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
 * Restore the latest campaign IDs onto the application URL before consented ad
 * tags initialise. First-touch values remain the fallback for older sessions.
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

    for (const [queryName, fieldName] of ATTRIBUTION_QUERY_ENTRIES) {
      const value =
        attribution.lastCapturedAt
          ? attribution[LAST_ATTRIBUTION_QUERY_FIELDS[queryName]]
          : attribution[fieldName];
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
