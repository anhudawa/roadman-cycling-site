export type RouteDataQuality =
  | "verified_gpx"
  | "public_provisional"
  | "event_profile"
  | "user_upload"
  | "unknown";

export interface RouteProvenance {
  quality: RouteDataQuality;
  label: string;
  detail: string;
  sourceUrl: string | null;
  sourceHash: string | null;
}

const VERIFIED_PREFIX = "verified_gpx|";

export function encodeVerifiedRouteSource(
  sourceHash: string,
  sourceUrl: string,
): string {
  return `${VERIFIED_PREFIX}${sourceHash}|${sourceUrl}`;
}

export function routeProvenanceFromSource(
  source: string | null | undefined,
): RouteProvenance {
  if (!source) {
    return {
      quality: "unknown",
      label: "Route source unknown",
      detail: "Check the course file before using this prediction as a race-day target.",
      sourceUrl: null,
      sourceHash: null,
    };
  }
  if (source === "user_upload") {
    return {
      quality: "user_upload",
      label: "Your uploaded GPX",
      detail: "The prediction uses the cleaned route file uploaded for this run.",
      sourceUrl: null,
      sourceHash: null,
    };
  }
  if (source.startsWith(VERIFIED_PREFIX)) {
    const [, sourceHash, ...urlParts] = source.split("|");
    return {
      quality: "verified_gpx",
      label: "Verified GPX route",
      detail: "The stored route file has a recorded source and content hash.",
      sourceUrl: urlParts.join("|") || null,
      sourceHash: sourceHash || null,
    };
  }
  if (source.includes("rwgps_public_embed")) {
    return {
      quality: "public_provisional",
      label: "Public provisional route",
      detail: "The organiser-linked public route may change before race day.",
      sourceUrl: null,
      sourceHash: null,
    };
  }
  return {
    quality: "event_profile",
    label: "Event profile estimate",
    detail:
      "Distance, climbing and major course shape are modelled; upload the final organiser GPX for the strongest prediction.",
    sourceUrl: null,
    sourceHash: null,
  };
}
