#!/usr/bin/env tsx
// Dump the canonical route-slug inventory to JSON so audit-links.mjs can
// validate links against ground truth (production loaders) instead of
// re-implementing the slugify/alias logic.
//
// Usage:  tsx scripts/dump-route-inventory.ts > scripts/route-inventory.json

import { getAllSlugs as getAllBlogSlugs } from "@/lib/blog";
import { getAllEpisodeSlugs, getTranscriptSlugs } from "@/lib/podcast";
import { getAllGuestSlugs } from "@/lib/guests";
import { getAllTopicSlugs } from "@/lib/topics";
import { getAllEntitySlugs } from "@/lib/entities";
import { getAllTermSlugs as getAllGlossarySlugs } from "@/lib/glossary";
import { getAllComparisonSlugs } from "@/lib/comparisons";
import { getAllCaseStudySlugs } from "@/lib/case-studies";
import { getAllBestForSlugs } from "@/lib/best-for";
import { getAllProblemSlugs } from "@/lib/problems";
import { getAllQuestionSlugs } from "@/lib/questions";
import { getAllAnswerSlugs } from "@/lib/answers";
import { getAllEventGuideSlugs } from "@/lib/event-guides";
import { getAllPersonaSlugs } from "@/lib/personas";
import { GIRONA_ROUTE_LIST } from "@/lib/girona/routes";
import { COACHING_SEGMENTS } from "@/lib/coaching-segments";
import { RACES } from "@/data/races";
import {
  getAllEventSlugs as getAllPlanEventSlugs,
  getAllPhaseSlugs as getAllPlanPhaseSlugs,
} from "@/lib/training-plans";
import { plateauDefinition } from "@/lib/diagnostics/definitions/plateau";
import { fuellingDefinition } from "@/lib/diagnostics/definitions/fuelling";
import { ftpZonesDefinition } from "@/lib/diagnostics/definitions/ftp-zones";
import { getVideoEpisodes } from "@/lib/seo/video-watch";
import { TOUR_STAGES } from "@/data/tour-de-france-2026";
import { getAllHistorySlugs } from "@/data/tour-history";
import { getAllExpertTopicPairs } from "@/lib/experts";
import { FALLBACK_CATEGORIES } from "@/lib/recommends/queries";
import { FALLBACK_PUBLIC_PRODUCTS } from "@/lib/recommends/catalog";
import fs from "fs";
import path from "path";

// /coaching/[location] — keys live in the page itself, not a lib module.
// Statically parse the file so we don't drift if a location is added.
const coachingLocationFile = path.join(
  process.cwd(),
  "src/app/(marketing)/coaching/[location]/page.tsx",
);
const coachingPageText = fs.readFileSync(coachingLocationFile, "utf-8");
const locationsBlock = coachingPageText.match(
  /LOCATIONS:\s*Record<string,\s*LocationData>\s*=\s*\{([\s\S]*?)\n\};/,
);
const coachingLocations: string[] = [];
if (locationsBlock) {
  for (const m of locationsBlock[1].matchAll(/^\s{2}([a-z][a-z-]*):\s*\{/gm)) {
    coachingLocations.push(m[1]);
  }
}

const inventory = {
  blog: getAllBlogSlugs(),
  podcast: getAllEpisodeSlugs(),
  podcastTranscripts: getTranscriptSlugs(),
  guests: getAllGuestSlugs(),
  topics: getAllTopicSlugs(),
  entities: getAllEntitySlugs(),
  glossary: getAllGlossarySlugs(),
  comparisons: getAllComparisonSlugs(),
  caseStudies: getAllCaseStudySlugs(),
  bestFor: getAllBestForSlugs(),
  problems: getAllProblemSlugs(),
  questions: getAllQuestionSlugs(),
  answers: getAllAnswerSlugs(),
  watch: getVideoEpisodes().map((episode) => episode.slug),
  tourStages: TOUR_STAGES.map((stage) => String(stage.number)),
  tourHistory: getAllHistorySlugs(),
  expertTopicPairs: getAllExpertTopicPairs(),
  recommendationCategories: FALLBACK_CATEGORIES.map((category) => category.slug),
  recommendationProducts: FALLBACK_PUBLIC_PRODUCTS.map(
    (product) => `${product.categorySlug}/${product.slug}`,
  ),
  eventGuides: getAllEventGuideSlugs(),
  coachingSegments: Object.keys(COACHING_SEGMENTS),
  coachingLocations,
  races: RACES.map((r) => r.slug),
  racePredictorSlugs: RACES.map((r) => r.predictor_slug).filter(Boolean),
  planEvents: getAllPlanEventSlugs(),
  planPhases: getAllPlanPhaseSlugs(),
  diagnostics: [
    plateauDefinition.toolSlug,
    fuellingDefinition.toolSlug,
    ftpZonesDefinition.toolSlug,
  ],
  personas: getAllPersonaSlugs(),
  gironaRoutes: GIRONA_ROUTE_LIST.map((r) => r.slug),
};

process.stdout.write(JSON.stringify(inventory, null, 2));
