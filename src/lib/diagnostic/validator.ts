import type { Breakdown } from "./types";

/**
 * Validation layer for LLM-generated breakdowns. Runs before we render
 * or persist — on failure the caller falls back to the static §9
 * template for the assigned profile.
 *
 * Banned-phrase list is Appendix B of the spec. Structural checks are
 * §10 ("Validation layer").
 */

export interface ValidationFailure {
  code:
    | "banned_phrase"
    | "word_count"
    | "wrong_fix_count"
    | "headline_too_long"
    | "missing_field";
  detail: string;
}

export interface ValidationResult {
  ok: boolean;
  failures: ValidationFailure[];
  wordCount: number;
}

/**
 * Appendix B banned phrases. Case-insensitive. Any match anywhere in
 * the generated prose triggers a validation failure.
 *
 * The "optimise/optimize" rule is nuanced: the spec allows it when
 * paired with a specific thing in the same sentence (zone, power,
 * watts, sleep, protein, carbs). We implement that via a small helper
 * instead of stuffing it into a single regex, since "same sentence"
 * logic is fiddly to get right with just lookaheads.
 */
const BANNED_REGEXES: Array<[RegExp, string]> = [
  [/unlock your potential/i, "unlock your potential"],
  [/game[- ]?changer/i, "game-changer"],
  [/life[- ]?hack/i, "life hack"],
  [/crush it/i, "crush it"],
  [/smash it/i, "smash it"],
  [/take it to the next level/i, "take it to the next level"],
  [/your journey/i, "your journey"],
  [/you['']ve got this/i, "you've got this"],
  [/believe in yourself/i, "believe in yourself"],
  [/at the end of the day/i, "at the end of the day"],
  [/move the needle/i, "move the needle"],
];

const OPTIMISE_ALLOWED_NEIGHBOURS =
  /\b(zone\s*2|zone\s*1|zone|power|watts|sleep|protein|carbs|carbohydrate|hrv|fueling|fuelling)\b/i;

function checkOptimise(text: string): string[] {
  const violations: string[] = [];
  // Split on sentence boundaries so "optimise your training" doesn't
  // get saved by a specific word three sentences later.
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const sentence of sentences) {
    if (!/\boptimi[sz]e\w*\b/i.test(sentence)) continue;
    if (!OPTIMISE_ALLOWED_NEIGHBOURS.test(sentence)) {
      violations.push(sentence.trim().slice(0, 120));
    }
  }
  return violations;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function breakdownFullText(b: Breakdown): string {
  return [
    b.headline,
    b.diagnosis,
    b.whyThisIsHappening,
    b.whatItsCosting,
    ...b.fix.flatMap((f) => [f.title, f.detail]),
    b.whyAlone,
    b.nextMove,
    b.secondaryNote ?? "",
  ].join("\n\n");
}

export function validateBreakdown(b: Breakdown): ValidationResult {
  const failures: ValidationFailure[] = [];

  // ── Structural checks ─────────────────────────────────
  const requiredFields: Array<keyof Breakdown> = [
    "headline",
    "diagnosis",
    "whyThisIsHappening",
    "whatItsCosting",
    "whyAlone",
    "nextMove",
  ];
  for (const field of requiredFields) {
    const v = b[field];
    if (typeof v !== "string" || v.trim().length === 0) {
      failures.push({ code: "missing_field", detail: String(field) });
    }
  }

  if (!Array.isArray(b.fix) || b.fix.length !== 3) {
    failures.push({
      code: "wrong_fix_count",
      detail: `fix has ${b.fix?.length ?? 0} items, expected 3`,
    });
  }

  if (typeof b.headline === "string") {
    const headlineWords = countWords(b.headline);
    if (headlineWords > 10) {
      failures.push({
        code: "headline_too_long",
        detail: `${headlineWords} words (max 10)`,
      });
    }
  }

  const fullText = breakdownFullText(b);
  const wordCount = countWords(fullText);
  if (wordCount < 500 || wordCount > 900) {
    failures.push({
      code: "word_count",
      detail: `${wordCount} words (required 500–900)`,
    });
  }

  // ── Banned phrases ────────────────────────────────────
  for (const [regex, label] of BANNED_REGEXES) {
    if (regex.test(fullText)) {
      failures.push({ code: "banned_phrase", detail: label });
    }
  }
  for (const match of checkOptimise(fullText)) {
    failures.push({
      code: "banned_phrase",
      detail: `"optimise" without a specific noun — "${match}"`,
    });
  }

  return { ok: failures.length === 0, failures, wordCount };
}
