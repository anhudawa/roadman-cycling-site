/**
 * Expert × Topic page system — the programmatic AEO layer.
 *
 * Builds pages that answer the literal query format people type into
 * ChatGPT, Perplexity and Google's AI overviews: "What does {Expert}
 * say about {Topic}?" — e.g. /experts/stephen-seiler/polarised-training,
 * /experts/joe-friel/periodisation, /experts/dan-bigham/aerodynamics.
 *
 * Why this is grounded, not a doorway-page farm:
 *   - The set of pages is NOT a blind Cartesian product of every guest ×
 *     every topic. It is derived from the curated, verified
 *     `GUEST_PROFILE_OVERRIDES.relatedHubs` (which topic each expert
 *     genuinely speaks on) gated by the expert's own `keyIdeas` signal.
 *   - Each page is populated from REAL data: the expert's verified bio,
 *     their attributed `keyQuotes` from the episodes that touch the
 *     topic, the matching episodes themselves, and the citable claims
 *     (`keyIdeas`) they're known for — all filtered to the topic.
 *
 * Enrichment status (honest data-completeness signal):
 *   - "editorial"  — a hand-written, voice-matched summary exists.
 *   - "structured" — summary is a factual lead awaiting an editorial
 *     pass; the page is still real (bio + claims + quotes + episodes).
 *   `getEnrichmentQueue()` lists the "structured" pairs for the team.
 */

import { getAllEpisodes, type EpisodeMeta } from "./podcast";
import {
  getAllGuests,
  getGuestBySlug,
  slugifyGuestName,
  type GuestProfile,
} from "./guests";
import {
  getGuestProfileOverride,
  type GuestProfileOverride,
} from "./guests/profiles";
import { type ContentPillar } from "@/types";

/* ------------------------------------------------------------------ *
 * Fine-grained topics
 * ------------------------------------------------------------------ */

export interface ExpertTopic {
  /** URL segment, e.g. "polarised-training". */
  slug: string;
  /** Short display label, e.g. "Polarised Training". */
  label: string;
  /** Lower-case noun phrase for prose/metadata, e.g. "polarised training". */
  phrase: string;
  /** Parent topic hub slug — drives the internal link up to /topics/[hub]. */
  parentHub: string;
  pillar: ContentPillar;
  /** One-sentence framing of the topic. */
  blurb: string;
  /**
   * Matched (case-insensitively) against episode title/description/keywords
   * AND against the expert's signal text (keyIdeas + whyMatters) to decide
   * which episodes/quotes/claims attach to the page, and whether an expert
   * is assigned this topic at all.
   */
  match: RegExp;
  /** Search-intent synonyms surfaced in metadata keywords. */
  aliases: string[];
}

/**
 * The fine-topic catalogue. Each topic rolls up to one of the ten
 * `/topics/[hub]` pages so every expert-topic page links back into the
 * topic cluster. Keep `match` broad enough to catch real episodes but
 * specific enough that two topics under the same hub don't collapse
 * into identical content.
 */
