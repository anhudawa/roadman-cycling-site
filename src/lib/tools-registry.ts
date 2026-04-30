import type { ContentPillar } from "@/types";

export interface ToolEntry {
  slug: string;
  title: string;
  description: string;
  pillar: ContentPillar;
  apiEndpoint?: string;
  inputs?: string[];
}

/**
 * Master list of every public tool. The on-page calculator lives at
 * /tools/{slug}; tools with a JSON API list `apiEndpoint` so AI agents
 * can call them directly. Consumed by /feeds/tools.json and /api/v1/search.
 */
export const TOOLS: ToolEntry[] = [
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

export function getAllTools(): ToolEntry[] {
  return TOOLS;
}

export function getToolBySlug(slug: string): ToolEntry | null {
  return TOOLS.find((t) => t.slug === slug) ?? null;
}
