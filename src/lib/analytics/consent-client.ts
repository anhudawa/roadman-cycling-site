const CONSENT_STORAGE_KEY = "roadman_cookie_consent";

export interface ClientConsentPreferences {
  analytics: boolean;
  marketing: boolean;
}

export function readClientConsent(): ClientConsentPreferences {
  if (typeof window === "undefined") {
    return { analytics: false, marketing: false };
  }

  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return { analytics: false, marketing: false };
    const parsed = JSON.parse(stored) as {
      analytics?: unknown;
      marketing?: unknown;
    };
    return {
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
    };
  } catch {
    return { analytics: false, marketing: false };
  }
}

export function hasAnalyticsConsent(): boolean {
  return readClientConsent().analytics;
}

export function hasMarketingConsent(): boolean {
  return readClientConsent().marketing;
}