export const EXPERT_TOPICS: ExpertTopic[] = [
  // ---- FTP / power (hub: ftp-training) ----
  {
    slug: "ftp",
    label: "FTP",
    phrase: "FTP and threshold power",
    parentHub: "ftp-training",
    pillar: "coaching",
    blurb:
      "Functional Threshold Power — what it is, how to test it, and how to raise it.",
    match: /\bftp\b|functional threshold|threshold power|20.?min(ute)? test/i,
    aliases: ["ftp", "functional threshold power", "ftp test", "improve ftp"],
  },
  {
    slug: "threshold-training",
    label: "Threshold Training",
    phrase: "threshold training",
    parentHub: "ftp-training",
    pillar: "coaching",
    blurb:
      "Training at and around lactate threshold — the dose that drives the biggest gains in trained riders.",
    match: /threshold|lactate|tempo|sweet.?spot|double.?threshold/i,
    aliases: ["threshold training", "lactate threshold", "double threshold"],
  },
  {
    slug: "vo2-max",
    label: "VO2 Max",
    phrase: "VO2 max work",
    parentHub: "ftp-training",
    pillar: "coaching",
    blurb:
      "VO2 max intervals — the high end of the engine and how to build it without burning out.",
    match: /vo2|v\.?o2\.?max|maximal aerobic|3.?5 ?min(ute)? intervals?/i,
    aliases: ["vo2 max", "vo2max intervals", "aerobic power"],
  },
  {
    slug: "aerodynamics",
    label: "Aerodynamics",
    phrase: "aerodynamics",
    parentHub: "ftp-training",
    pillar: "coaching",
    blurb:
      "Free speed from position and equipment — the watts most amateurs leave on the table.",
    match: /aero|aerodynam|wind.?tunnel|drag|position|skinsuit|cda/i,
    aliases: ["cycling aerodynamics", "aero position", "marginal gains"],
  },
  {
    slug: "time-trialling",
    label: "Time Trialling",
    phrase: "time trialling",
    parentHub: "ftp-training",
    pillar: "coaching",
    blurb:
      "Pacing, position and preparation for the race of truth — and the Hour Record.",
    match: /time.?trial|\btt\b|hour record|pacing|even.?pace|race of truth/i,
    aliases: ["time trial", "tt pacing", "hour record"],
  },

  // ---- Training structure (hub: cycling-training-plans) ----
  {
    slug: "polarised-training",
    label: "Polarised Training",
    phrase: "polarised training",
    parentHub: "cycling-training-plans",
    pillar: "coaching",
    blurb:
      "The 80/20 intensity split measured across elite endurance sport.",
    match: /polaris|80.?20|80\/20|intensity distribution|grey zone|easy days/i,
    aliases: ["polarised training", "80/20 training", "intensity distribution"],
  },
  {
    slug: "zone-2",
    label: "Zone 2",
    phrase: "Zone 2 training",
    parentHub: "cycling-training-plans",
    pillar: "coaching",
    blurb:
      "Low-intensity aerobic riding — the foundation everything else is built on.",
    match: /zone ?2|z2|low.?intensity|aerobic base|easy ride|fat.?max|fatmax/i,
    aliases: ["zone 2 training", "z2 cycling", "aerobic base"],
  },
  {
    slug: "periodisation",
    label: "Periodisation",
    phrase: "periodisation",
    parentHub: "cycling-training-plans",
    pillar: "coaching",
    blurb:
      "Structuring the season into base, build, peak and recovery so fitness arrives on the right day.",
    match: /periodis|base.?build|macro.?cycle|meso.?cycle|season(al)? plan|annual plan|block training/i,
    aliases: ["periodisation", "training periodisation", "season planning"],
  },
  {
    slug: "base-training",
    label: "Base Training",
    phrase: "base training",
    parentHub: "cycling-training-plans",
    pillar: "coaching",
    blurb:
      "Building the aerobic foundation in the early season — volume before intensity.",
    match: /base (training|phase|mile)|aerobic base|build(ing)? the base|long slow/i,
    aliases: ["base training", "winter base", "aerobic foundation"],
  },
  {
    slug: "winter-training",
    label: "Winter Training",
    phrase: "winter training",
    parentHub: "cycling-training-plans",
    pillar: "coaching",
    blurb:
      "What to do in the off-season so you arrive in spring fitter, not just fresher.",
    match: /winter|off.?season|indoor|turbo|trainer|december|january|february/i,
    aliases: ["winter training", "off-season cycling", "indoor training"],
  },
  {
    slug: "intervals",
    label: "Interval Training",
    phrase: "interval training",
    parentHub: "cycling-training-plans",
    pillar: "coaching",
    blurb:
      "How and when to use structured intervals — and when they just dig a hole.",
    match: /interval|hard session|workout structure|on.?off|micro.?burst/i,
    aliases: ["interval training", "cycling intervals", "structured workouts"],
  },
  {
    slug: "ultra-endurance",
    label: "Ultra-Endurance",
    phrase: "ultra-endurance riding",
    parentHub: "cycling-training-plans",
    pillar: "community",
    blurb:
      "Training and fuelling for the very long stuff — bikepacking, FKTs and multi-day efforts.",
    match: /ultra|bikepack|all.?day|multi.?day|fkt|everest|transcontinental|unbound|gravel race|24.?hour/i,
    aliases: ["ultra-endurance cycling", "bikepacking", "ultra cycling"],
  },
  {
    slug: "sprinting",
    label: "Sprinting",
    phrase: "sprinting",
    parentHub: "cycling-training-plans",
    pillar: "coaching",
    blurb:
      "The leadout, the positioning and the power that decides a bunch finish.",
    match: /sprint|lead.?out|bunch (finish|kick)|kick|fast finish|positioning/i,
    aliases: ["cycling sprint training", "leadout", "sprint power"],
  },

  // ---- Coaching (hub: cycling-coaching) ----
  {
    slug: "coaching",
    label: "Coaching",
    phrase: "coaching",
    parentHub: "cycling-coaching",
    pillar: "coaching",
    blurb:
      "What a good coach actually changes — and why most riders plateau without one.",
    match: /coach|coaching|prescrib|programme|program|methodology|guided|mentor/i,
    aliases: ["cycling coaching", "is a coach worth it", "online coaching"],
  },
  {
    slug: "self-coaching",
    label: "Self-Coaching",
    phrase: "self-coaching",
    parentHub: "cycling-coaching",
    pillar: "coaching",
    blurb:
      "How to coach yourself without making the mistakes that stall most amateurs.",
    match: /self.?coach|on your own|without a coach|diy|self.?taught/i,
    aliases: ["self-coached cyclist", "coaching yourself"],
  },

  // ---- Nutrition (hub: cycling-nutrition) ----
  {
    slug: "in-ride-fuelling",
    label: "In-Ride Fuelling",
    phrase: "in-ride fuelling",
    parentHub: "cycling-nutrition",
    pillar: "nutrition",
    blurb:
      "Carbs per hour, gels, drink mix and the gut training that makes 90g/hr possible.",
    match: /fuel|gel|carb.?per.?hour|g\/?hr|grams? of carb|on.?bike nutrition|drink mix|bonk/i,
    aliases: ["in-ride fuelling", "carbs per hour", "cycling gels"],
  },
  {
    slug: "carb-periodisation",
    label: "Carb Periodisation",
    phrase: "carbohydrate periodisation",
    parentHub: "cycling-nutrition",
    pillar: "nutrition",
    blurb:
      "Matching carbohydrate intake to the training day — fuel for the work required.",
    match: /carb.?periodis|fuel for the work|train.?low|periodised nutrition|energy availability|right.?carb/i,
    aliases: [
      "carb periodisation",
      "fuel for the work required",
      "train low",
    ],
  },
  {
    slug: "gut-health",
    label: "Gut Health",
    phrase: "gut health",
    parentHub: "cycling-nutrition",
    pillar: "nutrition",
    blurb:
      "The microbiome, fibre diversity and how the gut shapes recovery and performance.",
    match: /gut|microbiom|fibre|fiber|fermented|plants? (a|per) week|gi distress|digest/i,
    aliases: ["gut health cycling", "microbiome", "athlete gut"],
  },
  {
    slug: "protein",
    label: "Protein",
    phrase: "protein for cyclists",
    parentHub: "cycling-nutrition",
    pillar: "nutrition",
    blurb:
      "How much protein, when, and why it matters more as you age.",
    match: /protein|leucine|amino|recovery shake|1\.?6|2\.?2 ?g\/kg/i,
    aliases: ["cycling protein", "protein for cyclists", "protein timing"],
  },
  {
    slug: "hydration",
    label: "Hydration",
    phrase: "hydration",
    parentHub: "cycling-nutrition",
    pillar: "nutrition",
    blurb:
      "Sodium, sweat rate and getting fluids right without overthinking it.",
    match: /hydrat|electrolyte|sodium|sweat|drink(ing)?|fluid/i,
    aliases: ["cycling hydration", "electrolytes", "sodium intake"],
  },

  // ---- Weight / body comp (hub: cycling-weight-loss) ----
  {
    slug: "race-weight",
    label: "Race Weight",
    phrase: "race weight",
    parentHub: "cycling-weight-loss",
    pillar: "nutrition",
    blurb:
      "Getting lean without losing power — and why under-fuelling backfires.",
    match: /race weight|lose weight|leaner?|body comp|power.?to.?weight|w\/kg|kilo|under.?eat/i,
    aliases: ["cycling race weight", "lose weight cycling", "power to weight"],
  },
  {
    slug: "body-composition",
    label: "Body Composition",
    phrase: "body composition",
    parentHub: "cycling-weight-loss",
    pillar: "nutrition",
    blurb:
      "Changing the engine-to-frame ratio the right way, in the right phase.",
    match: /body comp|composition|body fat|lean mass|recomp/i,
    aliases: ["cycling body composition", "body recomposition"],
  },

  // ---- Strength (hub: cycling-strength-conditioning) ----
  {
    slug: "strength-training",
    label: "Strength Training",
    phrase: "strength training for cyclists",
    parentHub: "cycling-strength-conditioning",
    pillar: "strength",
    blurb:
      "What lifts, what loads, and how to fit the gym around the bike.",
    match: /strength|gym|lift|s&c|squat|deadlift|resistance|heavy/i,
    aliases: [
      "strength training for cyclists",
      "gym for cyclists",
      "cycling s&c",
    ],
  },
  {
    slug: "strength-after-40",
    label: "Strength After 40",
    phrase: "strength training after 40",
    parentHub: "cycling-strength-conditioning",
    pillar: "strength",
    blurb:
      "Protecting fast-twitch fibre and power as a masters rider — the case for heavy lifting.",
    match: /after 40|over 40|over 50|masters|fast.?twitch|type ii|veteran|age(ing|d)|older/i,
    aliases: [
      "strength training over 40",
      "masters cyclist strength",
      "fast-twitch fibre",
    ],
  },
  {
    slug: "bike-fit",
    label: "Bike Fit",
    phrase: "bike fit",
    parentHub: "cycling-strength-conditioning",
    pillar: "strength",
    blurb:
      "Fit as a performance variable — comfort, power and staying injury-free.",
    match: /bike fit|fitting|saddle|cleat|position|knee pain|foot|posture/i,
    aliases: ["bike fit", "cycling position", "bike fit injury"],
  },

  // ---- Recovery (hub: cycling-recovery) ----
  {
    slug: "recovery",
    label: "Recovery",
    phrase: "recovery",
    parentHub: "cycling-recovery",
    pillar: "recovery",
    blurb:
      "Where adaptation actually happens — and the recovery levers that matter.",
    match: /recov|adaptation|rest day|easy week|deload|absorb (the )?training/i,
    aliases: ["cycling recovery", "recovery for cyclists"],
  },
  {
    slug: "sleep",
    label: "Sleep",
    phrase: "sleep",
    parentHub: "cycling-recovery",
    pillar: "recovery",
    blurb:
      "The single biggest recovery tool — and the one most riders neglect.",
    match: /sleep|circadian|nap|bedtime|rest(ing)?|night/i,
    aliases: ["sleep cycling performance", "sleep recovery"],
  },
  {
    slug: "overtraining",
    label: "Overtraining",
    phrase: "overtraining and fatigue",
    parentHub: "cycling-recovery",
    pillar: "recovery",
    blurb:
      "Spotting the line between productive fatigue and digging a hole.",
    match: /overtrain|over.?reach|burnout|fatigue|monotony|staleness|hrv|too much/i,
    aliases: ["overtraining cycling", "overreaching", "training fatigue"],
  },
  {
    slug: "mental-toughness",
    label: "Mental Performance",
    phrase: "the mental side of cycling",
    parentHub: "cycling-recovery",
    pillar: "recovery",
    blurb:
      "Mindset, pressure and the psychology that holds up when the legs hurt.",
    match: /mental|mindset|psycholog|pressure|focus|confidence|motivation|head/i,
    aliases: ["cycling mental toughness", "sport psychology", "mindset"],
  },

  // ---- Triathlon (hub: triathlon-cycling) ----
  {
    slug: "triathlon-bike",
    label: "The Triathlon Bike Leg",
    phrase: "the triathlon bike leg",
    parentHub: "triathlon-cycling",
    pillar: "coaching",
    blurb:
      "Pacing the bike for the run that follows — where most age-groupers get it wrong.",
    match: /triath|ironman|70\.?3|brick|bike leg|age.?group|swim.?bike|bike.?run/i,
    aliases: ["triathlon bike leg", "ironman bike pacing", "triathlon cycling"],
  },

  // ---- Tier-1 cross-cutting topics ----
  {
    slug: "reverse-periodisation",
    label: "Reverse Periodisation",
    phrase: "reverse periodisation",
    parentHub: "cycling-training-plans",
    pillar: "coaching",
    blurb:
      "Flipping the traditional model — building intensity early and volume later, and when it actually fits.",
    match:
      /reverse.?periodis|reverse.?taper|intensity.?first|build.?to.?base|hiit.?first|inverted (model|periodis)/i,
    aliases: [
      "reverse periodisation",
      "reverse periodization cycling",
      "intensity-first training",
    ],
  },
  {
    slug: "masters-training",
    label: "Masters Training",
    phrase: "training as a masters cyclist",
    parentHub: "cycling-training-plans",
    pillar: "coaching",
    blurb:
      "How the plan has to change after 40 — fewer, sharper sessions and recovery built in from day one.",
    match:
      /masters (training|athlete|cyclist|rider|racing)|training (after|over|past) (40|50|fifty|forty)|faster after (40|50)|fast after (50|fifty)|veteran (rider|cyclist)|getting faster after/i,
    aliases: [
      "masters cycling training",
      "training over 40",
      "cycling training after 50",
    ],
  },
  {
    slug: "cycling-longevity",
    label: "Cycling Longevity",
    phrase: "longevity in cycling",
    parentHub: "cycling-recovery",
    pillar: "recovery",
    blurb:
      "Riding strong for decades — protecting muscle, power and health span well past your supposed peak.",
    match:
      /longevity|healthspan|lifespan|riding (into|past) (your )?(60|70|sixties|seventies)|cycling for life|stay(ing)? (healthy|strong)|protect(ing)? muscle|sarcopenia/i,
    aliases: [
      "cycling longevity",
      "cycling into your 60s",
      "healthy ageing cyclist",
    ],
  },
  {
    slug: "testosterone",
    label: "Testosterone & Hormones",
    phrase: "testosterone and hormones after 40",
    parentHub: "cycling-recovery",
    pillar: "recovery",
    blurb:
      "What happens to testosterone, DHEA and cortisol as a male endurance athlete ages — and what's worth measuring.",
    match:
      /testosteron|\bfree t\b|\blow t\b|\bdhea\b|androgen|cortisol|hormon(e|al)|endocrin|\bhrt\b|trt\b/i,
    aliases: [
      "testosterone and cycling",
      "testosterone after 40",
      "free testosterone",
      "DHEA endurance athlete",
      "hormones masters cyclist",
    ],
  },
  {
    slug: "menopause",
    label: "Menopause & Cycling",
    phrase: "training through menopause",
    parentHub: "cycling-recovery",
    pillar: "recovery",
    blurb:
      "Training, fuelling and protecting muscle and bone through perimenopause and menopause — the most under-served question in the sport.",
    match:
      /menopaus|peri.?menopaus|oestrogen|estrogen|\bhrt\b|hot flush|night sweats|women'?s hormones|hormone replacement|female (athlete|hormone)|menstrual/i,
    aliases: [
      "menopause and cycling",
      "perimenopause cycling",
      "training through menopause",
      "menopause cyclist",
      "women's cycling hormones",
    ],
  },
];

