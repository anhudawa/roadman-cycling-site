/**
 * Canonical entity registry — the single source of truth for how every
 * expert, coach, scientist, and notable athlete is NAMED across the site.
 *
 * Why this file exists
 * --------------------
 * AI search (SGE / AEO) and Google's Knowledge Graph link a person to the
 * subjects a site covers by reconciling the *same* entity across many
 * pages. That reconciliation breaks when the same person is written three
 * different ways. A codebase scan (May 2026) found exactly that:
 *   - "Pogačar" (135×) vs "Pogacar" (217×, missing the diacritics)
 *   - "Professor Stephen Seiler" vs "Prof. Seiler" vs "Dr Stephen Seiler"
 *   - "Dr David Dunne" (63×) vs "Dr. David Dunne" (50×)
 *   - "André Greipel" (49×) vs "Andre Greipel" (7×)
 *   - "Greg LeMond" vs "Lemond" vs "Le Mond"
 *
 * Each `CanonicalEntity` fixes one canonical display name plus the list of
 * surface forms that have actually appeared in the codebase, so callers can:
 *   1. Generate consistent schema.org `Person` JSON-LD (`name`, `sameAs`,
 *      `knowsAbout`, `worksFor`).
 *   2. Normalise free-text references to the canonical form
 *      (`getCanonicalName`) and find the entity behind any variation
 *      (`findEntityByVariation`) for grep/replace consistency sweeps.
 *
 * Relationship to the other entity surfaces
 * -----------------------------------------
 *   - `content/entities/*.mdx` (loaded by `src/lib/entities.ts`) holds the
 *     long-form `/entity/[slug]` PAGES for the core expert network. Where a
 *     person has one, `entityPageSlug` points at it.
 *   - `src/lib/guests.ts` derives `/guests/[slug]` PROFILES from podcast
 *     episode frontmatter. Where a person was a guest, `guestSlug` matches.
 * This file is the naming/identity layer those surfaces should agree with.
 *
 * Verification policy
 * -------------------
 * `sameAs` contains ONLY URLs verified from repo-curated frontmatter
 * (`content/entities/*.mdx` and episode `guestSameAs`). Inventing a `sameAs`
 * is worse than omitting it, so unverified people carry an empty array and
 * `sameAsVerified: false`. Likewise `affiliationVerified` is true only when
 * the affiliation comes from curated data or an indisputable public fact;
 * current-team affiliations for active pros that were not verified this pass
 * are marked false. Flagged entries are safe to enrich later — never assume
 * an empty `sameAs` means "no public profile exists".
 */

/** Broad classification — drives which schema.org sub-type / page template fits. */
export type EntityKind =
  | "coach"
  | "scientist"
  | "nutritionist"
  | "physio-bikefitter"
  | "pro-cyclist"
  | "triathlete"
  | "industry"
  | "author-journalist";

export interface CanonicalEntity {
  /** Stable slug. Matches the `/entity` and/or `/guests` slug where one exists. */
  slug: string;
  /** THE canonical display name. Every page/schema reference should resolve to this. */
  canonicalName: string;
  /**
   * Every surface form found in the codebase (and obvious misspellings),
   * for grep/replace consistency sweeps and for `findEntityByVariation`.
   * Includes the canonical name itself and surname-only references.
   */
  variations: string[];
  /** Job title / credential, written for use as schema.org `jobTitle`. */
  title: string;
  /** Primary organisation / team / employer (schema.org `affiliation` / `worksFor`). */
  affiliation: string;
  /** True only if the affiliation is from curated repo data or an indisputable fact. */
  affiliationVerified: boolean;
  /**
   * Knowledge Graph disambiguation URLs (schema.org `sameAs`). Verified from
   * repo-curated frontmatter only. Empty when unverified — see file header.
   */
  sameAs: string[];
  /** True only if every `sameAs` URL was verified from curated repo data. */
  sameAsVerified: boolean;
  /** Subjects this person is publicly known for (schema.org `knowsAbout`). */
  topics: string[];
  /** Podcast episode slugs this person appears in as a guest (empty for non-guest subjects). */
  episodes: string[];
  /** Broad classification. */
  kind: EntityKind;
  /** Slug of the `/entity/[slug]` long-form page, if one exists. */
  entityPageSlug?: string;
  /** Slug of the `/guests/[slug]` profile, if this person was a podcast guest. */
  guestSlug?: string;
  /** Disambiguation / accuracy notes. Surfaced to editors, never to schema. */
  notes?: string;
}

