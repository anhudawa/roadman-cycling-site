/**
 * Roadman Training Camps — static config.
 *
 * Two camps run back-to-back at Can Sagnari, our private Catalan farmhouse
 * between Girona and Banyoles. Same property, same team, two formats.
 */

import type { CampSlug } from "@/lib/db/schema";

export interface CampConfig {
  slug: CampSlug;
  name: string;
  shortName: string;
  type: "Road" | "Gravel";
  href: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  durationLabel: string; // "5 days / 4 nights"
  pricePerPerson: number; // EUR
  singleSupplement: number; // EUR
  beehiivTag: string;
  capacity: number;
  description: string;
  heroSubtitle: string;
  // Stats bar values shown on the detail page
  level: string;
  dailyDistance: string;
  totalElevation: string;
}

export const CAMPS: Record<CampSlug, CampConfig> = {
  road: {
    slug: "road",
    name: "Roadman Girona Road Camp",
    shortName: "Girona Road",
    type: "Road",
    href: "/training-camps/girona-road",
    startDate: "2026-10-13",
    endDate: "2026-10-17",
    durationLabel: "5 days / 4 nights",
    pricePerPerson: 995,
    singleSupplement: 150,
    beehiivTag: "camp-road-2026",
    capacity: 16,
    description:
      "Five days riding the roads pros build their seasons on. Rocacorba, Els Àngels, Mare de Déu del Mont, the Banyoles loop. Two groups so nobody gets dropped or held back. A coffee stop every ride. Dinner back at the farmhouse, pool, the works.",
    heroSubtitle:
      "Five days on the roads pros use to build their seasons.",
    level: "Intermediate to advanced",
    dailyDistance: "70–110 km",
    totalElevation: "~6,500 m total",
  },
  gravel: {
    slug: "gravel",
    name: "Roadman Girona Gravel Camp",
    shortName: "Girona Gravel",
    type: "Gravel",
    href: "/training-camps/girona-gravel",
    startDate: "2026-10-18",
    endDate: "2026-10-22",
    durationLabel: "5 days / 4 nights",
    pricePerPerson: 995,
    singleSupplement: 150,
    beehiivTag: "camp-gravel-2026",
    capacity: 16,
    description:
      "Five days off the tarmac. Volcanic tracks in La Garrotxa, the Ter river paths, vineyard roads in the Empordà, coastal gravel above the Costa Brava. Two groups, never dropped, follow car when we're far from home.",
    heroSubtitle:
      "Five days on the dirt that built Girona's gravel reputation.",
    level: "Intermediate. Some technical sections.",
    dailyDistance: "55–90 km",
    totalElevation: "~5,000 m total",
  },
};

export const CAMP_LIST: CampConfig[] = [CAMPS.road, CAMPS.gravel];

export function getCamp(slug: string): CampConfig | null {
  if (slug === "road" || slug === "gravel") return CAMPS[slug];
  return null;
}

export function formatCampDates(camp: CampConfig): string {
  const start = new Date(camp.startDate + "T00:00:00Z");
  const end = new Date(camp.endDate + "T00:00:00Z");
  const fmt = (d: Date, withYear = false) =>
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      ...(withYear ? { year: "numeric" } : {}),
      timeZone: "UTC",
    });
  return `${fmt(start)} – ${fmt(end, true)}`;
}