const EXPERT_TOPIC_BY_SLUG: Map<string, ExpertTopic> = new Map(
  EXPERT_TOPICS.map((t) => [t.slug, t]),
);

export function getExpertTopic(slug: string): ExpertTopic | undefined {
  return EXPERT_TOPIC_BY_SLUG.get(slug);
}

/**
 * Representative fine-topic for each hub — guarantees that every
 * `relatedHub` an expert carries produces at least one page even when
 * keyword gating finds no more specific match.
 */
const HUB_ANCHOR_TOPIC: Record<string, string> = {
  "ftp-training": "ftp",
  "cycling-training-plans": "periodisation",
  "cycling-coaching": "coaching",
  "cycling-nutrition": "in-ride-fuelling",
  "cycling-weight-loss": "race-weight",
  "cycling-strength-conditioning": "strength-training",
  "cycling-recovery": "recovery",
  "triathlon-cycling": "triathlon-bike",
};

/** Human titles for the ten topic hubs (for related-topic link rendering). */
export const TOPIC_HUB_TITLES: Record<string, string> = {
  "ftp-training": "FTP Training",
  "cycling-nutrition": "Cycling Nutrition",
  "cycling-training-plans": "Training Plans",
  "cycling-recovery": "Recovery",
  "cycling-strength-conditioning": "Strength & Conditioning",
  "cycling-weight-loss": "Cycling & Weight Loss",
  "cycling-beginners": "Getting Into Cycling",
  "triathlon-cycling": "Triathlon Cycling",
  "mountain-biking": "Mountain Biking",
  "cycling-coaching": "Cycling Coaching",
};

const PILLAR_TO_HUB: Record<ContentPillar, string> = {
  coaching: "cycling-coaching",
  nutrition: "cycling-nutrition",
  strength: "cycling-strength-conditioning",
  recovery: "cycling-recovery",
  community: "cycling-training-plans",
};

/* ------------------------------------------------------------------ *
 * Expert → topic assignment
 * ------------------------------------------------------------------ */

/**
 * Explicit per-expert topic lists. Use this to force a precise set when
 * the auto-derivation under-/over-shoots for a flagship expert. Keys are
 * guest slugs; values are fine-topic slugs. Auto-derivation is used for
 * any expert not listed here.
 */
const EXPERT_TOPIC_OVERRIDES: Record<string, string[]> = {
  "stephen-seiler": [
    "polarised-training",
    "zone-2",
    "threshold-training",
    "ftp",
    "vo2-max",
    "reverse-periodisation",
  ],
  "joe-friel": [
    "periodisation",
    "base-training",
    "strength-after-40",
    "ftp",
    "vo2-max",
    "reverse-periodisation",
    "masters-training",
    "cycling-longevity",
  ],
  "dan-bigham": ["aerodynamics", "time-trialling", "ftp"],
  "alex-dowsett": ["time-trialling", "aerodynamics", "ftp"],
  "andy-galpin": [
    "strength-after-40",
    "strength-training",
    "recovery",
    "masters-training",
    "cycling-longevity",
  ],
  "david-dunne": ["carb-periodisation", "in-ride-fuelling", "race-weight"],
  "alan-murchison": ["in-ride-fuelling", "race-weight", "gut-health"],
  "tim-spector": ["gut-health", "body-composition", "cycling-longevity"],
  "dan-lorang": [
    "periodisation",
    "threshold-training",
    "triathlon-bike",
    "reverse-periodisation",
    "zone-2",
    "vo2-max",
  ],
  "olav-bu": ["threshold-training", "triathlon-bike", "ftp", "vo2-max"],
  "john-wakefield": [
    "zone-2",
    "coaching",
    "threshold-training",
    "reverse-periodisation",
    "ftp",
  ],
  "lachlan-morton": ["ultra-endurance", "zone-2"],
  "derek-teel": ["strength-training", "strength-after-40", "masters-training"],
  "alistair-brownlee": ["triathlon-bike", "base-training"],
  "andre-greipel": ["sprinting", "coaching"],
  "michael-matthews": ["sprinting", "ftp"],
  "dr-david-lipman": [
    "masters-training",
    "cycling-longevity",
    "strength-after-40",
    "vo2-max",
  ],
  "mark-sisson": ["cycling-longevity", "zone-2", "body-composition"],
  "vasilis-anastopoulos": [
    "coaching",
    "periodisation",
    "threshold-training",
    "reverse-periodisation",
    "ftp",
  ],
  "matt-bottrill": [
    "ftp",
    "aerodynamics",
    "time-trialling",
    "periodisation",
    "reverse-periodisation",
  ],
  // Hormone/health specialist — anchors the otherwise-unclaimed masters
  // testosterone query, plus the recovery/sleep ground he covers on ep 2451.
  "dr-mark-gordon": ["testosterone", "recovery", "sleep"],
  // Women's-hormone and metabolic-health voice — first mover on the
  // completely unclaimed menopause-and-cycling query.
  "cynthia-thurlow": ["menopause", "race-weight", "gut-health"],
};

function signalText(
  guest: GuestProfile,
  override: GuestProfileOverride | undefined,
): string {
  return [
    guest.name,
    guest.credential ?? "",
    ...(override?.keyIdeas ?? []),
    override?.whyMatters ?? "",
    override?.description ?? "",
    ...guest.tags,
    ...guest.episodes.map((e) => `${e.title} ${e.description}`),
  ]
    .join(" \n ")
    .toLowerCase();
}

function resolvedHubs(
  guest: GuestProfile,
  override: GuestProfileOverride | undefined,
): string[] {
  const fromOverride = (override?.relatedHubs ?? []).filter(
    (h) => h in HUB_ANCHOR_TOPIC,
  );
  if (fromOverride.length > 0) return Array.from(new Set(fromOverride));
  // Fall back to the guest's pillars mapped to hubs.
  return Array.from(new Set(guest.pillars.map((p) => PILLAR_TO_HUB[p])));
}

/**
 * The ordered fine-topic slugs for an expert. Either the explicit
 * override list, or derived: for each related hub, the topics under it
 * whose `match` fires against the expert's signal text, guaranteeing the
 * hub anchor when nothing else matches. Capped to keep each expert's
 * footprint focused.
 */
