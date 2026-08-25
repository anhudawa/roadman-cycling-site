import { SITE_ORIGIN } from "@/lib/brand-facts";

export type SearchOwnerId =
  | "cycling-podcast"
  | "cycling-coaching"
  | "masters-cycling"
  | "cycling-training-plans"
  | "cycling-training-camps";

export interface SearchOwner {
  id: SearchOwnerId;
  path: string;
  label: string;
  primaryQuery: string;
  description: string;
  matchPhrases: readonly string[];
  supportingDestinations: readonly {
    path: string;
    label: string;
    intent: string;
  }[];
}

/**
 * One broad query family, one canonical Roadman destination.
 *
 * Supporting articles and episodes may rank for narrower questions, but they
 * should link back to the owner below rather than competing for the broad
 * head term. This registry is consumed by pages, audits and machine feeds so
 * search ownership cannot drift between hard-coded lists.
 */
export const SEARCH_OWNERS: readonly SearchOwner[] = [
  {
    id: "cycling-podcast",
    path: "/podcast",
    label: "The Roadman Cycling Podcast",
    primaryQuery: "cycling podcast",
    description:
      "Canonical show page and searchable episode archive for broad cycling-podcast searches.",
    matchPhrases: [
      "cycling podcast",
      "roadman podcast",
      "best cycling podcast",
      "cycling interview",
      "podcast episode",
    ],
    supportingDestinations: [
      {
        path: "/blog/best-cycling-podcasts-2026",
        label: "Best Cycling Podcasts 2026",
        intent: "Independent category comparison and listening recommendations",
      },
      {
        path: "/guests",
        label: "Cycling Expert Directory",
        intent: "Named-expert and guest discovery",
      },
    ],
  },
  {
    id: "cycling-coaching",
    path: "/coaching",
    label: "Online Cycling Coaching",
    primaryQuery: "cycling coaching",
    description:
      "Canonical service page for online cycling-coach and cycling-coaching searches.",
    matchPhrases: [
      "cycling coaching",
      "online cycling coach",
      "cycling coach",
      "coaching for cyclists",
      "personal cycling coach",
    ],
    supportingDestinations: [
      {
        path: "/topics/cycling-coaching",
        label: "Cycling Coaching Knowledge Guide",
        intent: "Informational guide to coaching, cost, fit and methodology",
      },
      {
        path: "/blog/best-online-cycling-coach-how-to-choose",
        label: "How to Choose an Online Cycling Coach",
        intent: "Coach-selection framework and red flags",
      },
    ],
  },
  {
    id: "masters-cycling",
    path: "/masters",
    label: "Masters Cycling Training",
    primaryQuery: "masters cycling",
    description:
      "Canonical knowledge hub for masters cyclists and evidence-based training after 40.",
    matchPhrases: [
      "masters cycling",
      "masters cyclist",
      "cycling over 40",
      "cyclist over 40",
      "cycling after 40",
      "cycling over 50",
      "cyclist over 50",
      "cycling after 50",
      "cycling over 60",
      "cyclist over 60",
      "cycling after 60",
      "older cyclist",
      "ageing cyclist",
      "aging cyclist",
    ],
    supportingDestinations: [
      {
        path: "/blog/cycling-masters-racing-getting-started-guide",
        label: "Masters Cycling Age Groups and Racing Guide",
        intent: "Masters age-category and first-race questions",
      },
      {
        path: "/blog/masters-cycling-training-report-2026",
        label: "Masters Cycling Training Report 2026",
        intent: "Evidence and original research for cyclists over 40",
      },
      {
        path: "/blog/cycling-over-50-training",
        label: "Cycling Over 50 Training Guide",
        intent: "Evidence-based training and recovery framework for riders over 50",
      },
    ],
  },
  {
    id: "cycling-training-plans",
    path: "/training-plans",
    label: "Cycling Training Plans",
    primaryQuery: "cycling training plans",
    description:
      "Canonical planning hub for structured cycling and event-training-plan searches.",
    matchPhrases: [
      "cycling training plan",
      "cycling training plans",
      "training plan for cyclists",
      "sportive training plan",
      "structured cycling plan",
      "event training plan",
    ],
    supportingDestinations: [
      {
        path: "/plan",
        label: "Cycling Training Plans by Event",
        intent: "Event-specific plan directory organised by weeks remaining",
      },
      {
        path: "/topics/cycling-training-plans",
        label: "Cycling Training Plan Methodology",
        intent: "Informational guide to periodisation and weekly structure",
      },
      {
        path: "/blog/how-pro-cyclist-trains-60-days",
        label: "Pro Training Principles: 60-Day Case Study",
        intent: "First-person training-plan experiment and results",
      },
    ],
  },
  {
    id: "cycling-training-camps",
    path: "/training-camps",
    label: "Cycling Training Camps in Girona",
    primaryQuery: "cycling training camps",
    description:
      "Canonical commercial hub for Roadman road and gravel cycling camps in Girona.",
    matchPhrases: [
      "cycling training camp",
      "cycling training camps",
      "cycling camp girona",
      "girona cycling camp",
      "road cycling camp",
      "cycling camp",
    ],
    supportingDestinations: [
      {
        path: "/blog/what-to-expect-cycling-training-camp",
        label: "What to Expect at a Cycling Training Camp",
        intent: "First-timer expectations, fitness and packing questions",
      },
      {
        path: "/blog/cycling-training-camp-preparation-guide",
        label: "Cycling Training Camp Preparation Guide",
        intent: "Pre-camp training, equipment and travel preparation",
      },
    ],
  },
] as const;

