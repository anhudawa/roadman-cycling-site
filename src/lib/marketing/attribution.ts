export type AttributionTouch = "first" | "last";

export type MarketingChannel =
  | "google_ads"
  | "meta_ads"
  | "microsoft_ads"
  | "email"
  | "podcast"
  | "youtube"
  | "organic_search"
  | "organic_social"
  | "ai_referral"
  | "referral"
  | "other"
  | "direct_unknown";

export const MARKETING_CHANNEL_LABELS: Record<MarketingChannel, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  microsoft_ads: "Microsoft Ads",
  email: "Email",
  podcast: "Podcast",
  youtube: "YouTube",
  organic_search: "Organic search",
  organic_social: "Organic social",
  ai_referral: "AI referral",
  referral: "Referral",
  other: "Other",
  direct_unknown: "Direct / unknown",
};

export const SPEND_CHANNELS: MarketingChannel[] = [
  "google_ads",
  "meta_ads",
  "microsoft_ads",
  "podcast",
  "youtube",
  "email",
  "organic_social",
  "other",
];

interface TouchAttribution {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  landingPath?: string;
  referrer?: string;
  aiReferrer?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  msclkid?: string;
}

function value(
  attribution: Record<string, string> | null | undefined,
  key: string,
) {
  const raw = attribution?.[key]?.trim();
  return raw || undefined;
}

export function getAttributionTouch(
  attribution: Record<string, string> | null | undefined,
  touch: AttributionTouch,
): TouchAttribution {
  const hasLastTouch = Boolean(
    value(attribution, "lastCapturedAt") ||
      Object.keys(attribution ?? {}).some((key) => key.startsWith("last")),
  );
  if (touch === "first" || !hasLastTouch) {
    return {
      source: value(attribution, "utmSource"),
      medium: value(attribution, "utmMedium"),
      campaign: value(attribution, "utmCampaign"),
      content: value(attribution, "utmContent"),
      term: value(attribution, "utmTerm"),
      landingPath: value(attribution, "landingPath"),
      referrer: value(attribution, "referrer"),
      aiReferrer: value(attribution, "aiReferrer"),
      gclid: value(attribution, "gclid"),
      gbraid: value(attribution, "gbraid"),
      wbraid: value(attribution, "wbraid"),
      fbclid: value(attribution, "fbclid"),
      msclkid: value(attribution, "msclkid"),
    };
  }

  return {
    source: value(attribution, "lastUtmSource"),
    medium: value(attribution, "lastUtmMedium"),
    campaign: value(attribution, "lastUtmCampaign"),
    content: value(attribution, "lastUtmContent"),
    term: value(attribution, "lastUtmTerm"),
    landingPath: value(attribution, "lastLandingPath"),
    referrer: value(attribution, "lastReferrer"),
    aiReferrer: value(attribution, "lastAiReferrer"),
    gclid: value(attribution, "lastGclid"),
    gbraid: value(attribution, "lastGbraid"),
    wbraid: value(attribution, "lastWbraid"),
    fbclid: value(attribution, "lastFbclid"),
    msclkid: value(attribution, "lastMsclkid"),
  };
}

function hostname(referrer?: string): string {
  if (!referrer) return "";
  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function includesAny(valueToCheck: string, candidates: string[]) {
  return candidates.some((candidate) => valueToCheck.includes(candidate));
}

export function classifyMarketingAttribution(
  attribution: Record<string, string> | null | undefined,
  touch: AttributionTouch = "last",
): MarketingChannel {
  const selected = getAttributionTouch(attribution, touch);
  const source = selected.source?.toLowerCase() ?? "";
  const medium = selected.medium?.toLowerCase() ?? "";
  const referrerHost = hostname(selected.referrer);
  const aiReferrer = selected.aiReferrer?.toLowerCase() ?? "";
  const paidMedium = includesAny(medium, [
    "cpc",
    "ppc",
    "paid",
    "display",
    "retarget",
  ]);

  if (
    selected.gclid ||
    selected.gbraid ||
    selected.wbraid ||
    (includesAny(source, ["google", "adwords"]) && paidMedium)
  ) {
    return "google_ads";
  }
  if (
    selected.msclkid ||
    (includesAny(source, ["bing", "microsoft"]) && paidMedium)
  ) {
    return "microsoft_ads";
  }
  if (
    selected.fbclid ||
    (includesAny(source, ["facebook", "instagram", "meta"]) && paidMedium)
  ) {
    return "meta_ads";
  }
  if (
    medium === "email" ||
    includesAny(source, ["email", "newsletter", "beehiiv", "mailchimp"])
  ) {
    return "email";
  }
  if (includesAny(source, ["podcast", "spotify", "apple_podcast"])) {
    return "podcast";
  }
  if (
    includesAny(source, ["youtube", "yt"]) ||
    referrerHost.includes("youtube.com") ||
    referrerHost.includes("youtu.be")
  ) {
    return "youtube";
  }
  if (
    aiReferrer ||
    includesAny(referrerHost, [
      "chatgpt.com",
      "perplexity.ai",
      "claude.ai",
      "gemini.google.com",
      "copilot.microsoft.com",
    ])
  ) {
    return "ai_referral";
  }
  if (
    includesAny(source, ["facebook", "instagram", "linkedin", "twitter"]) ||
    source === "x" ||
    includesAny(referrerHost, [
      "facebook.com",
      "instagram.com",
      "linkedin.com",
      "t.co",
    ])
  ) {
    return "organic_social";
  }
  if (
    medium === "organic" ||
    includesAny(referrerHost, [
      "google.",
      "bing.com",
      "duckduckgo.com",
      "search.yahoo.com",
    ]) ||
    includesAny(source, ["google", "bing", "duckduckgo", "yahoo"])
  ) {
    return "organic_search";
  }
  if (selected.referrer) return "referral";
  if (selected.source || selected.medium || selected.campaign) return "other";
  return "direct_unknown";
}

export function getMarketingCampaign(
  attribution: Record<string, string> | null | undefined,
  touch: AttributionTouch,
) {
  return getAttributionTouch(attribution, touch).campaign;
}