export function getTopicSlugsForExpert(expertSlug: string): string[] {
  const guest = getGuestBySlug(expertSlug);
  if (!guest) return [];

  const override = getGuestProfileOverride(expertSlug);

  if (EXPERT_TOPIC_OVERRIDES[expertSlug]) {
    return EXPERT_TOPIC_OVERRIDES[expertSlug].filter((s) =>
      EXPERT_TOPIC_BY_SLUG.has(s),
    );
  }

  const hubs = resolvedHubs(guest, override);
  const text = signalText(guest, override);
  const selected: string[] = [];

  for (const hub of hubs) {
    const topicsUnderHub = EXPERT_TOPICS.filter((t) => t.parentHub === hub);
    const matched = topicsUnderHub.filter((t) => t.match.test(text));
    if (matched.length > 0) {
      for (const t of matched) selected.push(t.slug);
    } else if (HUB_ANCHOR_TOPIC[hub]) {
      selected.push(HUB_ANCHOR_TOPIC[hub]);
    }
  }

  return Array.from(new Set(selected)).slice(0, 6);
}

/* ------------------------------------------------------------------ *
 * Curated editorial summaries (Anthony's voice)
 * ------------------------------------------------------------------ *
 * Keyed by `${expertSlug}/${topicSlug}`. 100–200 words, written to the
 * Roadman voice guide. Pairs without an entry render a structured
 * factual lead and are flagged "structured" for an editorial pass.
 */
