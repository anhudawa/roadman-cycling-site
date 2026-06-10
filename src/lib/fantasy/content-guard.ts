/**
 * Roadman Fantasy Tour — content integrity guard.
 *
 * Every piece of generated copy (stage emails, rider blurbs, tooltips)
 * passes through this filter before it can be queued for human review,
 * and again before send. Two layers:
 *
 *  1. Fact-integrity blocklist — known recurring errors in the Roadman
 *     knowledge base that must never ship. The canonical one: Dan Lorang
 *     coaches at Red Bull–Bora–Hansgrohe; he does NOT coach Tadej
 *     Pogačar. Any copy putting those names together is rejected
 *     outright (Section 0.4 — when in doubt on coach–rider attribution,
 *     omit it).
 *
 *  2. AI-slop filters — banned openers, banned words, em-dash
 *     carpet-bombing (Section 5.2).
 */

export interface ContentViolation {
  rule: "fact_blocklist" | "banned_opener" | "banned_word" | "em_dash_density";
  detail: string;
}

export interface ContentCheck {
  ok: boolean;
  violations: ContentViolation[];
}

/** Pairs of name patterns that must never co-occur in one piece of copy. */
const FORBIDDEN_PAIRINGS: { a: RegExp; b: RegExp; detail: string }[] = [
  {
    a: /lorang/i,
    b: /poga[cč]ar/i,
    detail:
      "Dan Lorang must never be attributed as Pogačar's coach (known recurring error — hardcoded forbidden).",
  },
];

const BANNED_OPENERS = [
  "in the world of",
  "when it comes to",
  "in today's",
  "picture this",
  "buckle up",
  "let's dive",
  "let's delve",
  "have you ever",
  "imagine a world",
  "we've all been there",
];

const BANNED_WORDS = [
  "delve",
  "tapestry",
  "unleash",
  "unlock the",
  "game-changer",
  "game changer",
  "supercharge",
  "elevate your",
  "in the realm of",
  "testament to",
  "symphony",
  "treasure trove",
  "embark on",
  "navigate the world",
];

/** More than one em dash per 40 words reads as machine-written. */
const EM_DASH_WORDS_PER_DASH = 40;

export function checkContent(text: string): ContentCheck {
  const violations: ContentViolation[] = [];
  const lower = text.toLowerCase();

  for (const pairing of FORBIDDEN_PAIRINGS) {
    if (pairing.a.test(text) && pairing.b.test(text)) {
      violations.push({ rule: "fact_blocklist", detail: pairing.detail });
    }
  }

  const opening = lower.trimStart().slice(0, 80);
  for (const opener of BANNED_OPENERS) {
    if (opening.startsWith(opener)) {
      violations.push({ rule: "banned_opener", detail: `Banned opener: "${opener}"` });
    }
  }

  for (const word of BANNED_WORDS) {
    if (lower.includes(word)) {
      violations.push({ rule: "banned_word", detail: `Banned word/phrase: "${word}"` });
    }
  }

  const emDashes = (text.match(/—/g) ?? []).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  if (emDashes > 1 && emDashes > Math.ceil(words / EM_DASH_WORDS_PER_DASH)) {
    violations.push({
      rule: "em_dash_density",
      detail: `${emDashes} em dashes in ${words} words — rewrite with plainer punctuation.`,
    });
  }

  return { ok: violations.length === 0, violations };
}
