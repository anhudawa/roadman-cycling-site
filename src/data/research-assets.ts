const BASE_URL = "https://roadmancycling.com";

export const RESEARCH_ASSET_KINDS = [
  "dataset",
  "archive-study",
  "coaching-framework",
  "evidence-benchmark",
] as const;

export type ResearchAssetKind = (typeof RESEARCH_ASSET_KINDS)[number];

export interface ResearchAsset {
  id: string;
  name: string;
  kind: ResearchAssetKind;
  version: string;
  publishedDate: string;
  updatedDate: string;
  canonicalPath: string;
  dataPath: string;
  supplementaryDataPaths?: readonly string[];
  summary: string;
  methodology: string;
  limitations: readonly string[];
  reuse: {
    terms: string;
    attribution: string;
    licenseUrl?: string;
  };
}

/**
 * One registry for Roadman's reusable research and evidence assets.
 *
 * Asset kinds are deliberately narrow. In particular, a worksheet or
 * evidence-range audit must never be presented as observed population data.
 */
export const RESEARCH_ASSETS = [
  {
    id: "amateur-cycling-performance-report-2026",
    name: "Roadman Amateur Cycling Performance Report 2026",
    kind: "dataset",
    version: "1.0",
    publishedDate: "2026-04-28",
    updatedDate: "2026-04-28",
    canonicalPath: "/benchmarks",
    dataPath: "/feeds/research.json",
    summary:
      "Percentile estimates for FTP, watts per kilogram, training hours, sportive finish times and FTP improvement among actively training amateur male road cyclists.",
    methodology:
      "Conservative, smoothed estimates combining public training-platform reports, the Coggan and Allen power profile, and patterns from about 250 Roadman-coached and community riders who met the stated inclusion criteria.",
    limitations: [
      "The figures are aggregated estimates, not the result of one representative primary academic study.",
      "The described population is actively training amateur male road cyclists and must not be generalised to every cyclist.",
      "Self-selected coaching and community data can introduce selection and measurement bias.",
    ],
    reuse: {
      terms: "CC BY 4.0",
      attribution:
        "Roadman Amateur Cycling Performance Report 2026 — https://roadmancycling.com/benchmarks",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    },
  },
  {
    id: "cycling-podcast-archive-study-2026",
    name: "Roadman Cycling Podcast Archive Study 2026",
    kind: "archive-study",
    version: "2026-08-31",
    publishedDate: "2026-08-31",
    updatedDate: "2026-08-31",
    canonicalPath: "/research/cycling-podcast-archive-study",
    dataPath: "/feeds/podcast-archive-study.json",
    supplementaryDataPaths: ["/data/roadman-podcast-archive-2026.csv"],
    summary:
      "A reproducible snapshot of 818 searchable Roadman Cycling Podcast episode records covering publication mix, editorial pillar, format, named guests and transcript availability.",
    methodology:
      "Counts one MDX record for each searchable Roadman episode page in the repository snapshot dated 31 August 2026, using the record fields and matching files for its classifications.",
    limitations: [
      "This is one publisher's searchable on-site archive, not the complete historic RSS feed or global cycling-podcast market.",
      "It contains no downloads, listening time, completion rates, search demand or audience demographics.",
      "Editorial classifications, guest aliases and transcript availability can change after review.",
    ],
    reuse: {
      terms: "CC BY 4.0",
      attribution:
        "Roadman Cycling Podcast Archive Study 2026 — https://roadmancycling.com/research/cycling-podcast-archive-study",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    },
  },
  {
    id: "sportive-readiness-index-2026",
    name: "Roadman Sportive Readiness Index 2026",
    kind: "coaching-framework",
    version: "1.0",
    publishedDate: "2026-04-30",
    updatedDate: "2026-09-01",
    canonicalPath: "/blog/sportive-training-readiness-index-2026",
    dataPath: "/data/sportive-readiness-index-2026.csv",
    summary:
      "A five-domain coaching framework and worksheet for reviewing event demands, pacing, durability, fuelling, training, recovery and execution before a sportive or gran fondo.",
    methodology:
      "Maps common event-preparation decisions against official organiser demands and primary research, then records each relevant domain as confirmed, partial or not yet demonstrated at five review points.",
    limitations: [
      "This is a coaching framework, not a clinically validated diagnostic or population-normed prediction model.",
      "It has no validated composite score, pass mark or representative rider norms.",
      "It cannot provide medical clearance or guarantee event completion.",
    ],
    reuse: {
      terms: "Free to use and adapt with attribution",
      attribution:
        "Roadman Sportive Readiness Index 2026 — https://roadmancycling.com/blog/sportive-training-readiness-index-2026",
    },
  },
  {
    id: "amateur-cyclist-fuelling-benchmarks-2026",
    name: "Roadman Amateur Cyclist Fuelling Benchmarks 2026",
    kind: "evidence-benchmark",
    version: "1.0",
    publishedDate: "2026-04-30",
    updatedDate: "2026-09-01",
    canonicalPath: "/blog/amateur-cyclist-fuelling-benchmarks-report-2026",
    dataPath: "/data/amateur-cyclist-fuelling-benchmarks-2026.csv",
    summary:
      "Evidence-bounded carbohydrate ranges and a plan-versus-actual worksheet for auditing amateur cycling fuelling by session demand, execution, tolerance and recovery.",
    methodology:
      "Maps established sports-nutrition guidance, mechanism research and systematic reviews into a repeatable audit that compares the planned intake, actual intake, symptoms, ride execution and recovery.",
    limitations: [
      "This is an evidence benchmark, not a survey or representative dataset of what amateur cyclists consume.",
      "The acute-carbohydrate evidence base is heavily male-dominated and does not support invented female-specific precision.",
      "The ranges do not replace individual assessment, product practice or clinical nutrition advice.",
    ],
    reuse: {
      terms: "Citable with attribution",
      attribution:
        "Roadman Amateur Cyclist Fuelling Benchmarks 2026 — https://roadmancycling.com/blog/amateur-cyclist-fuelling-benchmarks-report-2026",
    },
  },
] as const satisfies readonly ResearchAsset[];

function absoluteUrl(path: string) {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getResearchAssetCatalog() {
  return RESEARCH_ASSETS.map((asset) => ({
    ...asset,
    canonicalUrl: absoluteUrl(asset.canonicalPath),
    dataUrl: absoluteUrl(asset.dataPath),
    supplementaryDataUrls:
      "supplementaryDataPaths" in asset
        ? asset.supplementaryDataPaths.map(absoluteUrl)
        : [],
  }));
}