const CURATED_EDITORIAL: Record<string, string> = {
  "stephen-seiler/polarised-training":
    "Here's what most amateurs get wrong about polarised training: it isn't a trend, it's what Seiler measured. When he studied elite cyclists, rowers, runners and cross-country skiers — groups who weren't talking to each other — they'd all landed on the same split. Roughly 80% of the work properly easy, 20% properly hard, almost nothing in the middle. On the podcast he's blunt about why that middle ground costs you: the grey zone feels like training, but it mostly just burns matches. It accumulates fatigue faster than it drives adaptation. The fix isn't more suffering. It's the discipline to ride your easy days easy enough that your hard days actually count. That's the whole thing. Get the distribution right and the gains look after themselves.",
  "stephen-seiler/zone-2":
    "Ask Seiler what Zone 2 is for and he won't give you a heart-rate number first — he'll talk about restraint. The single biggest mistake he sees amateurs make is riding their easy days too hard, which quietly wrecks the quality of the hard days. Genuine Zone 2 is conversational: you can talk in full sentences, grab a coffee mid-ride, and finish feeling like you could do it again tomorrow. He's also clear that power alone misses it — heart rate, RPE and a sub-2 mmol/L lactate all tell you more about whether today's easy is actually easy, because heat, sleep and stress move the number around. Build the aerobic base patiently and everything stacked on top of it works better.",
  "stephen-seiler/threshold-training":
    "Seiler's whole point about threshold is that the middle is seductive and expensive. Sustained moderate-hard work — the grey zone — feels productive because it hurts, but in trained riders it piles up fatigue faster than it drives adaptation. His model isn't anti-intensity; it's about making the hard work really hard and rare enough that you can recover from it. Do your 20% with real intent, keep the 80% honestly easy, and the threshold sessions land. Try to live at threshold and you get the worst of both worlds: too hard to recover from, not hard enough to force the top-end adaptation.",
  "stephen-seiler/ftp":
    "Seiler doesn't treat FTP as the headline number — he treats it as a boundary marker. In the polarised model the point of knowing your threshold is knowing what to stay below on the easy days and what to push above on the hard ones, not parking your week at it. On the podcast he's consistent that riders who chase FTP head-on, session after session, tend to settle into the grey zone that costs the most — too hard to recover from, too easy to force adaptation. Get the 80/20 distribution right and the number climbs as a by-product: threshold is an output of a well-run aerobic base plus genuine intensity, not a target you assault directly. He's relaxed about how you measure it, as long as you measure it the same way each time and read the trend rather than the noise.",
  "stephen-seiler/vo2-max":
    "Seiler's 20% is where VO2 max lives. The hard end of the polarised model isn't padding — it's the deliberate dose of legitimately high-intensity work that lifts the ceiling easy riding can't touch. He's clear it only works because the other 80% is honestly easy: bolt VO2 sessions onto a week of grey-zone riding and you arrive already half-cooked, unable to hit the intensity that drives the adaptation. The efforts themselves are the familiar ones — several minutes hard, full recovery, repeated with intent rather than ground out. And he frames it as quality over quantity: a small number of VO2 sessions you can complete at full gas beats a pile of half-efforts. Build the base so the top end has somewhere to sit, then train the top end like it matters.",
  "joe-friel/periodisation":
    "Friel wrote the book a generation of amateurs learned periodisation from — literally, The Cyclist's Training Bible. His framework is the one most coaching software still leans on: split the year into base, build, peak, race and transition, and give each phase a different physiological job. The base is for volume and durability, the build is for race-specific sharpness, the peak is for arriving fresh on the right day. His other rule is one most riders ignore — train your weakness in the off-season, race your strength in-season. Fix your limiters when it doesn't cost you results, then sharpen what already works when it does. Structure the year and you stop training hard for no particular reason.",
  "joe-friel/base-training":
    "Base is the phase Friel built his whole framework around, and his case for it is patience. The long aerobic foundation isn't the boring bit you survive before the real training — it's where durability is made, the depth that lets the build phase actually take. He's wary of riders who skip straight to intervals because progress feels faster there; those gains come quicker and leave quicker too, because there's nothing underneath them. His off-season rule pairs with it — use the base months to work your limiters, when fixing a weakness costs you nothing in results, then sharpen your strengths once the season starts. Build the aerobic engine first, train the weakness while it's cheap, and the sharp work later in the year has a foundation to stand on rather than a hole to dig.",
  "joe-friel/strength-after-40":
    "Friel's been one of the steadiest voices on what changes after 50, and he doesn't dress it up: the priorities shift. More strength work, slightly fewer high-intensity sessions, and longer recovery between the hard days. The engine doesn't have to fade the way most riders assume, but the recovery window gets longer and the body punishes you faster for ignoring it. His advice is to protect the gym work, cap the weekly intensity, and judge progress over a season rather than a single test. Getting older isn't the end of getting faster — it just means training smarter than you did at 30.",
  "dan-bigham/aerodynamics":
    "Bigham is the engineer who held the Hour Record, so when he talks aerodynamics he's talking from the wind tunnel and the saddle at once. His first rule will annoy the kit-buyers: fit comes before kit. Hit your achievable position before you spend a penny on aero gear. Then the maths gets brutal — he reckons most amateurs are leaving 20 to 40 watts on the table at the exact same FTP, purely because their position fights them. He treats it like engineering: measure, hypothesise, test, iterate. The Hour Record is the cleanest aero test there is — no tactics, no draft, just position and equipment for sixty minutes. For everyone else, the lesson is that free speed is sitting in your position long before it's in your wallet.",
  "alex-dowsett/time-trialling":
    "Dowsett built an entire World Tour career on the discipline most riders skip — the race of truth. He held the Hour Record in 2015, and he's clear that pacing it is a skill most amateurs can't replicate: the brain wants to surge, the body needs flat power for the full effort. His other recurring point is where amateurs blow it — the first five kilometres. Going out too hard from a standing start wrecks the whole ride before the engine's even settled. And like Bigham, he'll tell you aerodynamics is the cheapest speed amateurs ignore: position and a skinsuit beat power upgrades on flat or rolling terrain for almost everyone. Time trialling rewards the most prepared rider on the line, not the most gifted.",
  "dan-bigham/time-trialling":
    "Bigham approaches the time trial like the engineering problem it is: even pace at the highest sustainable wattage, adjusted for wind and gradient, in a position you can actually hold for the duration. His Hour Record came from treating every variable as testable rather than guessing. For amateurs his message is unglamorous but freeing — you don't need a bigger engine to go faster against the clock, you need a position that doesn't cost you watts and a pacing plan you don't abandon in the first kilometre.",
  "andy-galpin/strength-after-40":
    "Galpin is the muscle physiologist most masters cyclists have been quoting without realising it. His central point is that the order things decline matters: power fades faster than maximal strength, and strength fades faster than muscle mass — so the nervous system is the first thing to age in an athlete. Type II fast-twitch fibres can shrink 10 to 40% in older adults while the type I endurance fibres are relatively spared, which is exactly why endurance riding alone protects the wrong half of the system. His fix is heavy, fast lifting — velocity matters as much as load — plus enough protein to clear the leucine threshold older muscle needs. Keep lifting, lift with intent, and you defend the part of the engine the bike can't.",
  "andy-galpin/strength-training":
    "Galpin's lab work reframed strength training for endurance athletes: it isn't about getting big, it's about defending power and durability. Moving a moderate weight fast does more for an ageing nervous system than grinding a heavy weight slowly, because power is the quality you lose first. He pairs that with the recovery side — sleep, stress regulation and the gap between hard sessions are what turn the work into adaptation rather than accumulated fatigue. For cyclists the takeaway is simple: a couple of focused, intent-driven gym sessions a week protect the top end that endurance riding quietly lets slide.",
  "david-dunne/carb-periodisation":
    "Dunne is the nutritionist behind Hexis, and his big idea is the one that finally kills the low-carb-versus-high-carb argument: it's not low-carb, it's right-carb. Carbohydrate periodisation means matching what you eat to what the day demands — big fuel for the big sessions, less on the easy days. He's clear that fuelling around training matters more than hitting a daily macro total, because the timing is what changes the adaptation. And he frames the whole thing as a behaviour problem as much as a physiology one: a perfect plan that doesn't get used loses to a good plan that does. Match the fuel to the work and you stop swinging between under-fuelled and overfed.",
  "alan-murchison/in-ride-fuelling":
    "Murchison left a Michelin star to feed Olympic cyclists, so he comes at fuelling from both ends — it has to work physiologically and it has to be something you'll actually eat. His non-negotiable on race day: rehearse it in training. The day of an event is the worst possible time to find out a gel doesn't agree with your gut. He's matter-of-fact that landing 90 grams of carbohydrate an hour takes practice, not just willpower, and that the gut is trainable like anything else. The pros aren't surviving on engineering alone — most of what they eat is real food, dialled in over months. Practise the fuelling like you practise the intervals and the bonk stops being a surprise.",
  "tim-spector/gut-health":
    "Spector is one of the most-cited nutrition researchers alive, and his work reframes food for cyclists away from macros and toward the gut. His headline number is the one worth remembering: aim for 30-plus different plants a week. That diversity feeds the microbiome that underpins recovery, immune function and how well you handle hard training. He's also blunt that population-level advice misses you specifically — identical foods produce wildly different responses between individuals, which is why continuous glucose monitoring keeps exposing how badly amateurs mistime their carbs. And ultra-processed food drives the damage regardless of the calorie count. Eat for the gut, not just the power file, and the recovery follows.",
  "dan-lorang/periodisation":
    "Lorang has coached Ironman world champions and Grand Tour stage winners with the same underlying principles, which tells you something — the framework travels. His emphasis is long-term: the best athletes are the ones who improve year on year for a decade, not the ones who nail one block. He manages training load by listening to the athlete daily rather than forcing a plan through the body's signals, and he treats strength work as non-negotiable for anyone over 30 because durability is what prevents the late-season collapse. Build the season as a long arc, adjust to the human in front of you, and the peaks take care of themselves.",
  "lachlan-morton/ultra-endurance":
    "Morton has done what most riders think you have to choose between — raced the Tour, set the Great Divide bikepacking record, won Unbound — all on the same engine. His point is that ultra volume and World Tour fitness aren't in conflict; periodised right, they reinforce each other. Pacing ultra is closer to Zone 2 discipline than threshold work, and the riders who blow up are the ones who race the first half. He's also clear that the mental durability for multi-day efforts is built by actually spending time alone on the bike, not by a clever plan. And for the long stuff, the right tyres, lights and bag setup matter more to your finish than chasing five watts of aero. Ride within yourself for longer than feels normal and the distance stops being the enemy.",
  "olav-bu/threshold-training":
    "Bu is the scientist behind the Norwegian Method, and his message on threshold comes with a warning label: dosed correctly it's the single highest-leverage thing a trained athlete can do — but dosing it correctly is the hard part. That's why his programme is built on lactate testing. Two riders at the same FTP can need completely different threshold prescriptions, so generic zones leave gains on the table. He's also clear the method only works if recovery, fuelling and sleep are managed at the same level as the training. Test, individualise, repeat — and treat the threshold session as a precise dose, not a weekly beating.",
  "john-wakefield/zone-2":
    "Wakefield runs a lab-to-bike performance setup in Girona, and his recurring frustration is the one that costs amateurs the most: their power-derived Zone 2 is usually set too high. Metabolic testing keeps revealing zone errors that FTP-percentage maths can't see, and the result is riders grinding their easy days at a pace that quietly compromises everything else. His tell-tale sign of an aerobic-base deficit is second-half fade on rides over two hours — something a 20-minute test will never show you. Get the bottom end tested and honest, and the rest of the week starts working the way it's supposed to.",
  "joe-friel/ftp":
    "Friel's view on FTP is the pragmatist's one: it's a useful anchor for setting zones, not a number to obsess over week to week. He's comfortable with heart rate as the accessible intensity tool for most amateurs, pairing it with power for the riders who have both. The deeper point from his periodisation work is that FTP is an output of a well-structured year, not a target you chase in isolation — build the base, do the right work in the right phase, and the number moves. Test it the same way every time so you're tracking a trend rather than chasing noise.",
  "alistair-brownlee/triathlon-bike":
    "Brownlee won back-to-back Olympic triathlon golds on a training philosophy that wasn't fashionable — huge aerobic volume first, brutal threshold work layered on top. His point for age-groupers is that the bike leg is paced for the run that follows, not ridden as a standalone time trial. Most people race the first half of the bike and pay for it in the marathon. He's also clear that cycling fitness builds the run, but only if the run still gets its own specific work — neither discipline substitutes for the other. Ride the bike leg with the finish in mind and you run off it instead of surviving it.",
  "andre-greipel/sprinting":
    "Greipel won eleven Tour de France stages, and he'll tell you sprinting is captaincy, not just a kick. The leadout train, the protection in the bunch, the positioning in the last five kilometres — that's where the sprint is won, long before the last 200 metres. He's blunt that amateur sprinters over-index on raw watts and skip the positioning work that actually decides finishes. The other thing he talks about that most won't: surviving the mountain stages is the unsexy skill that keeps a sprinter's season alive. Speed without resilience doesn't win bunch kicks three weeks deep.",
  "derek-teel/strength-training":
    "Teel built Dialed Health around one idea most cyclists resist: the gym makes you a better rider, not a bulkier one. His programming is cycling-specific — movements that protect the hips, knees and back that take a beating in the saddle, loaded enough to actually drive adaptation. He's practical about fitting it around riding rather than treating it as a competing sport, because the riders who quit strength work are usually the ones who made it too complicated. Build durable, capable strength off the bike and you hold your position longer, resist injury and put more of your training into the pedals.",
  "joe-friel/reverse-periodisation":
    "Friel's classic model runs base-to-build — long aerobic miles first, race intensity layered on as the event nears. Reverse periodisation flips that, and he's clear it isn't heresy, it's a tool for a specific problem: the time-crunched rider, or the one whose target races sit early in the season before the weather allows big volume. You sharpen the high end indoors through winter, then grow the aerobic engine underneath it as the days get longer. His caution is the one most people skip — reverse only works if you protect the easy riding around the hard blocks, or you just end up training grey all winter. Pick the model that fits your calendar, not the one that sounds hardest.",
  "joe-friel/masters-training":
    "Friel wrote Fast After 50 because the standard advice — just train less — was costing masters riders the very thing that keeps them fast. His framework is the opposite of backing off: protect intensity, because high-end power is what fades first and what disappears for good if you stop chasing it. What changes is the recovery around it. Two properly hard sessions a week, more days between them, and strength work treated as non-negotiable rather than optional. He's blunt that the riders who decline fastest are the ones who quietly drop the gym and the hard efforts at the same time. Train hard, recover harder, and the engine holds up far longer than the cycling internet assumes.",
  "joe-friel/cycling-longevity":
    "Ask Friel what keeps a rider competitive into their 60s and he won't talk about a magic session — he'll talk about not quitting the things that get uncomfortable with age. Strength training to defend muscle and bone. Intensity to defend the top end. Recovery and sleep treated as part of the plan, not an afterthought. His whole later body of work is a rebuttal to the idea that decline is a cliff: it's a slope, and most amateurs sit nowhere near the bottom of it. The riders who lose the most are the ones who let fear of injury talk them out of lifting and pushing. Keep doing the hard, boring, protective work and the years are far kinder than you expect.",
  "andy-galpin/masters-training":
    "Galpin's lab work gives masters training its mechanism. The order of decline is the key insight: power goes before strength, strength goes before muscle mass, so the nervous system ages first. That's why the masters athlete who only rides is protecting the wrong half of the system — endurance riding maintains the slow-twitch fibres while the fast-twitch ones quietly shrink. His prescription is heavy, fast lifting a couple of times a week, enough protein to actually trigger the repair older muscle is slower to start, and recovery managed like a job. Train the qualities that fade fastest, not just the ones that feel comfortable, and you hold onto far more of your engine.",
  "andy-galpin/cycling-longevity":
    "For Galpin, longevity isn't a separate goal from performance — the same levers protect both. Muscle mass is the organ of healthy ageing as much as it's the source of power, so the strength work that keeps a cyclist fast also keeps them independent decades later. He's relentless on the basics that compound: sleep as the foundation, protein distributed across the day, resistance training that defends fast-twitch fibre, and intensity kept in the programme rather than retired. His framing reassures and challenges in the same breath — the body is far more trainable late in life than people fear, but only if you keep asking it to do hard things. Stop, and the decline accelerates; keep going, and it barely shows.",
  "dan-lorang/reverse-periodisation":
    "Lorang coaches across triathlon and the World Tour, and his take on reverse periodisation is pragmatic rather than dogmatic: the model serves the athlete's calendar, not the other way round. For an athlete with early targets or a winter stuck indoors, building intensity first and volume later is a legitimate way to arrive sharp without faking big base miles in bad weather. But his core principle still rules everything — he adjusts to the human in front of him daily, watching how they absorb the load rather than forcing a template through. Reverse, traditional or block, the question he asks is the same: is this athlete adapting, or just accumulating fatigue?",
  "stephen-seiler/reverse-periodisation":
    "Seiler's research is about distribution more than sequence, and that's exactly how he frames reverse periodisation: the order you build base and intensity matters less than keeping the 80/20 split honest throughout. He's wary of any model that quietly becomes an excuse to ride grey all winter under the banner of 'intensity first'. Done properly, a reverse approach still means most of the work is easy, with a small, potent dose of really hard efforts — just front-loaded in the calendar. His test is unchanged: if your easy days have crept up to moderate to support the hard blocks, the periodisation label doesn't matter, you've lost the plot.",
  "dr-david-lipman/masters-training":
    "Lipman's whole message to ageing riders is that most of what they read about decline is wrong, or at least premature. The sports physician's point is that the average masters cyclist is nowhere near their physiological ceiling — they've just been training in a way that lets fitness leak away. Fix the intensity distribution, add the strength work, respect recovery, and a 50-year-old can absolutely set personal bests. He's especially sharp on the difference between chronological age and trainability: the number on the licence tells you far less than how consistently and intelligently you've trained. The window isn't closing nearly as fast as the panic suggests.",
  "dr-david-lipman/cycling-longevity":
    "Lipman treats longevity on the bike as a trainability question, not a countdown. His clinical view is that the levers which extend a riding career — protecting muscle, keeping intensity in the plan, managing recovery and the metabolic basics — are the same ones that extend health span generally. He's pragmatic about what masters riders can control versus what they can't, and impatient with the fatalism that has people backing off in their 40s. The riders who stay strong into their 60s and 70s, in his telling, aren't genetic outliers — they're the ones who never let the hard, protective work slide.",
  "tim-spector/cycling-longevity":
    "Spector comes at cycling longevity from the gut and the plate. His research ties long-term health to the diversity of what you eat — the 30-plants-a-week target — and to cutting the ultra-processed food that quietly drives inflammation regardless of calories. For an ageing cyclist that matters twice over: the microbiome underpins recovery and immune resilience now, and metabolic health decades out. He's also a champion of individual variation — the same meal spikes one rider and barely moves another — which is why he's sceptical of one-size diet rules. Feed the gut well and consistently, and you're protecting both the rides you do this year and the ones you want to still be doing at 70.",
  "mark-sisson/cycling-longevity":
    "Sisson's pitch to endurance athletes is a warning dressed as encouragement: chronic, grey-zone volume is the enemy of a long, healthy riding life. His model leans on a big aerobic base ridden properly easy, a small dose of real intensity, and serious attention to strength and recovery — the opposite of grinding moderate miles until something breaks. He's spent decades arguing that the way many endurance athletes train ages them faster, not slower, and that the fix is more restraint on the easy days and more intent on the hard ones. Ride easy easy, hard hard, lift, and protect the body you want to still be using in your seventies.",
  "dr-mark-gordon/testosterone":
    "Here's the thing most masters riders get wrong when they finally test their hormones: they look at the wrong number. Gordon, a neuroendocrinologist, is blunt about it on the podcast — total testosterone is, in his words, worthless, because only about 2% of it is the free testosterone your body can actually use. He wants male athletes in the 50th to 75th percentile of free testosterone, not chasing a total that tells you nothing. He's just as practical about the levers that move it without a prescription: he points to a study where 40-to-70-year-olds taking 50mg of DHEA a night saw real gains in cognitive and physical function in three months, and he's adamant that cortisol is the quiet saboteur — 15 minutes of meditation three times a week, he says, can halve it. The takeaway for an ageing rider isn't to panic about a fading engine. It's to measure the right thing, manage stress like it's training load, and stop guessing.",
  "cynthia-thurlow/menopause":
    "This is the question the whole sport has left unanswered, and Thurlow — a nurse practitioner who's built her work around women's metabolic health — is one of the few experts who'll actually take it on. Her recurring theme is the protection of muscle, and it gets more urgent, not less, through perimenopause and menopause. She's careful with fasting for exactly this reason: past about 24 hours you start breaking down muscle, and she's not willing to run that risk in women who are already losing the hormonal support that defends lean mass and bone. She's also clear that hormonal depletion isn't only a midlife problem — a younger woman who's lost her cycle to under-fuelling is exposed to the same risks a menopausal woman faces: bone, heart, brain, cognition. For the female rider who's been handed training advice built entirely on male physiology, her message is simple — fuel enough, protect the muscle, and stop treating your hormones as an afterthought.",
  "joe-friel/vo2-max":
    "Friel wrote Fast After 50, so he's not going to pretend the decline isn't coming — he'll tell you straight that the first thing an ageing athlete notices is their VO2 max sliding, and that it starts quietly somewhere in your mid-to-late 30s whether you feel it or not. Here's the part that catches people out: for years your growing race-craft and pacing smarts hide it, so the numbers hold up even as the ceiling drops. Then one season the cover runs out. His answer is the opposite of the advice most riders follow, which is to quietly drop the hard stuff as they age. Protect the intensity — the high-end work is exactly what defends the top of the engine, and it's the first thing to disappear for good if you stop chasing it. The volume keeps the base honest; the VO2max sessions, done with real intent and proper recovery around them, are what keep you fast.",
  "andy-galpin/recovery":
    "Ask Galpin what recovery actually is and he reframes it on the spot: it isn't the absence of training, it's the active process that turns the training you've already done into adaptation. That distinction matters most for masters riders, because the recovery window really does get longer with age and the cost of ignoring it gets steeper. His warning is precise — cut your sleep, stack life stress, and under-eat protein, and you're running a body that can't bank what you're spending on the bike. The fix isn't softer training. It's treating sleep, food and the gap between hard days as part of the session, not an optional extra. Get the recovery side right and the same training that was digging you into a hole starts producing the gains it was supposed to.",
  "alex-larson/body-composition":
    "Larson, a dietitian who works with endurance athletes, has a point about ageing bodies that most riders chasing race weight never hear: the way you handle protein changes. In your 20s you absorb it efficiently — but once you're into the masters category, that efficiency drops, so you need a little more, not less, to hold onto lean mass. She works in the 1.5 to 2 grams per kilo range, and she's deliberate about building up to it gradually rather than overwhelming someone overnight. Her bigger warning is the one that wrecks most amateurs' body composition: don't diet on the bike. Under-fuel your sessions to lose weight and you'll strip the muscle you're trying to protect and blunt the training you're trying to absorb. The way to change your composition after 40 is to feed the work, defend the protein, and let the leanness come as a result — not to starve your way to it.",
  "derek-teel/strength-after-40":
    "Teel's pitch to time-crunched masters riders kills the main excuse for skipping the gym. You don't need a separate training block — he points out that even cutting 60 minutes of riding a week and putting it into two 30-minute strength sessions is enough to start defending the power that fades with age. Two sessions, he says, is the sweet spot: it gives the body a better chance to catch the recovery curve than trying to cram more in. His other masters-specific point is the hardest one for driven riders to swallow — you have to get comfortable prioritising maintenance over chasing new numbers in the gym. The goal off the bike isn't to get bigger or stronger for its own sake; it's to hold onto the fast-twitch strength and joint integrity that endurance riding quietly lets slide. Keep it simple, keep it twice a week, and protect what you've got.",
  "dr-andy-pruitt/bike-fit":
    "Pruitt has been fitting riders since before bike fit was a profession, and his framing turns it from a comfort tweak into injury insurance — which is exactly what a masters rider needs. He talks about a sweet spot around 45 degrees of torso angle where the weight splits evenly between saddle, feet and hands, with your core holding you there; tip too far forward and your hands take the load and the nerves complain, sit too upright and it all lands on the saddle. The line that matters most for older riders, though, is that fit isn't one-and-done. Your body changes — flexibility goes, feet flatten, you need more arch support and forefoot correction as you age — so he recommends a yearly look from someone who's tracked your records over time. His whole philosophy lands in one phrase: comfort and speed go hand in hand. Stay fitted to the body you have now, not the one you had a decade ago, and you keep riding pain-free for longer.",
};