export const SEARCH_OWNER_BY_ID = new Map(
  SEARCH_OWNERS.map((owner) => [owner.id, owner]),
);

export function normaliseSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Remove the legacy pipe-delimited Roadman brand suffix from a page title.
 * The suffix is useful in old frontmatter but is not rendered in search
 * metadata, so ownership and cannibalisation checks must evaluate the title
 * a searcher actually sees.
 */
export function stripRoadmanBrandSuffix(value: string): string {
  return value.replace(/\s*\|\s*Roadman\b.*$/i, "").trim();
}

export function getSearchOwnerWebPageId(
  owner: Pick<SearchOwner, "path">,
): string {
  return `${SITE_ORIGIN}${owner.path}#webpage`;
}

/**
 * True when a supporting title adds a real search-intent modifier beyond the
 * owner's head term. "Best", a rider segment, a duration, a report or a
 * comparison are distinct intents; generic wrappers such as "complete guide"
 * are not. This keeps the review queue focused on genuine broad-title overlap.
 */
export function hasDistinctSupportingIntent(
  title: string,
  owner: Pick<SearchOwner, "primaryQuery">,
): boolean {
  const generic = new Set([
    "a",
    "an",
    "and",
    "are",
    "complete",
    "definitive",
    "for",
    "guide",
    "how",
    "in",
    "of",
    "the",
    "to",
    "what",
    "why",
    "with",
  ]);
  const stem = (token: string) =>
    token.length > 4 && token.endsWith("s") ? token.slice(0, -1) : token;
  const ownerTokens = new Set(
    normaliseSearchText(owner.primaryQuery).split(" ").map(stem),
  );

  return normaliseSearchText(stripRoadmanBrandSuffix(title))
    .split(" ")
    .map(stem)
    .some(
      (token) =>
        token.length > 0 &&
        !ownerTokens.has(token) &&
        !generic.has(token) &&
        !/^20\d{2}$/.test(token),
    );
}

export function resolveSearchOwner(
  values: Array<string | null | undefined>,
  options: {
    currentPath?: string;
    fallbackId?: SearchOwnerId;
  } = {},
): SearchOwner | null {
  const currentPath = options.currentPath?.replace(/\/$/, "") || undefined;
  const declaredOwner = currentPath
    ? SEARCH_OWNERS.find((owner) =>
        owner.supportingDestinations.some(
          (destination) => destination.path.replace(/\/$/, "") === currentPath,
        ),
      )
    : undefined;

  // Registry declarations are deliberate editorial decisions and therefore
  // outrank fuzzy metadata matching. This also guarantees that the visible
  // backlink and structured isPartOf relationship agree for priority pages.
  if (declaredOwner) return declaredOwner;

  const haystack = normaliseSearchText(values.filter(Boolean).join(" | "));
  let winner: { owner: SearchOwner; score: number } | null = null;

  for (const owner of SEARCH_OWNERS) {
    if (owner.path === currentPath) continue;
    const primary = normaliseSearchText(owner.primaryQuery);
    let score = haystack.includes(primary) ? 12 : 0;

    for (const phrase of owner.matchPhrases) {
      if (haystack.includes(normaliseSearchText(phrase))) {
        score += phrase === owner.primaryQuery ? 8 : 5;
      }
    }

    if (score > 0 && (!winner || score > winner.score)) {
      winner = { owner, score };
    }
  }

  if (winner) return winner.owner;
  return options.fallbackId
    ? SEARCH_OWNER_BY_ID.get(options.fallbackId) ?? null
    : null;
}

export function serialiseSearchOwners() {
  return SEARCH_OWNERS.map((owner) => ({
    ...owner,
    url: `${SITE_ORIGIN}${owner.path}`,
    supportingDestinations: owner.supportingDestinations.map((destination) => ({
      ...destination,
      url: `${SITE_ORIGIN}${destination.path}`,
    })),
  }));
}
