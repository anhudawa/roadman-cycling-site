const BOT_PATTERN =
  /bot|crawler|spider|preview|slackbot|discordbot|facebookexternalhit|whatsapp|telegrambot|headless/i;

export function isAffiliateBot(userAgent: string | null): boolean {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

export function affiliateDevice(userAgent: string | null): string {
  if (!userAgent) return "unknown";
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

export function isSafeAffiliateDestination(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const IMPACT_TRACKING_HOSTS = [".sjv.io", ".g39l.net"];

export function attachAffiliateClickId(
  destination: string,
  clickId: string,
): string {
  const url = new URL(destination);
  const impactHost = IMPACT_TRACKING_HOSTS.some(
    (suffix) =>
      url.hostname === suffix.slice(1) || url.hostname.endsWith(suffix),
  );
  if (impactHost && !url.searchParams.has("subId3")) {
    url.searchParams.set("subId3", clickId);
  }
  return url.toString();
}

export function readRequestCookie(
  request: Request,
  name: string,
): string | null {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

export function hasAnalyticsConsent(request: Request): boolean {
  const consent = readRequestCookie(request, "roadman_consent");
  return Boolean(
    consent &&
      (consent === "all" || consent.split("+").includes("analytics")),
  );
}