/* ------------------------------------------------------------------ *
 * Page assembly
 * ------------------------------------------------------------------ */

export interface ExpertQuote {
  text: string;
  speaker: string;
  credential?: string;
  episodeSlug: string;
  episodeTitle: string;
}

export interface ExpertTopicEpisode {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  duration: string;
  pillar: ContentPillar;
}

export type EnrichmentStatus = "editorial" | "structured";

export interface RelatedExpertRef {
  slug: string;
  name: string;
  credential?: string;
}

export interface ExpertTopicPage {
  expertSlug: string;
  topicSlug: string;
  expert: {
    name: string;
    lastName: string;
    slug: string;
    credential?: string;
    bio: string; // whyMatters or description or fallback
    shortBio: string; // description or credential fallback
    pillars: ContentPillar[];
    episodeCount: number;
    override: GuestProfileOverride | undefined;
  };
  topic: ExpertTopic;
  /** H1 / page question. */
  question: string;
  /** Editorial summary — authored or structured factual lead. */
  summary: string;
  enrichment: EnrichmentStatus;
  /** Citable claims this expert is known for, filtered to the topic. */
  keyPositions: string[];
  /** Attributed direct quotes from the topic's episodes. */
  quotes: ExpertQuote[];
  /** Episodes that touch this topic (or the expert's episodes as fallback). */
  episodes: ExpertTopicEpisode[];
  faqs: { question: string; answer: string }[];
  /** Related fine-topics the same expert covers. */
  relatedTopics: { slug: string; label: string }[];
  /** Other experts who speak on this topic. */
  relatedExperts: RelatedExpertRef[];
  /**
   * Whether the page carries enough unique substance to be indexed by
   * search engines. Thin pages stay live (internal nav, link equity) but
   * render `<meta name="robots" content="noindex,follow">` and drop out
   * of the sitemap — defusing the "scaled content abuse" signal Google's
   * 2024+ updates target at programmatic SEO.
   */
  indexable: boolean;
}

