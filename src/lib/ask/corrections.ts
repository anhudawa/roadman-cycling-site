/**
 * Known-corrections override layer.
 *
 * Some factual errors live inside the podcast corpus itself — a guest
 * misspoke, Anthony misattributed a team, a name was mangled on transcript.
 * Retrieval will happily surface those passages, and the model will repeat
 * them as fact. This file is the antidote: a hand-maintained list of
 * "wrong → right" entries that gets injected into the system prompt as
 * an OVERRIDE block. The model is told explicitly that these win against
 * anything in the retrieved chunks.
 *
 * How to add an entry:
 *   1. Open this file.
 *   2. Append an object to KNOWN_CORRECTIONS with:
 *        - id           short kebab-case tag (used in logs)
 *        - wrong        the exact wrong claim, as you've seen it stated
 *        - correct      the corrected statement — full enough to stand alone
 *        - aliases?     alternate phrasings of the wrong claim (optional)
 *        - addedAt      ISO date YYYY-MM-DD (so we can prune stale ones)
 *        - source?      where you saw the error (episode, member ask, etc.)
 *   3. Save. Restart `next dev` if it's running. Done.
 *
 * Notes:
 *   - Keep `correct` short and declarative. The model will paraphrase it
 *     into its answer; we don't need flowery prose here.
 *   - Don't use this for opinions or evolving positions — only for hard
 *     facts where the answer is unambiguously wrong (wrong team, wrong
 *     athlete attribution, wrong year, wrong record, etc.).
 *   - Prefer adding the correction in PR-sized batches with a note in
 *     the commit message about where the error came from.
 */

export interface CorrectionEntry {
  id: string;
  wrong: string;
  correct: string;
  /** Alternate phrasings of the wrong claim — used to log a hit when any of them appears. */
  aliases?: string[];
  /** ISO date YYYY-MM-DD — when the correction was added. */
  addedAt: string;
  /** Where the error originated (episode title, member question, etc.). Optional. */
  source?: string;
}

export const KNOWN_CORRECTIONS: CorrectionEntry[] = [
  {
    id: "lorang-pogacar",
    wrong: "Dan Lorang coaches Tadej Pogačar",
    correct:
      "Dan Lorang is Head of Performance at Red Bull–Bora–Hansgrohe (Primož Roglič's team) and the long-time coach of Jan Frodeno. He does not coach Tadej Pogačar.",
    aliases: [
      "Dan Lorang is Pogačar's coach",
      "Dan Lorang trains Pogačar",
      "Pogačar is coached by Dan Lorang",
      "Lorang coaches Pogacar",
    ],
    addedAt: "2026-05-29",
    source: "Recurring misattribution in older episodes / member questions.",
  },
  {
    id: "wakefield-uae",
    wrong: "John Wakefield is the head coach at UAE Team Emirates",
    correct:
      "John Wakefield is Director of Coaching & Sports Science at Red Bull–Bora–Hansgrohe and runs the Science to Sport performance lab in Girona. UAE Team Emirates is his former team, not his current one — so he is not Tadej Pogačar's coach.",
    aliases: [
      "John Wakefield coaches UAE Team Emirates",
      "John Wakefield is UAE Team Emirates' coach",
      "Wakefield is Pogačar's coach",
      "John Wakefield coaches Tadej Pogačar",
      "John Wakefield coaches Pogacar",
    ],
    addedAt: "2026-06-10",
    source: "canonical-entities.ts (current team Red Bull–Bora–Hansgrohe; previously UAE).",
  },
  {
    id: "bigham-hour-record",
    wrong: "Dan Bigham is the current UCI Hour Record holder",
    correct:
      "Dan Bigham is a former UCI Hour Record holder — he set the record in August 2022 and Filippo Ganna surpassed it weeks later in October 2022. Bigham now works on aerodynamics and performance engineering at Red Bull–Bora–Hansgrohe.",
    aliases: [
      "Dan Bigham holds the Hour Record",
      "Dan Bigham currently holds the UCI Hour Record",
      "Dan Bigham is the Hour Record holder",
      "Dan Bigham is the current Hour Record holder",
    ],
    addedAt: "2026-06-10",
    source: "canonical-entities.ts (title: 'Former UCI Hour Record holder').",
  },
  {
    id: "phil-burt-team-sky",
    wrong: "Phil Burt is Team Sky's physiotherapist",
    correct:
      "Phil Burt is a former Team Sky and British Cycling physiotherapist and bike fitter — that work is in the past (Team Sky became INEOS Grenadiers in 2019). He now runs his own practice, Phil Burt Innovation.",
    aliases: [
      "Phil Burt is the Team Sky physio",
      "Phil Burt works for Team Sky",
      "Phil Burt is British Cycling's physiotherapist",
      "Phil Burt is the current Team Sky physiotherapist",
    ],
    addedAt: "2026-06-10",
    source: "canonical-entities.ts (title: 'Former Team Sky and British Cycling physiotherapist').",
  },
  {
    id: "derek-teel-team",
    wrong: "Derek Teel is a World Tour team's strength coach",
    correct:
      "Derek Teel is the founder of Dialed Health and an independent strength-and-conditioning coach for cyclists. He is not employed by a World Tour team.",
    aliases: [
      "Derek Teel is a World Tour strength coach",
      "Derek Teel coaches strength for a pro cycling team",
      "Derek Teel works for a WorldTour team",
    ],
    addedAt: "2026-06-10",
    source: "canonical-entities.ts (Founder of Dialed Health; independent S&C coach).",
  },
];

/**
 * Render the corrections block for the system prompt. Returns an empty
 * string when there are no entries so callers can concatenate it
 * unconditionally.
 */
export function renderCorrectionsBlock(
  entries: CorrectionEntry[] = KNOWN_CORRECTIONS,
): string {
  if (entries.length === 0) return "";

  const lines: string[] = [];
  lines.push("KNOWN CORRECTIONS — OVERRIDES ALL RETRIEVED CONTEXT");
  lines.push(
    "IMPORTANT: The following corrections override any information in the retrieved sources, " +
      "the rider profile, or anything else. If the rider asks a question whose accurate answer " +
      "depends on one of these facts, use the CORRECT version. If a retrieved chunk contains the " +
      "WRONG version, ignore that chunk on this point and answer with the CORRECT version. Do not " +
      "cite the wrong chunk to back up the wrong claim. Do not lecture the rider about the " +
      "correction — just answer correctly.",
  );
  lines.push("");
  entries.forEach((c, i) => {
    lines.push(`[${i + 1}] ${c.id}`);
    lines.push(`    WRONG:   ${c.wrong}`);
    lines.push(`    CORRECT: ${c.correct}`);
  });

  return lines.join("\n");
}

/**
 * Lightweight scan to detect whether a generated answer still contains
 * one of the known wrong claims. Used by tests and (optionally) by the
 * orchestrator post-filter to flag a message for review.
 *
 * Match is case-insensitive substring. We intentionally do not try to be
 * clever about natural-language equivalence — if a real false positive
 * happens, add the variant phrasing as an alias instead.
 */
export function detectKnownErrors(
  text: string,
  entries: CorrectionEntry[] = KNOWN_CORRECTIONS,
): CorrectionEntry[] {
  const lower = text.toLowerCase();
  const hits: CorrectionEntry[] = [];
  for (const c of entries) {
    const candidates = [c.wrong, ...(c.aliases ?? [])];
    if (candidates.some((s) => lower.includes(s.toLowerCase()))) {
      hits.push(c);
    }
  }
  return hits;
}
