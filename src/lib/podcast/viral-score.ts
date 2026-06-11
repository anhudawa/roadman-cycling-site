/**
 * Viral-potential scorer for podcast episodes.
 *
 * This is intentionally separate from `seo-priority.ts`:
 * - SEO priority answers: "what should we enrich first?"
 * - Viral potential answers: "what is most likely to travel?"
 *
 * The score is a deterministic 0–100 heuristic built from transcript,
 * title, description, and structured frontmatter signals. It is not a
 * prediction model; the goal is to flag episodes with strong hook,
 * pain-point, specificity, novelty, utility, and quotability signals.
 */

import { type EpisodeMeta } from "../podcast";

export interface ViralScoreBreakdown {
  hook: number;
  pain: number;
  novelty: number;
  specificity: number;
  utility: number;
  quotability: number;
  total: number;
  reasons: string[];
}

export interface ViralScoredEpisode {
  episode: EpisodeMeta;
  score: number;
  breakdown: ViralScoreBreakdown;
}

const MAX_HOOK = 24;
const MAX_PAIN = 18;
const MAX_NOVELTY = 14;
const MAX_SPECIFICITY = 20;
const MAX_UTILITY = 16;
const MAX_QUOTABILITY = 12;

const HOOK_PHRASES: ReadonlyArray<string> = [
  "why",
  "how",
  "the exact",
  "the real reason",
  "what nobody tells you",
  "the mistake",
  "stop",
  "never",
  "do this",
  "if you",
  "what to do",
  "before you",
  "after you",
];

const PAIN_PHRASES: ReadonlyArray<string> = [
  "stuck",
  "plateau",
  "can't",
  "cannot",
  "slow",
  "dropped",
  "drop",
  "tired",
  "fatigue",
  "overtrained",
  "under recovered",
  "under-recovered",
  "bonk",
  "cramp",
  "injury",
  "burned out",
  "not enough time",
  "too busy",
  "lose weight",
  "weight loss",
  "race weight",
];

const NOVELTY_PHRASES: ReadonlyArray<string> = [
  "but",
  "instead",
  "actually",
  "the truth",
  "what most people miss",
  "what nobody says",
  "counterintuitive",
  "surprisingly",
  "not just",
  "more importantly",
  "the problem is",
];