/**
 * Per-pair index overrides — force a specific `expertSlug/topicSlug` into
 * or out of the index regardless of the heuristic. Empty by default;
 * populate when a thin page is worth keeping (live event, freshly added
 * curated quote) or a substantive one needs hiding.
 */
const EXPERT_INDEX_OVERRIDES: Record<string, "index" | "noindex"> = {};

/**
 * Whether an expert-topic page is substantive enough to keep in the index.
 *
 * The pages have a real spine — bio, schema, internal links — but the
 * `summary` falls back to a templated structured lead when no curated
 * editorial exists, and `keyPositions` / `quotes` / `episodes` quietly
 * fall back to wider-scope material when nothing topic-specific is found.
 * For Google's purposes that wider fallback content reads as boilerplate,
 * which is what the "scaled content abuse" signal targets.
 *
 * A page is judged substantive if it clears any of:
 *   - hand-written editorial summary (unique voice-matched content), or
 *   - at least one direct quote whose text actually mentions the topic, or
 *   - real topic-matched episode evidence combined with multiple
 *     topic-filtered expert positions.
 */
function computeIndexability({
  expertSlug,
  topicSlug,
  enrichment,
  onTopicQuotesCount,
  topicEpisodeCount,
  topicIdeasCount,
}: {
  expertSlug: string;
  topicSlug: string;
  enrichment: EnrichmentStatus;
  onTopicQuotesCount: number;
  topicEpisodeCount: number;
  topicIdeasCount: number;
}): boolean {
  const override = EXPERT_INDEX_OVERRIDES[`${expertSlug}/${topicSlug}`];
  if (override === "index") return true;
  if (override === "noindex") return false;

  if (enrichment === "editorial") return true;
  if (onTopicQuotesCount >= 1) return true;
  if (topicEpisodeCount >= 1 && topicIdeasCount >= 2) return true;
  return false;
}

/** Speaker on a keyQuote belongs to the expert if it slugifies to them. */
function quoteIsByExpert(speaker: string, expertSlug: string): boolean {
  return slugifyGuestName(speaker) === expertSlug;
}

function matchesTopic(ep: EpisodeMeta, topic: ExpertTopic): boolean {
  if ((ep.topicTags ?? []).includes(topic.parentHub)) {
    // Parent-hub tag is necessary but not sufficient — still require a
    // topical keyword hit so two fine-topics under one hub diverge.
    const haystack = `${ep.title} ${ep.description} ${(ep.keywords ?? []).join(" ")} ${(ep.keyTakeaways ?? []).join(" ")}`;
    if (topic.match.test(haystack)) return true;
  }
  const haystack = `${ep.title} ${ep.description} ${(ep.keywords ?? []).join(" ")} ${(ep.keyTakeaways ?? []).join(" ")}`;
  return topic.match.test(haystack);
}

function toEpisodeRef(ep: EpisodeMeta): ExpertTopicEpisode {
  return {
    slug: ep.slug,
    title: ep.title,
    description: ep.description,
    publishDate: ep.publishDate,
    duration: ep.duration,
    pillar: ep.pillar,
  };
}

function lastNameOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

function buildStructuredLead(
  guest: GuestProfile,
  topic: ExpertTopic,
  hasQuotes: boolean,
): string {
  const last = lastNameOf(guest.name);
  const cred = guest.credential ? `, ${guest.credential.toLowerCase()},` : "";
  const appearances =
    guest.episodeCount === 1
      ? "has appeared on the Roadman Cycling Podcast"
      : `has appeared on the Roadman Cycling Podcast ${guest.episodeCount} times`;
  const source = hasQuotes
    ? "The positions below are drawn from those conversations, quoted directly."
    : "The positions below are drawn from those conversations and wider published work.";
  return `${guest.name}${cred} ${appearances}. Here's where ${last} lands on ${topic.phrase}. ${source}`;
}

function buildFaqs(
  guest: GuestProfile,
  topic: ExpertTopic,
  summary: string,
  keyPositions: string[],
  episodes: ExpertTopicEpisode[],
): { question: string; answer: string }[] {
  const last = lastNameOf(guest.name);
  const faqs: { question: string; answer: string }[] = [];

  // Lead Q&A — the literal target query.
  faqs.push({
    question: `What does ${guest.name} say about ${topic.phrase}?`,
    answer: summary,
  });

  // The single strongest position, framed as its own Q&A for extraction.
  if (keyPositions[0]) {
    faqs.push({
      question: `What is ${last}'s main point on ${topic.label.toLowerCase()}?`,
      answer: keyPositions[0],
    });
  }

  // Where to hear it.
  if (episodes.length > 0) {
    const titles = episodes
      .slice(0, 3)
      .map((e) => `"${e.title}"`)
      .join(", ");
    faqs.push({
      question: `Which Roadman Cycling Podcast episodes cover ${guest.name} on ${topic.label.toLowerCase()}?`,
      answer: `${last} discusses ${topic.phrase} in ${episodes.length === 1 ? "this episode" : "these episodes"}: ${titles}.`,
    });
  }

  return faqs;
}

/**
 * Assemble the full data for one expert-topic page, or null if the pair
 * isn't valid (unknown topic, expert isn't a real guest, or the topic
 * isn't in the expert's assigned set).
 */
