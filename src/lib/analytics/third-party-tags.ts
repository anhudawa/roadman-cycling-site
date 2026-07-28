import {
  hasMarketingConsent,
  readClientConsent,
} from "./consent-client";

export const GOOGLE_ADS_ID = "AW-18123737652";
export const META_PIXEL_ID = "649389789190949";

const configuredGoogleIds = new Set<string>();
let googleBootstrapped = false;
let metaInitialised = false;

type TagFunction = (...args: unknown[]) => void;
type MetaQueueFunction = TagFunction & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: TagFunction;
};

interface TrackingWindow extends Window {
  dataLayer?: unknown[];
  gtag?: TagFunction;
  fbq?: MetaQueueFunction;
  _fbq?: TagFunction;
}

function validGa4Id(value: string | undefined): value is string {
  return typeof value === "string" && /^G-[A-Z0-9]+$/i.test(value);
}

export function getGa4Id(): string | undefined {
  const value = process.env.NEXT_PUBLIC_GA_ID?.trim();
  return validGa4Id(value) ? value : undefined;
}

export function ensureGtagQueue(): TagFunction | undefined {
  if (typeof window === "undefined") return undefined;
  const trackingWindow = window as TrackingWindow;
  trackingWindow.dataLayer ??= [];
  if (typeof trackingWindow.gtag !== "function") {
    trackingWindow.gtag = (...args: unknown[]) => {
      trackingWindow.dataLayer?.push(args);
    };
  }
  return trackingWindow.gtag;
}

function loadGoogleScript(id: string) {
  if (document.querySelector('script[data-roadman-google-tag="true"]')) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.dataset.roadmanGoogleTag = "true";
  document.head.appendChild(script);
}

export function configureConsentedGoogleTags() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const consent = readClientConsent();
  const ga4Id = consent.analytics ? getGa4Id() : undefined;
  const adsId = consent.marketing ? GOOGLE_ADS_ID : undefined;
  const primaryId = ga4Id ?? adsId;
  if (!primaryId) return;

  const gtag = ensureGtagQueue();
  if (!gtag) return;
  loadGoogleScript(primaryId);

  if (!googleBootstrapped) {
    googleBootstrapped = true;
    gtag("js", new Date());
  }
  if (ga4Id && !configuredGoogleIds.has(ga4Id)) {
    configuredGoogleIds.add(ga4Id);
    gtag("config", ga4Id, { send_page_view: false });
  }
  if (adsId && !configuredGoogleIds.has(adsId)) {
    configuredGoogleIds.add(adsId);
    gtag("config", adsId);
  }
}

export function trackConsentedGoogleEvent(
  name: string,
  params: Record<string, unknown>,
  purpose: "analytics" | "marketing",
) {
  const consent = readClientConsent();
  if (
    (purpose === "analytics" && !consent.analytics) ||
    (purpose === "marketing" && !consent.marketing)
  ) {
    return;
  }
  if (purpose === "analytics" && !getGa4Id()) return;

  configureConsentedGoogleTags();
  ensureGtagQueue()?.("event", name, params);
}

export function ensureMetaPixel(): TagFunction | undefined {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    !hasMarketingConsent()
  ) {
    return undefined;
  }

  const trackingWindow = window as TrackingWindow;
  if (typeof trackingWindow.fbq !== "function") {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue.push(args);
      }
    }) as MetaQueueFunction;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.push = fbq;
    trackingWindow.fbq = fbq;
    trackingWindow._fbq = fbq;
  }

  if (!document.querySelector('script[data-roadman-meta-pixel="true"]')) {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.dataset.roadmanMetaPixel = "true";
    document.head.appendChild(script);
  }

  if (!metaInitialised) {
    metaInitialised = true;
    trackingWindow.fbq("init", META_PIXEL_ID);
  }
  trackingWindow.fbq("consent", "grant");
  return trackingWindow.fbq;
}

export function trackConsentedMetaEvent(
  name: string,
  params?: Record<string, unknown>,
) {
  const fbq = ensureMetaPixel();
  if (!fbq) return;
  fbq("track", name, params ?? {});
}
