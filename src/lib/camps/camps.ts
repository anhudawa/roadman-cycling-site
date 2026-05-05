/**
 * Roadman Training Camps — static config.
 *
 * Two camps run back-to-back at Can Sagnari, our private Catalan farmhouse
 * between Girona and Banyoles. Same property, same team, two formats.
 */

import type { CampSlug } from "@/lib/db/schema";

export interface HeadingPair {
  /** White portion of the section heading. */
  main: string;
  /** Coral portion rendered on the second line. */
  accent: string;
}

export interface CampConfig {
  slug: CampSlug;
  name: string;
  shortName: string;
  type: "Road" | "Gravel";
  href: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  durationLabel: string; // "6 days / 5 nights"
  pricePerPerson: number; // EUR
  singleSupplement: number; // EUR
  beehiivTag: string;
  capacity: number;
  description: string;
  heroSubtitle: string;
  /** In-page hero image on the detail page (also used for OG/Schema.org). */
  heroImage: string;
  heroImageAlt: string;
  /** Per-camp headline for the summary block on the detail page. */
  summaryHeading: HeadingPair;
  /** Per-camp headline for the itinerary block on the detail page. */
  itineraryHeading: HeadingPair;
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
    startDate: "2026-10-10",
    endDate: "2026-10-15",
    durationLabel: "6 days / 5 nights",
    pricePerPerson: 995,
    singleSupplement: 150,
    beehiivTag: "camp-road-2026",
    capacity: 16,
    description:
      "Six days on the climbs Girona's pros use to build their seasons. Rocacorba's 11 km test piece. Els Àngels' even tempo. The long pull up Mare de Déu del Mont. Two pace groups, follow car, a proper coffee stop on every ride.",
    heroSubtitle:
      "Six days on the climbs the World Tour rides twelve months a year.",
    heroImage: "/images/camps/girona-road-coast.jpeg",
    heroImageAlt:
      "Group of road cyclists on a coastal road above a turquoise Costa Brava cove",
    summaryHeading: {
      main: "BIG CLIMBS. PROPER ROADS.",
      accent: "— THE GIRONA THE PROS RIDE.",
    },
    itineraryHeading: {
      main: "SIX RIDES.",
      accent: "SIX GIRONA CLASSICS.",
    },
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
    startDate: "2026-10-16",
    endDate: "2026-10-21",
    durationLabel: "6 days / 5 nights",
    pricePerPerson: 995,
    singleSupplement: 150,
    beehiivTag: "camp-gravel-2026",
    capacity: 16,
    description:
      "Six days off the tarmac, on the dirt that turned Girona into Europe's gravel capital. Volcanic tracks through La Garrotxa. Cork-oak singletrack in Les Gavarres. Vineyard service roads in the Empordà. Coastal lines above the Med.",
    heroSubtitle:
      "Six days off the tarmac. The volcanic, vineyard and forest dirt that earned Girona its name.",
    heroImage: "/images/camps/girona-gravel-trail.webp",
    heroImageAlt:
      "Two gravel riders on a dirt trail through Catalan countryside",
    summaryHeading: {
      main: "VOLCANIC DIRT. VINEYARD TRACKS.",
      accent: "— THE GIRONA NO TOUR EVER SHOWS YOU.",
    },
    itineraryHeading: {
      main: "SIX RIDES.",
      accent: "SIX FACES OF GIRONA DIRT.",
    },
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