export function getExpertTopicPage(
  expertSlug: string,
  topicSlug: string,
): ExpertTopicPage | null {
  const topic = getExpertTopic(topicSlug);
  if (!topic) return null;

  const guest = getGuestBySlug(expertSlug);
  if (!guest) return null;

  // The pair must be one we actually generate.
  if (!getTopicSlugsForExpert(expertSlug).includes(topicSlug)) return null;

  const override = getGuestProfileOverride(expertSlug);

  const sortedEpisodes = [...guest.episodes].sort(
    (a, b) =>
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
  );

  // Episodes that actually touch the topic; fall back to parent-hub-tagged,
  // then the expert's most recent episodes so links are never empty.
  const topicEpisodes = sortedEpisodes.filter((ep) => matchesTopic(ep, topic));
  const hubEpisodes = sortedEpisodes.filter((ep) =>
    (ep.topicTags ?? []).includes(topic.parentHub),
  );
  const episodeSource =
    topicEpisodes.length > 0
      ? topicEpisodes
      : hubEpisodes.length > 0
        ? hubEpisodes
        : sortedEpisodes;
  const episodes = episodeSource.slice(0, 6).map(toEpisodeRef);

  // Quotes: this expert's attributed quotes from the topical episodes,
  // preferring ones whose text is on-topic, then any from those episodes.
  const quotePool = (topicEpisodes.length > 0 ? topicEpisodes : episodeSource)
    .flatMap((ep) =>
      (ep.keyQuotes ?? [])
        .filter((q) => quoteIsByExpert(q.speaker, expertSlug))
        .map((q) => ({
          text: q.text,
          speaker: q.speaker,
          credential: q.credential,
          episodeSlug: ep.slug,
          episodeTitle: ep.title,
        })),
    );
  const onTopicQuotes = quotePool.filter((q) => topic.match.test(q.text));
  const quotes = (onTopicQuotes.length > 0 ? onTopicQuotes : quotePool).slice(
    0,
    4,
  );

  // Key positions: the expert's keyIdeas filtered to the topic, else all.
  const allIdeas = override?.keyIdeas ?? [];
  const topicIdeas = allIdeas.filter((idea) => topic.match.test(idea));
  const keyPositions = (topicIdeas.length > 0 ? topicIdeas : allIdeas).slice(
    0,
    5,
  );

  // Editorial summary — curated or structured.
  const curated = CURATED_EDITORIAL[`${expertSlug}/${topicSlug}`];
  const summary =
    curated ?? buildStructuredLead(guest, topic, quotes.length > 0);
  const enrichment: EnrichmentStatus = curated ? "editorial" : "structured";

  const indexable = computeIndexability({
    expertSlug,
    topicSlug,
    enrichment,
    onTopicQuotesCount: onTopicQuotes.length,
    topicEpisodeCount: topicEpisodes.length,
    topicIdeasCount: topicIdeas.length,
  });

  const faqs = buildFaqs(guest, topic, summary, keyPositions, episodes);

  // Related topics — the expert's other assigned topics.
  const relatedTopics = getTopicSlugsForExpert(expertSlug)
    .filter((s) => s !== topicSlug)
    .map((s) => getExpertTopic(s))
    .filter((t): t is ExpertTopic => Boolean(t))
    .map((t) => ({ slug: t.slug, label: t.label }));

  // Related experts — others who speak on this topic.
  const relatedExperts = getExpertsForTopic(topicSlug)
    .filter((e) => e.slug !== expertSlug)
    .slice(0, 6);

  const bio =
    override?.whyMatters ??
    override?.description ??
    (guest.credential
      ? `${guest.name} — ${guest.credential}. Expert guest on The Roadman Cycling Podcast.`
      : `${guest.name} — expert guest on The Roadman Cycling Podcast.`);

  const shortBio =
    override?.description ??
    (guest.credential
      ? `${guest.name}, ${guest.credential}`
      : guest.name);

  return {
    expertSlug,
    topicSlug,
    expert: {
      name: guest.name,
      lastName: lastNameOf(guest.name),
      slug: guest.slug,
      credential: guest.credential,
      bio,
      shortBio,
      pillars: guest.pillars,
      episodeCount: guest.episodeCount,
      override,
    },
    topic,
    question: `What does ${guest.name} say about ${topic.phrase}?`,
    summary,
    enrichment,
    keyPositions,
    quotes,
    episodes,
    faqs,
    relatedTopics,
    relatedExperts,
    indexable,
  };
}

/* ------------------------------------------------------------------ *
 * Cross-cutting indexes (memoised at module scope for build speed)
 * ------------------------------------------------------------------ */

export interface ExpertTopicPair {
  expertSlug: string;
  topicSlug: string;
}

let _pairsCache: ExpertTopicPair[] | null = null;

/** Every (expert, topic) pair we generate a page for. */
export function getAllExpertTopicPairs(): ExpertTopicPair[] {
  if (_pairsCache) return _pairsCache;
  // Touch episodes once so the underlying guest cache is warm.
  getAllEpisodes();
  const pairs: ExpertTopicPair[] = [];
  // Dedupe on expert/topic — two episode guest-name castings can slugify to
  // the same expert, which would otherwise emit duplicate static routes.
  const seen = new Set<string>();
  for (const guest of getAllGuests()) {
    const override = getGuestProfileOverride(guest.slug);
    // Only generate for experts we have curated entity data for — that's
    // the quality gate that keeps this from becoming a doorway-page farm.
    if (!override) continue;
    for (const topicSlug of getTopicSlugsForExpert(guest.slug)) {
      const key = `${guest.slug}/${topicSlug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ expertSlug: guest.slug, topicSlug });
    }
  }
  _pairsCache = pairs;
  return pairs;
}

export interface ExpertWithTopics {
  slug: string;
  name: string;
  credential?: string;
  pillars: ContentPillar[];
  topics: { slug: string; label: string }[];
}

let _expertsWithTopicsCache: ExpertWithTopics[] | null = null;

/** Experts that have at least one topic page, with their topic list. */
export function getExpertsWithTopics(): ExpertWithTopics[] {
  if (_expertsWithTopicsCache) return _expertsWithTopicsCache;
  const byExpert = new Map<string, ExpertWithTopics>();
  for (const { expertSlug, topicSlug } of getAllExpertTopicPairs()) {
    const topic = getExpertTopic(topicSlug);
    if (!topic) continue;
    let entry = byExpert.get(expertSlug);
    if (!entry) {
      const guest = getGuestBySlug(expertSlug);
      if (!guest) continue;
      entry = {
        slug: guest.slug,
        name: guest.name,
        credential: guest.credential,
        pillars: guest.pillars,
        topics: [],
      };
      byExpert.set(expertSlug, entry);
    }
    entry.topics.push({ slug: topic.slug, label: topic.label });
  }
  _expertsWithTopicsCache = Array.from(byExpert.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  return _expertsWithTopicsCache;
}

/** Experts who speak on a given fine-topic (for related-experts linking). */
export function getExpertsForTopic(topicSlug: string): RelatedExpertRef[] {
  const refs: RelatedExpertRef[] = [];
  for (const { expertSlug, topicSlug: t } of getAllExpertTopicPairs()) {
    if (t !== topicSlug) continue;
    const guest = getGuestBySlug(expertSlug);
    if (!guest) continue;
    refs.push({
      slug: guest.slug,
      name: guest.name,
      credential: guest.credential,
    });
  }
  return refs;
}

/** Fine-topics that have at least one expert page (for the topic index). */
export function getActiveExpertTopics(): {
  topic: ExpertTopic;
  expertCount: number;
}[] {
  const counts = new Map<string, number>();
  for (const { topicSlug } of getAllExpertTopicPairs()) {
    counts.set(topicSlug, (counts.get(topicSlug) ?? 0) + 1);
  }
  return EXPERT_TOPICS.filter((t) => counts.has(t.slug))
    .map((topic) => ({ topic, expertCount: counts.get(topic.slug) ?? 0 }))
    .sort((a, b) => b.expertCount - a.expertCount);
}

/**
 * Pairs whose summary is still the auto-generated structured lead — the
 * editorial enrichment backlog. Returns slugs so an enrichment script or
 * a human can prioritise writing voice-matched summaries.
 */
export function getEnrichmentQueue(): ExpertTopicPair[] {
  return getAllExpertTopicPairs().filter(
    ({ expertSlug, topicSlug }) =>
      !(`${expertSlug}/${topicSlug}` in CURATED_EDITORIAL),
  );
}

let _indexableKeysCache: Set<string> | null = null;

function indexableKeyCache(): Set<string> {
  if (_indexableKeysCache) return _indexableKeysCache;
  const set = new Set<string>();
  for (const { expertSlug, topicSlug } of getAllExpertTopicPairs()) {
    const page = getExpertTopicPage(expertSlug, topicSlug);
    if (page?.indexable) set.add(`${expertSlug}/${topicSlug}`);
  }
  _indexableKeysCache = set;
  return set;
}

/**
 * Whether an expert-topic pair is indexable, cached across the build so
 * the sitemap, robots metadata and any audits agree without rebuilding
 * the full page object for every check.
 */
export function isIndexableExpertTopicPair(
  expertSlug: string,
  topicSlug: string,
): boolean {
  return indexableKeyCache().has(`${expertSlug}/${topicSlug}`);
}

/** The subset of expert-topic pairs we want in Google's index. */
export function getIndexableExpertTopicPairs(): ExpertTopicPair[] {
  return getAllExpertTopicPairs().filter(({ expertSlug, topicSlug }) =>
    isIndexableExpertTopicPair(expertSlug, topicSlug),
  );
}
