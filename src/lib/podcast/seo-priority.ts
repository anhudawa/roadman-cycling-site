/**
 * SEO prioritisation scorer for podcast episodes.
 *
 * Combines four signals into a 0–100 score that drives which of the
 * 314 (and growing) MDX episodes get the full SEO treatment first.
 * Used by `scripts/audit-episode-coverage.ts` and `scripts/seo-batch.ts`.
 *
 * Signals + max weights:
 *   guest authority          30   curated featured guests + named experts
 *   topic demand             30   hardcoded topic-weight map × tag matches
 *   commercial relevance     20   pillar match + tool/product mentions in transcript
 *   listener proof           15   log-scaled boost from episodeDownloadsCache
 *   uniqueness penalty       -5   docked when a higher-scored peer covers same ground
 *
 * The score's primary purpose is *ordering*, not absolute interpretation.
 * Two episodes scoring 72 and 71 are roughly equivalent; an 85 vs a 35 is
 * a clear-cut prioritisation.
 */
import { GUEST_PROFILE_OVERRIDES } from "@/lib/guests/profiles";
import { type EpisodeMeta } from "@/lib/podcast";
import { type ContentPillar } from "@/types";

// ---------------------------------------------------------------------------
// Tunable signal weights
// ---------------------------------------------------------------------------
export const MAX_AUTHORITY = 30;
export const MAX_TOPIC = 30;
export const MAX_COMMERCIAL = 20;
export const MAX_PROOF = 15;
export const MAX_UNIQUENESS_PENALTY = 5;

/**
 * Topic hub slug → demand weight. Reflects editorial judgement of which
 * topics drive paid conversions for Roadman ("Not Done Yet" community,
 * Strength Training course, Toolkit). Hand-tuned, not derived from
 * search volume — see spec for rationale.
 */
export const TOPIC_WEIGHTS: Record<string, number> = {
  // Highest-converting topics (full points)
  ftp: 1.0,
  "ftp-training": 1.0,
  "ftp-test": 1.0,
  "increase-ftp": 1.0,
  masters: 1.0,
  "masters-cycling": 1.0,
  "over-40": 1.0,
  "over-50": 1.0,
  nutrition: 1.0,
  "cycling-nutrition": 1.0,
  fueling: 1.0,
  coaching: 1.0,
  "cycling-coaching": 1.0,
  "training-plans": 1.0,
  // Strong supporting topics
  training: 0.9,
  "polarised-training": 0.9,
  "sweet-spot-training": 0.9,
  "zone-2": 0.9,
  "race-prep": 0.85,
  sportive: 0.85,
  gravel: 0.8,
  "time-crunched": 0.85,
  strength: 0.8,
  "strength-training": 0.8,
  "weight-loss": 0.85,
  "race-weight": 0.85,
  // Mid-tier
  recovery: 0.7,
  sleep: 0.65,
  pacing: 0.7,
  threshold: 0.85,
  vo2max: 0.85,
  "heart-rate": 0.75,
  power: 0.75,
  intervals: 0.85,
  bikefit: 0.7,
  "indoor-training": 0.7,
  "winter-training": 0.7,
  // Lower (still relevant, less commercial)
  "pro-cycling": 0.55,
  "tour-de-france": 0.5,
  doping: 0.4,
  history: 0.35,
  community: 0.4,
};

/**
 * Names of recognised cycling experts whose presence in a guest field
 * boosts authority even if they don't have a curated entry in
 * GUEST_PROFILE_OVERRIDES yet. Lowercased exact-match against the
 * normalised guest name.
 */
const NAMED_EXPERTS: ReadonlySet<string> = new Set([
  "stephen seiler",
  "professor stephen seiler",
  "dan lorang",
  "david dunne",
  "dr david dunne",
  "lachlan morton",
  "tadej pogačar",
  "tadej pogacar",
  "iñigo san millán",
  "inigo san millan",
  "jumbo-visma",
  "asker jeukendrup",
  "tim podlogar",
  "trevor connor",
  "tim cusick",
  "alex hutchinson",
  "ronnan mckirdy",
  "phil cavell",
  "neal henderson",
  "andrew coggan",
]);

