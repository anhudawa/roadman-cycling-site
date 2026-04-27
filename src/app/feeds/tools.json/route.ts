import { NextResponse } from "next/server";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";

interface ToolFeedEntry {
  slug: string;
  title: string;
  description: string;
  pillar: "coaching" | "nutrition" | "strength" | "recovery" | "community";
  apiEndpoint?: string;
  inputs?: string[];
}

/**
 * Master list of every public tool. The on-page calculator lives at
 * /tools/{slug}; tools with a JSON API list `apiEndpoint` so AI agents
 * can call them directly.
 */
const TOOLS: ToolFeedEntry[] = [
  {
    slug: "ftp-zones",
    title: "FTP Zone Calculator",
    description:
      "Enter your FTP and get a complete 7-zone power table with wattage ranges and (optionally) heart-rate ranges per zone.",
    pillar: "coaching",
    apiEndpoint: "/api/v1/tools/ftp-zones",
    inputs: ["ftp", "lthr"],
  },
  {
    slug: "race-weight",
    title: "Race Weight Calculator",
    description:
      "Target weight range for peak cycling performance based on height, body composition, gender, and event type.",
    pillar: "community",
    apiEndpoint: "/api/v1/tools/race-weight",
    inputs: ["height", "weight", "bodyFat", "gender", "eventType"],
  },
  {
    slug: "tyre-pressure",
    title: "Tyre Pressure Calculator",
    description:
      "SILCA-grade front and rear PSI based on weight, tyre width, rim width, tube type, and road surface.",
    pillar: "coaching",
  },
  {
    slug: "fuelling",
    title: "In-Ride Fuelling Calculator",
    description:
      "Carbs per hour and fluid per hour based on ride duration, intensity, and weight.",
    pillar: "nutrition",
  },
  {
    slug: "energy-availability",
    title: "Energy Availability Calculator",
    description:
      "Check whether you're eating enough to support your training. Identifies RED-S risk before it becomes a problem.",
    pillar: "recovery",
  },
  {
    slug: "wkg",
    title: "W/kg Calculator",
    description:
      "Convert between FTP and watts-per-kilogram, with category benchmarks (Cat 5 → World Tour).",
    pillar: "strength",
  },
  {
    slug: "hr-zones",
    title: "Heart Rate Zone Calculator",
    description:
      "5-zone heart-rate breakdown from %HRmax or %LTHR with training-purpose descriptions per zone.",
    pillar: "coaching",
  },
  {
    slug: "shock-pressure",
    title: "MTB Setup Calculator",
    description:
      "Suspension pressure, sag targets, and tyre pressure for your mountain bike.",
    pillar: "coaching",
  },
];

/**
 * GET /feeds/tools.json
 *
 * Public JSON feed of every free tool on the site. Tools with an
 * `apiEndpoint` can be called directly via JSON; the rest are
 * UI-only calculators.
 */
export function GET() {
  const items = TOOLS.map((tool) => ({
    id: tool.slug,
    type: "tool",
    title: tool.title,
    summary: tool.description,
    url: feedUrl(`/tools/${tool.slug}`),
    apiUrl: tool.apiEndpoint ? feedUrl(tool.apiEndpoint) : null,
    inputs: tool.inputs ?? null,
    datePublished: null,
    dateModified: null,
    author: "Anthony Walsh",
    primaryTopic: tool.pillar,
    entities: [],
    relatedEpisodes: [],
    relatedTools: [],
    evidenceLevel: "calculator",
  }));

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      baseUrl: FEED_BASE_URL,
      schemaVersion: 1,
      count: items.length,
      items,
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