const UTILITY_PHRASES: ReadonlyArray<string> = [
  "exact fix",
  "step by step",
  "step-by-step",
  "framework",
  "checklist",
  "simple way",
  "how to",
  "do this",
  "what to change",
  "what to do",
  "practical",
  "playbook",
  "template",
  "action plan",
];

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function normaliseText(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function countPhraseHits(texts: Array<string | undefined>, phrases: ReadonlyArray<string>): string[] {
  const hits = new Set<string>();
  for (const phrase of phrases) {
    const needle = normaliseText(phrase);
    if (!needle) continue;
    for (const text of texts) {
      const haystack = normaliseText(text);
      if (haystack && haystack.includes(needle)) {
        hits.add(phrase);
        break;
      }
    }
  }
  return Array.from(hits);
}

function sources(ep: EpisodeMeta & { transcript?: string }): Array<string | undefined> {
  const transcriptLead = ep.transcript ? ep.transcript.slice(0, 1400) : undefined;
  return [
    ep.title,
    ep.description,
    ep.seoTitle,
    ep.seoDescription,
    ep.answerCapsule,
    transcriptLead,
    ep.transcript,
    ep.keywords?.join(" "),
    ep.topicTags?.join(" "),
  ];
}

function scoreHook(ep: EpisodeMeta & { transcript?: string }): { score: number; reasons: string[] } {
  const texts = sources(ep);
  const hits = countPhraseHits(texts, HOOK_PHRASES);
  let score = hits.length * 3;

  const title = normaliseText(ep.title);
  if (/^(why|how|what|when|where|who)\b/.test(title)) score += 5;
  if (/[!?]/.test(ep.title)) score += 2;
  if (/\b(why|how|what|stop|never|exact|mistake|truth)\b/.test(title)) score += 3;

  score = clamp(score, 0, MAX_HOOK);

  const reasons: string[] = [];
  if (hits.length > 0) reasons.push(`hook language (${hits.slice(0, 3).join(", ")})`);
  if (/^(why|how|what|when|where|who)\b/.test(title)) reasons.push("question-led title");
  return { score, reasons };
}

function scorePain(ep: EpisodeMeta & { transcript?: string }): { score: number; reasons: string[] } {
  const texts = sources(ep);
  const hits = countPhraseHits(texts, PAIN_PHRASES);
  let score = hits.length * 2;

  if (/\b(plateau|stuck|tired|fatigue|burned out|injury|bonk|cramp)\b/.test(normaliseText(ep.title))) score += 4;
  if (/\b(can't|cannot|too busy|not enough time)\b/.test(normaliseText(ep.description))) score += 2;

  score = clamp(score, 0, MAX_PAIN);
  const reasons: string[] = [];
  if (hits.length > 0) reasons.push(`pain-point language (${hits.slice(0, 3).join(", ")})`);
  return { score, reasons };
}

function scoreNovelty(ep: EpisodeMeta & { transcript?: string }): { score: number; reasons: string[] } {
  const texts = sources(ep);
  const hits = countPhraseHits(texts, NOVELTY_PHRASES);
  let score = hits.length * 2;

  const title = normaliseText(ep.title);
  if (/\bbut\b/.test(title)) score += 2;
  if (/\binstead\b/.test(title)) score += 2;
  if (/\bvs\b|\bversus\b/.test(title)) score += 2;
  if (/\bnot just\b/.test(title)) score += 2;

  score = clamp(score, 0, MAX_NOVELTY);
  const reasons: string[] = [];
  if (hits.length > 0) reasons.push(`contrarian framing (${hits.slice(0, 3).join(", ")})`);
  return { score, reasons };
}

function scoreSpecificity(ep: EpisodeMeta & { transcript?: string }): { score: number; reasons: string[] } {
  const combined = [ep.title, ep.description, ep.answerCapsule, ep.transcript?.slice(0, 1400)]
    .filter(Boolean)
    .join(" ");
  const numberHits = combined.match(/\b\d+(?:\.\d+)?\b/g) ?? [];
  const unitHits = countPhraseHits([combined], ["ftp", "w kg", "wkg", "watts", "minutes", "hours", "percent", "%", "kg", "km", "miles", "rpm"]);
  const metricHits = countPhraseHits([combined], ["w/kg", "power", "threshold", "vo2max", "heart rate", "race weight"]);

  let score = 0;
  score += Math.min(8, new Set(numberHits).size * 2);
  score += Math.min(4, unitHits.length);
  score += Math.min(3, metricHits.length * 1.5);
  if (ep.keyTakeaways && ep.keyTakeaways.length >= 3) score += 1;
  score = clamp(score, 0, MAX_SPECIFICITY);

  const reasons: string[] = [];
  const uniqueNumbers = Array.from(new Set(numberHits));
  if (uniqueNumbers.length > 0) reasons.push(`specific numbers (${uniqueNumbers.slice(0, 3).join(", ")})`);
  if (metricHits.length > 0) reasons.push(`performance metrics (${metricHits.slice(0, 3).join(", ")})`);
  return { score, reasons };
}

function scoreUtility(ep: EpisodeMeta & { transcript?: string }): { score: number; reasons: string[] } {
  const texts = sources(ep);
  const hits = countPhraseHits(texts, UTILITY_PHRASES);
  let score = hits.length * 2;

  if (ep.keyTakeaways && ep.keyTakeaways.length >= 3) score += 2;
  if (ep.answerCapsule && ep.answerCapsule.length > 80) score += 2;
  if (ep.faq && ep.faq.length >= 2) score += 1;

  score = clamp(score, 0, MAX_UTILITY);
  const reasons: string[] = [];
  if (hits.length > 0) reasons.push(`actionable language (${hits.slice(0, 3).join(", ")})`);
  return { score, reasons };
}

function scoreQuotability(ep: EpisodeMeta & { transcript?: string }): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (ep.keyQuotes && ep.keyQuotes.length > 0) {
    score += Math.min(6, ep.keyQuotes.length * 3);
    reasons.push(`${ep.keyQuotes.length} key quote${ep.keyQuotes.length === 1 ? "" : "s"}`);
  }
  if (ep.answerCapsule && ep.answerCapsule.length >= 60) {
    score += 2;
    reasons.push("quote-ready answer capsule");
  }
  if (ep.transcript) {
    const transcript = ep.transcript.slice(0, 1800).toLowerCase();
    const punchyMarkers = ["the thing is", "what that means is", "the bottom line", "here is the thing", "the real issue"];
    const punchyHits = punchyMarkers.filter((marker) => transcript.includes(marker));
    if (punchyHits.length > 0) {
      score += Math.min(2, punchyHits.length);
      reasons.push(`quotable phrasing (${punchyHits.slice(0, 2).join(", ")})`);
    }
  }

  score = clamp(score, 0, MAX_QUOTABILITY);
  return { score, reasons };
}

export function scoreViralPotential(ep: EpisodeMeta & { transcript?: string }): ViralScoreBreakdown {
  const hook = scoreHook(ep);
  const pain = scorePain(ep);
  const novelty = scoreNovelty(ep);
  const specificity = scoreSpecificity(ep);
  const utility = scoreUtility(ep);
  const quotability = scoreQuotability(ep);

  const subtotal = hook.score + pain.score + novelty.score + specificity.score + utility.score + quotability.score;
  const reasons = [
    ...hook.reasons,
    ...pain.reasons,
    ...novelty.reasons,
    ...specificity.reasons,
    ...utility.reasons,
    ...quotability.reasons,
  ].slice(0, 6);

  return {
    hook: hook.score,
    pain: pain.score,
    novelty: novelty.score,
    specificity: specificity.score,
    utility: utility.score,
    quotability: quotability.score,
    total: Math.round(clamp(subtotal, 0, 100)),
    reasons,
  };
}

export function prioritiseViralEpisodes(episodes: Array<EpisodeMeta & { transcript?: string }>): ViralScoredEpisode[] {
  return episodes
    .map((episode) => ({
      episode,
      breakdown: scoreViralPotential(episode),
      score: 0,
    }))
    .map((item) => ({ ...item, score: item.breakdown.total }))
    .sort((a, b) => b.score - a.score || b.breakdown.hook - a.breakdown.hook);
}