/**
 * Pillar → commercial relevance multiplier. Pillars closest to paid
 * products (coaching community, strength course, toolkit) score highest.
 */
const PILLAR_COMMERCIAL: Record<ContentPillar, number> = {
  coaching: 1.0,
  strength: 0.95,
  nutrition: 0.95,
  recovery: 0.55,
  community: 0.35,
};

/**
 * Surface-area phrases — when they appear in transcripts, they signal
 * the episode discusses something we sell or operate. Used to detect
 * commercial relevance independently of pillar tagging.
 */
const COMMERCIAL_PHRASES: ReadonlyArray<string> = [
  "vekta",
  "not done yet",
  "roadman cycling community",
  "strength training course",
  "training plan",
  "race weight",
  "ftp test",
  "interval training",
  "polarised training",
  "polarized training",
];

// ---------------------------------------------------------------------------
// Scoring inputs / outputs
// ---------------------------------------------------------------------------

export interface PriorityContext {
  /**
   * Map of episode slug → download count from `episode_downloads_cache`.
   * Optional — when missing, listener-proof contributes 0 points.
   */
  downloadsBySlug?: Map<string, number>;
  /**
   * Pre-computed transcript embeddings keyed by slug, for the
   * uniqueness penalty. Optional — when missing, the penalty is 0
   * and ordering is driven by the other four signals.
   */
  transcriptEmbeddings?: Map<string, number[]>;
}

export interface ScoreBreakdown {
  authority: number;
  topic: number;
  commercial: number;
  proof: number;
  uniquenessPenalty: number;
  total: number;
  reasons: string[];
}

export interface ScoredEpisode {
  episode: EpisodeMeta;
  score: number;
  breakdown: ScoreBreakdown;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normaliseGuestName(raw: string | undefined): string | null {
  if (!raw || raw === "null") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "Rider Support") return null;
  return trimmed.toLowerCase();
}