export const CANONICAL_ENTITIES: CanonicalEntity[] = [
  // ──────────────────────────────────────────────────────────────────────
  // Core expert network (have dedicated /entity pages). sameAs verified
  // from content/entities/*.mdx and episode guestSameAs.
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "stephen-seiler",
    canonicalName: "Professor Stephen Seiler",
    variations: [
      "Professor Stephen Seiler",
      "Prof. Stephen Seiler",
      "Prof Stephen Seiler",
      "Dr Stephen Seiler",
      "Dr. Stephen Seiler",
      "Professor Seiler",
      "Prof. Seiler",
      "Prof Seiler",
      "Dr Seiler",
      "Stephen Seiler",
      "Steve Seiler",
      "Steven Seiler",
      "Steven Syler",
      "Steve Syler",
      "Professor Steven Syler",
      "Seiler",
    ],
    title: "Professor of Sport Science; polarised-training pioneer",
    affiliation: "University of Agder, Norway",
    affiliationVerified: true,
    sameAs: [
      "https://x.com/StephenSeiler",
      "https://www.uia.no/english/about-uia/employees/stephens/",
      "https://www.linkedin.com/in/stephen-seiler-668202a/",
      "https://www.researchgate.net/profile/Stephen-Seiler",
    ],
    sameAsVerified: true,
    topics: [
      "polarised training",
      "80/20 intensity distribution",
      "Zone 2 endurance training",
      "lactate threshold",
      "exercise physiology",
      "endurance adaptation",
    ],
    episodes: [
      "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2540-secret-to-improving-threshold-dose-frequency-duration",
    ],
    kind: "scientist",
    entityPageSlug: "stephen-seiler",
    guestSlug: "stephen-seiler",
    notes:
      "Canonical title is 'Professor', not 'Dr'. He holds a PhD but his on-site identity is Professor of Sport Science at the University of Agder.",
  },
  {
    slug: "dan-lorang",
    canonicalName: "Dan Lorang",
    variations: ["Dan Lorang", "Lorang"],
    title: "Head of Performance",
    affiliation: "Red Bull–Bora–Hansgrohe",
    affiliationVerified: true,
    sameAs: [
      "https://en.wikipedia.org/wiki/Dan_Lorang",
      "https://www.redbull.com/int-en/teams/red-bull-bora-hansgrohe",
      "https://www.linkedin.com/in/dan-lorang/",
      "https://de.linkedin.com/in/dan-lorang-33296319",
    ],
    sameAsVerified: true,
    topics: [
      "cycling coaching",
      "triathlon coaching",
      "polarised intensity distribution",
      "periodisation",
      "training-load management",
      "long-term athlete development",
    ],
    episodes: [
      "ep-2056-13-years-of-coaching-pros-what-amateurs-dont-know",
      "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
      "ep-2540-secret-to-improving-threshold-dose-frequency-duration",
    ],
    kind: "coach",
    entityPageSlug: "dan-lorang",
    guestSlug: "dan-lorang",
    notes:
      "VERIFY-CRITICAL: Head of Performance at Red Bull–Bora–Hansgrohe (cycling) and long-time coach to triathletes Jan Frodeno, Anne Haug, and Lucy Charles-Barclay. He is NOT Tadej Pogačar's coach — Pogačar rides for UAE Team Emirates.",
  },
  {
    slug: "john-wakefield",
    canonicalName: "John Wakefield",
    variations: ["John Wakefield", "Coach John Wakefield", "Wakefield"],
    title: "Director of Coaching & Sports Science",
    affiliation: "Red Bull–Bora–Hansgrohe",
    affiliationVerified: true,
    sameAs: [
      "https://www.linkedin.com/in/john-wakefield-a7449785/",
      "https://www.trainingpeaks.com/coach/john-sciencetosport",
    ],
    sameAsVerified: true,
    topics: [
      "low-cadence training",
      "torque intervals",
      "cycling coaching",
      "sweet-spot training",
      "bike fit",
      "sports science",
    ],
    episodes: [
      "ep-2132-how-do-team-bora-approach-building-endurance-we-find-out-joh",
      "ep-2540-secret-to-improving-threshold-dose-frequency-duration",
    ],
    kind: "coach",
    entityPageSlug: "john-wakefield",
    guestSlug: "john-wakefield",
    notes:
      "Runs the Science to Sport performance lab in Girona; previously coached at UAE Team Emirates.",
  },
  {
    slug: "tim-kerrison",
    canonicalName: "Tim Kerrison",
    variations: ["Tim Kerrison", "Kerrison"],
    title: "Performance director; ex-Head of Performance, Team Sky / INEOS",
    affiliation: "INEOS Grenadiers",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: [
      "cycling coaching",
      "altitude training",
      "race-specific preparation",
      "Grand Tour periodisation",
      "sweet-spot training",
      "performance science",
    ],
    episodes: [],
    kind: "coach",
    entityPageSlug: "tim-kerrison",
    notes:
      "Has an /entity page but was not a podcast guest (no episodes). Architect of the Team Sky/INEOS training system; current role/affiliation not verified this pass — flag before emitting current-employer schema.",
  },
  {
    slug: "joe-friel",
    canonicalName: "Joe Friel",
    variations: ["Joe Friel", "Coach Joe Friel", "Friel"],
    title: "Endurance coach and author of The Cyclist's Training Bible",
    affiliation: "Co-founder, TrainingPeaks",
    affiliationVerified: true,
    sameAs: [
      "https://en.wikipedia.org/wiki/Joe_Friel",
      "https://joefrieltraining.com/",
      "https://www.joefrielsblog.com/",
      "https://x.com/jfriel",
      "https://www.linkedin.com/in/joe-friel-2b9b6b13/",
    ],
    sameAsVerified: true,
    topics: [
      "cycling periodisation",
      "season planning",
      "training stress score",
      "heart rate zone training",
      "masters cycling",
      "long-term athlete development",
    ],
    episodes: [
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
    ],
    kind: "coach",
    entityPageSlug: "joe-friel",
    guestSlug: "joe-friel",
    notes: "VERIFY-CRITICAL: author of The Cyclist's Training Bible (now 5th edition).",
  },
  {
    slug: "andy-galpin",
    canonicalName: "Dr Andy Galpin",
    variations: [
      "Dr Andy Galpin",
      "Dr. Andy Galpin",
      "Professor Andy Galpin",
      "Andy Galpin",
      "Galpin",
    ],
    title: "Professor of Kinesiology; muscle physiologist",
    affiliation: "California State University, Fullerton",
    affiliationVerified: true,
    sameAs: [
      "https://www.andygalpin.com/",
      "https://hhd.fullerton.edu/knes/faculty-staff/fulltime-faculty/andy-galpin.html",
      "https://www.performpodcast.com/",
      "https://www.youtube.com/@drandygalpin",
      "https://www.instagram.com/drandygalpin/",
    ],
    sameAsVerified: true,
    topics: [
      "skeletal muscle physiology",
      "fast-twitch and slow-twitch fibre adaptation",
      "strength and conditioning for endurance athletes",
      "hypertrophy and power training",
      "sleep and recovery science",
      "protein and nutrition for masters athletes",
    ],
    episodes: ["the-science-of-getting-faster-after-40-dr-andy-galpin"],
    kind: "scientist",
    entityPageSlug: "andy-galpin",
    guestSlug: "andy-galpin",
  },
  {
    slug: "alan-murchison",
    canonicalName: "Alan Murchison",
    variations: ["Alan Murchison", "Murchison"],
    title: "Performance chef and elite sports nutritionist",
    affiliation: "Performance Chef",
    affiliationVerified: true,
    sameAs: [
      "https://en.wikipedia.org/wiki/Alan_Murchison",
      "https://performancechef.com/",
      "https://www.instagram.com/performance.chef/",
      "https://twitter.com/AlanMurchison",
      "https://www.linkedin.com/in/alan-murchison-695668107/",
      "https://www.greatbritishchefs.com/chefs/alan-murchison",
    ],
    sameAsVerified: true,
    topics: [
      "cycling nutrition",
      "performance cooking",
      "race-day fuelling",
      "body composition for endurance",
      "plant-powered performance",
      "in-ride nutrition",
    ],
    episodes: [
      "what-pros-actually-eat-to-win-michelin-chef-alan-murchison",
      "ep-2217-the-untold-story-of-success-alan-murchison",
    ],
    kind: "nutritionist",
    entityPageSlug: "alan-murchison",
    guestSlug: "alan-murchison",
  },
  {
    slug: "david-dunne",
    canonicalName: "Dr David Dunne",
    variations: [
      "Dr David Dunne",
      "Dr. David Dunne",
      "Dr Dunne",
      "David Dunne",
      "Dunne",
    ],
    title: "Performance nutritionist; co-founder & CEO of Hexis",
    affiliation: "Hexis",
    affiliationVerified: true,
    sameAs: [
      "https://www.researchgate.net/profile/David-Dunne-9",
      "https://www.hexis.live/blog/meet-the-team-david-dunne",
      "https://www.linkedin.com/in/dr-david-dunne-b1b6a14b/",
      "https://x.com/drdaviddunne",
    ],
    sameAsVerified: true,
    topics: [
      "cycling nutrition",
      "carbohydrate periodisation",
      "in-ride fuelling",
      "body composition for endurance",
      "sports nutrition behaviour change",
      "personalised nutrition",
    ],
    episodes: ["ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong"],
    kind: "nutritionist",
    entityPageSlug: "david-dunne",
    guestSlug: "david-dunne",
  },
  {
    slug: "lachlan-morton",
    canonicalName: "Lachlan Morton",
    variations: ["Lachlan Morton", "Lachlan", "Morton"],
    title: "Professional cyclist; ultra-distance and alt-racing pioneer",
    affiliation: "EF Education–EasyPost",
    affiliationVerified: true,
    sameAs: [
      "https://en.wikipedia.org/wiki/Lachlan_Morton",
      "https://www.efprocycling.com/our-team/lachlan-morton/",
      "https://www.procyclingstats.com/rider/lachlan-morton",
      "https://www.instagram.com/lachlanmorton/",
      "https://www.strava.com/athletes/144658",
    ],
    sameAsVerified: true,
    topics: [
      "ultra-endurance cycling",
      "alt-racing",
      "bikepacking",
      "World Tour racing",
      "Everesting",
      "gravel racing",
    ],
    episodes: ["ep-21-my-untold-story-about-why-i-quit-world-tour-lachlan-morton"],
    kind: "pro-cyclist",
    entityPageSlug: "lachlan-morton",
    guestSlug: "lachlan-morton",
  },

  // ──────────────────────────────────────────────────────────────────────
  // Podcast guests with sameAs verified from episode guestSameAs frontmatter.
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "greg-lemond",
    canonicalName: "Greg LeMond",
    variations: ["Greg LeMond", "LeMond", "Lemond", "Le Mond"],
    title: "Three-time Tour de France winner",
    affiliation: "Retired professional cyclist",
    affiliationVerified: true,
    sameAs: [
      "https://en.wikipedia.org/wiki/Greg_LeMond",
      "https://www.wikidata.org/wiki/Q312697",
      "https://www.instagram.com/greg.lemond/",
      "https://www.facebook.com/greglemond/",
      "https://www.procyclingstats.com/rider/greg-lemond",
    ],
    sameAsVerified: true,
    topics: [
      "Tour de France racing history",
      "pro cycling ethics and doping",
      "power-based training",
      "aerodynamic time trialling",
      "mitochondrial physiology in athletes",
    ],
    episodes: [
      "ep-2150-the-untold-story-about-why-i-quit-cycling-greg-lemond",
      "ep-2176-lemond-opens-up-about-relationship-with-hinault-rdmn-clips",
      "ep-2196-untold-lemond-opens-up-about-relationship-with-lance-rdmn-cl",
      "ep-2210-my-untold-story-of-epo-greg-lemond",
    ],
    kind: "pro-cyclist",
    guestSlug: "greg-lemond",
    notes: "VERIFY-CRITICAL: capital M — 'LeMond', never 'Lemond' or 'Le Mond'.",
  },
  {
    slug: "ben-healy",
    canonicalName: "Ben Healy",
    variations: ["Ben Healy", "Healy"],
    title: "Professional cyclist; 2025 Tour de France stage winner",
    affiliation: "EF Education–EasyPost",
    affiliationVerified: true,
    sameAs: [
      "https://en.wikipedia.org/wiki/Ben_Healy",
      "https://www.procyclingstats.com/rider/ben-healy",
      "https://www.efprocycling.com/team/ben-healy",
      "https://www.instagram.com/benhealy_/",
    ],
    sameAsVerified: true,
    topics: [
      "pro road racing",
      "solo breakaway tactics",
      "aerodynamic optimisation",
      "pro fuelling",
      "World Tour periodisation",
    ],
    episodes: ["ep-19-my-untold-story-of-how-yellow-didn-t-feel-like-victory-ben-h"],
    kind: "pro-cyclist",
    guestSlug: "ben-healy",
  },
  {
    slug: "michael-matthews",
    canonicalName: "Michael Matthews",
    variations: ["Michael Matthews", "Matthews", "Bling Matthews"],
    title: "Professional cyclist; Grand Tour stage winner",
    affiliation: "Team Jayco AlUla",
    affiliationVerified: false,
    sameAs: [
      "https://en.wikipedia.org/wiki/Michael_Matthews_(cyclist)",
      "https://www.procyclingstats.com/rider/michael-matthews",
      "https://www.instagram.com/blingmatthews/",
      "https://x.com/blingmatthews",
    ],
    sameAsVerified: true,
    topics: [
      "sprint training",
      "Grand Tour racing",
      "Classics preparation",
      "team tactics",
      "pro periodisation",
    ],
    episodes: ["ep-4-15-years-of-pro-riding-what-amateurs-don-t-know-matthews"],
    kind: "pro-cyclist",
    guestSlug: "michael-matthews",
    notes: "Current team not verified this pass; Wikipedia disambiguates as 'Michael Matthews (cyclist)'.",
  },
  {
    slug: "rosa-kloser",
    canonicalName: "Rosa Klöser",
    variations: ["Rosa Klöser", "Rosa Kloser", "Klöser", "Kloser"],
    title: "Professional gravel racer; Unbound 200 winner",
    affiliation: "Professional gravel cyclist",
    affiliationVerified: true,
    sameAs: [
      "https://www.procyclingstats.com/rider/rosa-kloser",
      "https://www.instagram.com/rosa_kloeser/",
      "https://www.strava.com/athletes/rosakloser",
    ],
    sameAsVerified: true,
    topics: [
      "gravel racing",
      "Unbound 200 racing",
      "high-volume training",
      "race-day decision making",
      "gravel training specificity",
    ],
    episodes: [
      "ep-9-the-smartest-way-to-train-for-more-speed-on-gravel-rosa-kl-s",
      "ep-2110-how-this-simple-training-plan-won-me-unbound-2024-rosa-kl-se",
    ],
    kind: "pro-cyclist",
    guestSlug: "rosa-kloser",
    notes: "Diacritic on the ö — 'Rosa Klöser'. Slug normalises to 'rosa-kloser'.",
  },

  // ──────────────────────────────────────────────────────────────────────
  // Coaches / scientists / nutritionists / fitters (podcast guests).
  // sameAs UNVERIFIED — credentials/affiliations from curated guests.ts.
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "tim-spector",
    canonicalName: "Professor Tim Spector",
    variations: [
      "Professor Tim Spector",
      "Prof Tim Spector",
      "Prof. Tim Spector",
      "Prof Spector",
      "Prof. Spector",
      "Tim Spector",
      "Spector",
    ],
    title: "Professor of genetic epidemiology; co-founder of ZOE",
    affiliation: "King's College London",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: [
      "gut microbiome",
      "nutrition science",
      "personalised nutrition",
      "metabolic health",
      "food and body composition",
    ],
    episodes: ["ep-2174-99-get-it-wrong-how-to-correctly-optimize-your-gut-for-weigh"],
    kind: "scientist",
    guestSlug: "tim-spector",
  },
  {
    slug: "dr-allen-lim",
    canonicalName: "Dr Allen Lim",
    variations: ["Dr Allen Lim", "Dr Lim", "Allen Lim", "Lim"],
    title: "Sports physiologist; founder of Skratch Labs",
    affiliation: "Skratch Labs",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: [
      "sports physiology",
      "in-ride nutrition",
      "hydration",
      "real-food fuelling",
      "World Tour performance",
    ],
    episodes: ["ep-2123-the-untold-story-of-cycling-s-rebirth-after-armstrong-dr-lim"],
    kind: "nutritionist",
    guestSlug: "dr-allen-lim",
    notes: "Surname 'Lim' is short — only grep/replace with a first name or title qualifier.",
  },
  {
    slug: "matt-bottrill",
    canonicalName: "Matt Bottrill",
    variations: ["Matt Bottrill", "Bottrill"],
    title: "UK time trial champion and cycling coach",
    affiliation: "Matt Bottrill Performance Coaching",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: [
      "time trial training",
      "aerodynamics",
      "cycling coaching",
      "pace and position",
    ],
    episodes: ["ep-2128-7-hacks-pro-riders-use-that-you-probably-dont-matt-bottrill"],
    kind: "coach",
    guestSlug: "matt-bottrill",
  },
  {
    slug: "derek-teel",
    canonicalName: "Derek Teel",
    variations: ["Derek Teel", "Teel"],
    title: "Founder of Dialed Health; S&C coach for cyclists",
    affiliation: "Dialed Health",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: [
      "strength training for cyclists",
      "injury prevention",
      "mobility",
      "off-the-bike conditioning",
    ],
    episodes: [
      "ep-2091-the-best-exercises-for-cyclists-strength-training",
      "ep-2183-strength-training-for-cycling-simplified-derek-teel",
    ],
    kind: "physio-bikefitter",
    guestSlug: "derek-teel",
  },
  {
    slug: "dr-andy-pruitt",
    canonicalName: "Dr Andy Pruitt",
    variations: ["Dr Andy Pruitt", "Dr. Andy Pruitt", "Dr Pruitt", "Pruitt"],
    title: "Bike-fit pioneer; founder of the Boulder Center for Sports Medicine",
    affiliation: "Boulder Center for Sports Medicine",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: ["bike fit", "cycling biomechanics", "injury prevention", "saddle and contact points"],
    episodes: ["ep-2186-the-correct-bike-fit-simplified-dr-pruitt"],
    kind: "physio-bikefitter",
    guestSlug: "dr-andy-pruitt",
  },
  {
    slug: "olav-bu",
    canonicalName: "Olav Aleksander Bu",
    variations: ["Olav Aleksander Bu", "Olav Bu", "Bu"],
    title: "Endurance physiologist and performance engineer",
    affiliation: "Uno-X Mobility / Santara Tech",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: [
      "endurance physiology",
      "lactate and metabolic testing",
      "triathlon performance",
      "data-driven coaching",
      "VO2max",
    ],
    episodes: ["ep-2161-how-to-create-the-perfect-triathlon-training-plan-olav-bu"],
    kind: "scientist",
    guestSlug: "olav-bu",
    notes: "Best known for coaching triathletes Kristian Blummenfelt and Gustav Iden; current affiliations unverified this pass.",
  },
  {
    slug: "vasilis-anastopoulos",
    canonicalName: "Vasilis Anastopoulos",
    variations: ["Vasilis Anastopoulos", "Anastopoulos"],
    title: "WorldTour performance coach",
    affiliation: "WorldTour coach (formerly Astana and Quick-Step)",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["cycling coaching", "zone 2 training", "race preparation", "sprint lead-outs"],
    episodes: [
      "ep-2-i-asked-astana-coach-about-zone-2-heres-what-he-said",
      "ep-2108-did-cavendishs-coach-reveal-the-secret-to-winning-vasilis-an",
    ],
    kind: "coach",
    guestSlug: "vasilis-anastopoulos",
  },
  {
    slug: "hannah-grant",
    canonicalName: "Hannah Grant",
    variations: ["Hannah Grant"],
    title: "Performance chef; author of The Grand Tour Cookbook",
    affiliation: "Former pro cycling team chef",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: ["pro cycling nutrition", "race-day food", "performance cooking", "fuelling for stage races"],
    episodes: ["ep-2220-omerta-busted-how-pro-cyclists-lose-weight-fast-hannah-grant"],
    kind: "nutritionist",
    guestSlug: "hannah-grant",
  },
  {
    slug: "sam-impey",
    canonicalName: "Dr Sam Impey",
    variations: ["Dr Sam Impey", "Dr. Sam Impey", "Dr Impey", "Dr. Impey", "Sam Impey", "Impey"],
    title: "Sports nutritionist; World Tour performance researcher",
    affiliation: "World Tour performance nutrition",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: [
      "carbohydrate periodisation",
      "fuel for the work required",
      "in-ride fuelling",
      "energy availability",
    ],
    episodes: [
      "ep-14-i-tried-eating-like-pidcock-for-60-days-here-s-what-happened",
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
    ],
    kind: "nutritionist",
    guestSlug: "sam-impey",
    notes: "Codebase mixes 'Dr' and 'Prof' titles — curated data uses 'Dr Sam Impey'.",
  },
  {
    slug: "tim-podlogar",
    canonicalName: "Dr Tim Podlogar",
    variations: ["Dr Tim Podlogar", "Dr. Tim Podlogar", "Dr Podlogar", "Tim Podlogar", "Podlogar"],
    title: "Sports nutrition researcher; carbohydrate metabolism specialist",
    affiliation: "Sports nutrition research",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: [
      "carbohydrate metabolism",
      "high-carbohydrate fuelling",
      "glycogen and fat oxidation",
      "weight loss and performance",
    ],
    episodes: [
      "ep-3-is-losing-weight-actually-making-you-slower",
      "ep-34-how-pro-cyclists-get-so-lean-what-amateurs-don-t-know",
    ],
    kind: "scientist",
    guestSlug: "tim-podlogar",
  },
  {
    slug: "sarah-berry",
    canonicalName: "Professor Sarah Berry",
    variations: ["Professor Sarah Berry", "Prof Sarah Berry", "Dr Berry", "Sarah Berry", "Berry"],
    title: "Professor of Nutritional Sciences; Chief Scientist at ZOE",
    affiliation: "King's College London",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: ["nutrition science", "meal timing", "fats and metabolism", "personalised nutrition"],
    episodes: ["ep-2155-forget-what-you-eat-its-when-you-eat-that-changes-everything"],
    kind: "scientist",
    guestSlug: "sarah-berry",
  },
  {
    slug: "dr-michael-gervais",
    canonicalName: "Dr Michael Gervais",
    variations: ["Dr Michael Gervais", "Dr Gervais", "Michael Gervais", "Gervais"],
    title: "High-performance psychologist; host of Finding Mastery",
    affiliation: "Finding Mastery",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: ["sports psychology", "mindset", "performance under pressure", "managing negative thoughts"],
    episodes: ["ep-2181-beating-negative-thoughts-why-99-fail-and-how-you-wont-dr-ge"],
    kind: "scientist",
    guestSlug: "dr-michael-gervais",
  },
  {
    slug: "dr-andrew-sellars",
    canonicalName: "Dr Andrew Sellars",
    variations: ["Dr Andrew Sellars", "Dr Sellars", "Dr Sellers", "Andrew Sellars", "Sellars"],
    title: "Anaesthesiologist and respiratory physiology researcher",
    affiliation: "Co-founder, VO2 Master / Isocapnic",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["breathing mechanics", "respiratory training", "VO2 testing", "breathing for cyclists"],
    episodes: ["ep-28-your-legs-aren-t-the-problem-it-s-your-breathing-dr-sellers"],
    kind: "scientist",
    guestSlug: "dr-andrew-sellars",
    notes: "Episode slug misspells as 'dr-sellers'; the knowledge base also uses 'Dr Sellers'. Canonical surname is 'Sellars'.",
  },
  {
    slug: "daryl-fitzgerald",
    canonicalName: "Daryl Fitzgerald",
    variations: ["Daryl Fitzgerald", "Fitzgerald"],
    title: "World Tour bike fitter at Science to Sport",
    affiliation: "Science to Sport",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["bike fit", "winter training structure", "position optimisation"],
    episodes: [
      "ep-1-pro-bike-fitter-reveals-the-1-change-amateurs-should-make",
      "ep-8-how-to-structure-winter-training-intensity-frequency-duratio",
    ],
    kind: "physio-bikefitter",
    guestSlug: "daryl-fitzgerald",
  },
  {
    slug: "phil-burt",
    canonicalName: "Phil Burt",
    variations: ["Phil Burt", "Phil Bert", "Burt"],
    title: "Former Team Sky and British Cycling physiotherapist and bike fitter",
    affiliation: "Phil Burt Innovation",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["bike fit", "physiotherapy for cyclists", "saddle health", "back and neck pain"],
    episodes: [
      "ep-2-i-tried-a-bike-fit-from-team-gb-bike-fitter-heres-what-happe",
      "ep-2535-5-fixable-bike-fit-mistake-most-riders-make",
    ],
    kind: "physio-bikefitter",
    guestSlug: "phil-burt",
    notes: "Episode slug 'ep-2535' and the guest field misspell as 'Phil Bert'. Canonical is 'Phil Burt'.",
  },

  // ──────────────────────────────────────────────────────────────────────
  // Pro cyclists / athletes (podcast guests). sameAs UNVERIFIED.
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "george-hincapie",
    canonicalName: "George Hincapie",
    variations: ["George Hincapie", "Hincapie", "Hincape"],
    title: "17-time Tour de France starter; retired professional cyclist",
    affiliation: "Retired professional cyclist; founder of Hincapie Sportswear",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["Paris-Roubaix and the Classics", "Tour de France history", "team leadership", "pro cycling era"],
    episodes: [
      "ep-2536-hincape-opens-up-about-how-pogacar-can-win-roubaix",
      "ep-2180-hincapie-opens-up-about-sagan-paris-roubaix-rdmn-clips",
      "ep-2202-hincapie-opens-up-about-time-with-tom-boonen-rdmn-podcast-cl",
      "ep-2231-the-untold-story-of-my-time-with-lance-hincapie",
    ],
    kind: "pro-cyclist",
    guestSlug: "george-hincapie",
    notes: "Episode slug 'ep-2536' misspells the surname as 'Hincape'.",
  },
  {
    slug: "alex-dowsett",
    canonicalName: "Alex Dowsett",
    variations: ["Alex Dowsett", "Dowsett"],
    title: "Former UCI Hour Record holder; time trial specialist",
    affiliation: "Retired professional cyclist",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["time trialling", "aerodynamics", "Hour Record", "haemophilia advocacy"],
    episodes: [
      "ep-2119-13-years-of-pro-riding-what-amateurs-dont-know-dowsett",
      "ep-2182-alex-dowsett-opens-up-about-benji-lanterne-rouge-rdmn-clips",
      "ep-2214-dowsett-opens-up-about-why-it-was-time-to-quit-cycling",
    ],
    kind: "pro-cyclist",
    guestSlug: "alex-dowsett",
  },
  {
    slug: "andre-greipel",
    canonicalName: "André Greipel",
    variations: ["André Greipel", "Andre Greipel", "Greipel"],
    title: "Grand Tour sprint legend; 22 Grand Tour stage wins",
    affiliation: "Retired professional cyclist",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["sprinting", "lead-out trains", "Grand Tour racing", "sprint training"],
    episodes: [
      "ep-2190-greipel-opens-up-about-relationship-with-cavendish-rdmn-clip",
      "ep-2240-what-makes-a-sprinter-unbeatable-andr-greipel",
    ],
    kind: "pro-cyclist",
    guestSlug: "andre-greipel",
    notes: "Diacritic on the é — 'André Greipel', not 'Andre Greipel'.",
  },
  {
    slug: "dan-bigham",
    canonicalName: "Dan Bigham",
    variations: ["Dan Bigham", "Bigham"],
    title: "Former UCI Hour Record holder; Head of Engineering",
    affiliation: "Red Bull–Bora–Hansgrohe",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["aerodynamics", "marginal gains", "Hour Record", "engineering for performance"],
    episodes: ["ep-2106-he-accidentally-mastered-aerodynamics-dan-bigham"],
    kind: "pro-cyclist",
    guestSlug: "dan-bigham",
  },
  {
    slug: "alistair-brownlee",
    canonicalName: "Alistair Brownlee",
    variations: ["Alistair Brownlee", "Brownlee"],
    title: "Two-time Olympic triathlon gold medallist",
    affiliation: "Professional triathlete",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: ["triathlon", "endurance training", "Olympic preparation", "swim-bike-run pacing"],
    episodes: ["ep-2063-brownlee-5-endurance-lessons-i-wish-i-knew-earlier"],
    kind: "triathlete",
    guestSlug: "alistair-brownlee",
  },
  {
    slug: "ed-clancy",
    canonicalName: "Ed Clancy",
    variations: ["Ed Clancy", "Clancy"],
    title: "Three-time Olympic gold medallist, team pursuit",
    affiliation: "Retired professional track cyclist",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["track cycling", "team pursuit", "starts and power", "British Cycling"],
    episodes: ["ep-39-how-cavendish-thomas-became-legends-with-ed-clancy"],
    kind: "pro-cyclist",
    guestSlug: "ed-clancy",
  },
  {
    slug: "eddie-dunbar",
    canonicalName: "Eddie Dunbar",
    variations: ["Eddie Dunbar", "Dunbar"],
    title: "Irish professional cyclist",
    affiliation: "Team Jayco AlUla",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["Grand Tour GC racing", "climbing", "World Tour life"],
    episodes: ["ep-2236-lessons-learned-at-ineos-grenadiers-but-time-for-a-new-chapt"],
    kind: "pro-cyclist",
    guestSlug: "eddie-dunbar",
  },
  {
    slug: "jonas-abrahamsen",
    canonicalName: "Jonas Abrahamsen",
    variations: ["Jonas Abrahamsen", "Abrahamsen"],
    title: "Norwegian professional cyclist",
    affiliation: "Uno-X Mobility",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["breakaway racing", "weight loss and performance", "winter training", "KOM competition"],
    episodes: ["ep-29-untold-story-ofjonas-abrahamsens-pro-winter-training"],
    kind: "pro-cyclist",
    guestSlug: "jonas-abrahamsen",
  },
  {
    slug: "laurens-ten-dam",
    canonicalName: "Laurens ten Dam",
    variations: ["Laurens ten Dam", "Laurens Ten Dam", "ten Dam", "Ten Dam"],
    title: "Retired Grand Tour rider turned gravel racer",
    affiliation: "Professional gravel cyclist",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["gravel racing", "Grand Tour experience", "ultra-distance", "cycling culture"],
    episodes: [
      "ep-2097-riding-the-worlds-most-beautiful-race-laurens-ten-dam",
      "ep-2247-laurens-ten-dam-roadman-cycling-podcast",
    ],
    kind: "pro-cyclist",
    guestSlug: "laurens-ten-dam",
    notes: "Dutch lowercase 'ten' — 'Laurens ten Dam'. Codebase also uses title-case 'Ten Dam'.",
  },
  {
    slug: "mads-wurtz-schmidt",
    canonicalName: "Mads Würtz Schmidt",
    variations: ["Mads Würtz Schmidt", "Mads Wurtz Schmidt", "Mads W", "Würtz Schmidt", "Wurtz Schmidt"],
    title: "2025 European Gravel Champion; Traka winner",
    affiliation: "Specialized Off-Road Racing Team",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["gravel racing", "time trialling", "World Tour to gravel transition"],
    episodes: [
      "ep-10-inside-gravels-first-super-team-with-european-gravel-champio",
      "ep-35-what-i-wish-i-knew-before-i-started-gravel-cycling",
    ],
    kind: "pro-cyclist",
    guestSlug: "mads-wurtz-schmidt",
    notes: "Diacritic on the ü — 'Mads Würtz Schmidt'.",
  },
  {
    slug: "valtteri-bottas",
    canonicalName: "Valtteri Bottas",
    variations: ["Valtteri Bottas", "Bottas"],
    title: "Formula 1 driver and keen amateur cyclist",
    affiliation: "Formula 1",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["cross-training", "gravel cycling", "endurance for motorsport", "amateur racing"],
    episodes: ["ep-2142-f1-inspired-tips-every-cyclist-should-know-bottas"],
    kind: "pro-cyclist",
    guestSlug: "valtteri-bottas",
  },
  {
    slug: "ben-oliver",
    canonicalName: "Ben Oliver",
    variations: ["Ben Oliver", "Oliver"],
    title: "Professional cyclist; Paris-Roubaix finisher",
    affiliation: "Modern Adventure Pro Cycling",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["Paris-Roubaix and the Classics", "tyre choice and pressure", "pro race tech", "pro power numbers"],
    episodes: ["ep-3-pro-rider-opens-up-power-numbers-tech-race-paris-roubaix"],
    kind: "pro-cyclist",
    guestSlug: "ben-oliver",
    notes: "Joined the podcast after racing Paris-Roubaix with Modern Adventure Pro Cycling. Distinct from Ben Healy (already in registry).",
  },

  // ──────────────────────────────────────────────────────────────────────
  // Non-guest pro cyclists referenced heavily across articles (subjects,
  // not interviewees). episodes = [] by design. sameAs UNVERIFIED.
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "tadej-pogacar",
    canonicalName: "Tadej Pogačar",
    variations: ["Tadej Pogačar", "Tadej Pogacar", "Pogačar", "Pogacar", "Pog", "Pogi"],
    title: "Three-time Tour de France winner; multiple-time World Champion",
    affiliation: "UAE Team Emirates",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["Grand Tour GC racing", "climbing", "all-round racing", "pro training and fuelling"],
    episodes: [],
    kind: "pro-cyclist",
    notes:
      "VERIFY-CRITICAL: accents on BOTH letters — 'Tadej Pogačar'. The unaccented 'Pogacar' (217 occurrences) and 'Tadej Pogacar' (44) are the primary grep/replace targets. Subject of many articles, never a podcast guest. Rides for UAE Team Emirates (verify current team name before emitting affiliation schema).",
  },
  {
    slug: "jonas-vingegaard",
    canonicalName: "Jonas Vingegaard",
    variations: ["Jonas Vingegaard", "Vingegaard"],
    title: "Two-time Tour de France winner",
    affiliation: "Team Visma–Lease a Bike",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["Grand Tour GC racing", "climbing", "polarised training", "pro periodisation"],
    episodes: [],
    kind: "pro-cyclist",
    notes: "Subject, not a guest. Current team unverified this pass.",
  },
  {
    slug: "mark-cavendish",
    canonicalName: "Mark Cavendish",
    variations: ["Mark Cavendish", "Cavendish", "Cav"],
    title: "Record holder for most Tour de France stage wins",
    affiliation: "Retired professional cyclist",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["sprinting", "lead-out trains", "Tour de France history", "Grand Tour stages"],
    episodes: [],
    kind: "pro-cyclist",
    notes: "Subject, not a guest. Retirement status unverified this pass.",
  },
  {
    slug: "bradley-wiggins",
    canonicalName: "Sir Bradley Wiggins",
    variations: ["Sir Bradley Wiggins", "Bradley Wiggins", "Brad Wiggins", "Wiggins", "Wiggo"],
    title: "2012 Tour de France winner; Olympic and Hour Record champion",
    affiliation: "Retired professional cyclist",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: ["Grand Tour racing", "time trialling", "track cycling", "Team Sky era", "climbing pacing"],
    episodes: [],
    kind: "pro-cyclist",
    notes: "Subject, not a guest. Canonical includes 'Sir'; codebase mostly uses 'Bradley Wiggins'.",
  },
  {
    slug: "chris-froome",
    canonicalName: "Chris Froome",
    variations: ["Chris Froome", "Froome"],
    title: "Four-time Tour de France winner",
    affiliation: "Israel–Premier Tech",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["Grand Tour GC racing", "climbing", "Team Sky/INEOS era", "marginal gains"],
    episodes: [],
    kind: "pro-cyclist",
    notes: "Subject, not a guest. Current team unverified this pass.",
  },
  {
    slug: "marco-pantani",
    canonicalName: "Marco Pantani",
    variations: ["Marco Pantani", "Pantani", "Il Pirata", "The Pirate"],
    title: "1998 Tour de France and Giro d'Italia winner",
    affiliation: "Deceased professional cyclist (1970–2004)",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: ["Grand Tour climbing", "1990s pro cycling", "pro cycling ethics and doping", "cycling history"],
    episodes: [],
    kind: "pro-cyclist",
    notes: "Subject, not a guest. Historical figure — central to the Pantani-death episode and the Festina-affair episode. Italian nickname 'Il Pirata' / 'The Pirate'.",
  },
  {
    slug: "lance-armstrong",
    canonicalName: "Lance Armstrong",
    variations: ["Lance Armstrong", "Armstrong", "Lance"],
    title: "Former professional cyclist; stripped of seven Tour de France titles",
    affiliation: "Retired professional cyclist",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: ["Tour de France history", "pro cycling ethics and doping", "US Postal era", "cancer advocacy"],
    episodes: [],
    kind: "pro-cyclist",
    notes: "Subject, not a guest. Referenced widely in historical and doping-era episodes. Titles stripped by USADA in 2012.",
  },
  {
    slug: "tyler-hamilton",
    canonicalName: "Tyler Hamilton",
    variations: ["Tyler Hamilton", "Hamilton"],
    title: "Former professional cyclist, cycling coach and co-author of The Secret Race",
    affiliation: "Tyler Hamilton Training",
    affiliationVerified: true,
    sameAs: [
      "https://en.wikipedia.org/wiki/Tyler_Hamilton",
      "https://www.wikidata.org/wiki/Q505446",
      "https://www.tylerhamiltontraining.com/about",
      "https://www.olympedia.org/athletes/90529",
    ],
    sameAsVerified: true,
    topics: [
      "pro cycling ethics and doping",
      "US Postal era",
      "Tour de France history",
      "cycling memoirs",
      "cycling coaching",
      "power-meter training",
    ],
    episodes: [
      "ep-2152-hamiltons-untold-account-of-doping-forgiving-lance",
      "tyler-hamilton-the-evolution-of-coaching",
      "tyler-hamilton-my-tour-de-france-podium",
      "tyler-hamilton-forgiveness-and-rebirth",
    ],
    kind: "pro-cyclist",
    entityPageSlug: "tyler-hamilton",
    guestSlug: "tyler-hamilton",
    notes:
      "Four-time Roadman guest. Co-authored The Secret Race (2012), returned the 2004 Olympic time-trial medal and appears in doping, forgiveness and coaching episodes.",
  },
  {
    slug: "tom-simpson",
    canonicalName: "Tom Simpson",
    variations: ["Tom Simpson", "Simpson", "Major Tom"],
    title: "1965 World Road Race Champion; first British world cycling champion",
    affiliation: "Deceased professional cyclist (1937–1967)",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: ["cycling history", "pro cycling ethics and doping", "British cycling", "Mont Ventoux"],
    episodes: [],
    kind: "pro-cyclist",
    notes: "Subject, not a guest. Died on Mont Ventoux during the 1967 Tour de France; subject of Andy McGrath's book 'Bird on the Wire'.",
  },
  {
    slug: "francesco-conconi",
    canonicalName: "Professor Francesco Conconi",
    variations: ["Professor Francesco Conconi", "Prof Francesco Conconi", "Prof. Francesco Conconi", "Francesco Conconi", "Franchesco Conconei", "Conconi"],
    title: "Italian sports physician; emeritus professor at the University of Ferrara",
    affiliation: "University of Ferrara",
    affiliationVerified: false,
    sameAs: [],
    sameAsVerified: false,
    topics: ["sports physiology", "lactate testing history", "pro cycling ethics and doping", "1990s pro cycling"],
    episodes: [],
    kind: "scientist",
    notes: "Subject, not a guest. Inventor of the Conconi test; named in the EPO-era investigations referenced in the Pantani-death and Festina-affair episodes. Transcripts often misspell as 'Franchesco Conconei'.",
  },

  // ──────────────────────────────────────────────────────────────────────
  // Authors / journalists / industry figures (podcast guests).
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "andy-mcgrath",
    canonicalName: "Andy McGrath",
    variations: ["Andy McGrath", "McGrath"],
    title: "Cycling journalist and author; former Rouleur editor",
    affiliation: "Author of Tom Simpson: Bird on the Wire",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: ["cycling history", "pro cycling storytelling", "doping era", "rider biographies"],
    episodes: [
      "ep-15-untold-story-of-how-pogacar-became-the-greatest-rider-ever",
      "ep-2137-the-untold-story-of-frank-vandenbrouckes-life-death-andy-mcg",
    ],
    kind: "author-journalist",
    guestSlug: "andy-mcgrath",
  },
  {
    slug: "uli-schoberer",
    canonicalName: "Uli Schoberer",
    variations: ["Uli Schoberer", "Schoberer"],
    title: "Inventor of the SRM power meter",
    affiliation: "SRM",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: ["power meters", "power measurement history", "cycling technology"],
    episodes: ["ep-2101-the-genius-behind-the-first-ever-power-meter-uli-schoberer"],
    kind: "industry",
    guestSlug: "uli-schoberer",
  },
  {
    slug: "yanto-barker",
    canonicalName: "Yanto Barker",
    variations: ["Yanto Barker", "Barker"],
    title: "Former British road race champion; founder of Le Col",
    affiliation: "Le Col",
    affiliationVerified: true,
    sameAs: [],
    sameAsVerified: false,
    topics: ["cycling apparel", "pro racing", "cycling business", "kit and equipment"],
    episodes: ["ep-2157-how-the-back-of-a-team-bus-became-ground-zero-for-a-10-milli"],
    kind: "industry",
    guestSlug: "yanto-barker",
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Derived lookups + helpers
// ─────────────────────────────────────────────────────────────────────────

/** Entity keyed by slug. */
export const ENTITY_BY_SLUG: Record<string, CanonicalEntity> = Object.fromEntries(
  CANONICAL_ENTITIES.map((e) => [e.slug, e]),
);

/**
 * Lowercased variation → entity. Built once at module load. Used by
 * `findEntityByVariation` to resolve any surface form to its canonical entity.
 * If two entities ever claim the same variation, the first one wins and we
 * throw in development so the collision is caught before it ships.
 */
const VARIATION_INDEX: Map<string, CanonicalEntity> = (() => {
  const index = new Map<string, CanonicalEntity>();
  for (const entity of CANONICAL_ENTITIES) {
    const forms = new Set([entity.canonicalName, ...entity.variations]);
    for (const form of forms) {
      const key = form.trim().toLowerCase();
      const existing = index.get(key);
      if (existing && existing.slug !== entity.slug) {
        if (process.env.NODE_ENV !== "production") {
          throw new Error(
            `canonical-entities: variation "${form}" is claimed by both ` +
              `"${existing.slug}" and "${entity.slug}". Variations must be unique.`,
          );
        }
        continue;
      }
      index.set(key, entity);
    }
  }
  return index;
})();

/** Look up the canonical entity behind any known surface form (case-insensitive). */
export function findEntityByVariation(raw: string): CanonicalEntity | undefined {
  return VARIATION_INDEX.get(raw.trim().toLowerCase());
}

/**
 * Normalise any known surface form to its canonical name. Returns the input
 * unchanged if it isn't a recognised entity, so it's safe to run over prose.
 */
export function getCanonicalName(raw: string): string {
  return findEntityByVariation(raw)?.canonicalName ?? raw;
}

/** Entity by slug, or undefined. */
export function getEntityBySlug(slug: string): CanonicalEntity | undefined {
  return ENTITY_BY_SLUG[slug];
}

/** Every entity that appears in a given podcast episode (by episode slug). */
export function getEntitiesByEpisode(episodeSlug: string): CanonicalEntity[] {
  return CANONICAL_ENTITIES.filter((e) => e.episodes.includes(episodeSlug));
}

/** Entities whose `sameAs` URLs are all verified — safe to emit in schema as-is. */
export function getVerifiedEntities(): CanonicalEntity[] {
  return CANONICAL_ENTITIES.filter((e) => e.sameAsVerified);
}