function guestSlug(raw: string | undefined): string | null {
  const normal = normaliseGuestName(raw);
  if (!normal) return null;
  return normal
    .replace(/professor\s+/, "")
    .replace(/dr\.?\s+/, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function isFeaturedGuest(raw: string | undefined): boolean {
  const slug = guestSlug(raw);
  if (!slug) return false;
  return slug in GUEST_PROFILE_OVERRIDES;
}

function isNamedExpert(raw: string | undefined): boolean {
  const normal = normaliseGuestName(raw);
  return normal !== null && NAMED_EXPERTS.has(normal);
}

function topicScore(topicTags: string[] | undefined): {
  score: number;
  matchedTag: string | null;
} {
  if (!topicTags || topicTags.length === 0) return { score: 0, matchedTag: null };
  let best = 0;
  let bestTag: string | null = null;
  for (const tag of topicTags) {
    const w = TOPIC_WEIGHTS[tag];
    if (typeof w === "number" && w > best) {
      best = w;
      bestTag = tag;
    }
  }
  return { score: best * MAX_TOPIC, matchedTag: bestTag };
}

function commercialScore(
  pillar: ContentPillar,
  transcript: string | undefined,
): { score: number; matchedPhrase: string | null } {
  const pillarFactor = PILLAR_COMMERCIAL[pillar] ?? 0.4;
  let phraseHit: string | null = null;
  if (transcript) {
    const lower = transcript.toLowerCase();
    for (const phrase of COMMERCIAL_PHRASES) {
      if (lower.includes(phrase)) {
        phraseHit = phrase;
        break;
      }
    }
  }
  const phraseBoost = phraseHit ? 0.15 : 0;
  const combined = Math.min(1, pillarFactor + phraseBoost);
  return { score: combined * MAX_COMMERCIAL, matchedPhrase: phraseHit };
}

function proofScore(
  slug: string,
  ctx: PriorityContext,
): { score: number; downloads: number | null } {
  const downloads = ctx.downloadsBySlug?.get(slug);
  if (typeof downloads !== "number" || downloads <= 0) {
    return { score: 0, downloads: null };
  }
  // Log-scaled: 1k downloads → ~30%, 10k → ~60%, 100k → 100%.
  const normalised = Math.min(1, Math.log10(downloads + 1) / 5);
  return { score: normalised * MAX_PROOF, downloads };
}

function authorityScore(ep: EpisodeMeta): {
  score: number;
  label: string;
} {
  if (isFeaturedGuest(ep.guest)) {
    return { score: MAX_AUTHORITY, label: "featured guest" };
  }
  if (isNamedExpert(ep.guest)) {
    return { score: MAX_AUTHORITY * 0.8, label: "named expert" };
  }
  if (ep.guest && normaliseGuestName(ep.guest)) {
    return { score: MAX_AUTHORITY * 0.5, label: "named guest" };
  }
  return { score: 0, label: "no guest" };
}

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Score one episode in isolation. */
export function scoreEpisode(
  ep: EpisodeMeta & { transcript?: string },
  ctx: PriorityContext = {},
): ScoreBreakdown {
  const reasons: string[] = [];

  const auth = authorityScore(ep);
  if (auth.label !== "no guest") reasons.push(`${auth.label} (+${Math.round(auth.score)})`);

  const topic = topicScore(ep.topicTags);
  if (topic.matchedTag) {
    reasons.push(`topic ${topic.matchedTag} (+${Math.round(topic.score)})`);
  }

  const commercial = commercialScore(ep.pillar, ep.transcript);
  reasons.push(
    `${ep.pillar} pillar${commercial.matchedPhrase ? ` + "${commercial.matchedPhrase}"` : ""} (+${Math.round(commercial.score)})`,
  );

  const proof = proofScore(ep.slug, ctx);
  if (proof.downloads !== null) {
    reasons.push(`${proof.downloads.toLocaleString()} downloads (+${Math.round(proof.score)})`);
  }

  const subtotal = auth.score + topic.score + commercial.score + proof.score;
  return {
    authority: auth.score,
    topic: topic.score,
    commercial: commercial.score,
    proof: proof.score,
    uniquenessPenalty: 0,
    total: Math.round(subtotal),
    reasons,
  };
}

/**
 * Score and order all episodes. Applies the uniqueness penalty after
 * the initial pass: when two episodes in the same pillar score
 * similarly and have transcript embeddings within cosine ≥ 0.85,
 * the lower-scored one is docked `MAX_UNIQUENESS_PENALTY` so we don't
 * over-invest in near-duplicate coverage.
 */
export function prioritiseEpisodes(
  episodes: Array<EpisodeMeta & { transcript?: string }>,
  ctx: PriorityContext = {},
): ScoredEpisode[] {
  const initial = episodes.map((ep) => ({
    episode: ep,
    score: 0,
    breakdown: scoreEpisode(ep, ctx),
  }));

  for (const item of initial) {
    item.score = item.breakdown.total;
  }
  initial.sort((a, b) => b.score - a.score);

  const embeddings = ctx.transcriptEmbeddings;
  if (embeddings) {
    for (let i = 0; i < initial.length; i++) {
      const item = initial[i];
      const embA = embeddings.get(item.episode.slug);
      if (!embA) continue;
      for (let j = 0; j < i; j++) {
        const peer = initial[j];
        if (peer.episode.pillar !== item.episode.pillar) continue;
        const embB = embeddings.get(peer.episode.slug);
        if (!embB) continue;
        if (cosine(embA, embB) >= 0.85) {
          item.breakdown.uniquenessPenalty = MAX_UNIQUENESS_PENALTY;
          item.breakdown.total -= MAX_UNIQUENESS_PENALTY;
          item.breakdown.reasons.push(
            `near-duplicate of ${peer.episode.slug} (-${MAX_UNIQUENESS_PENALTY})`,
          );
          item.score = item.breakdown.total;
          break;
        }
      }
    }
    initial.sort((a, b) => b.score - a.score);
  }

  return initial;
}
