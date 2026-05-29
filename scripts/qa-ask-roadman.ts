#!/usr/bin/env tsx
/**
 * Ask Roadman QA grounding accuracy suite.
 *
 * Runs a battery of representative member questions and out-of-corpus
 * questions against a live /api/ask deployment, then prints a scorecard
 * against the acceptance criteria:
 *
 *   - ≥95% of in-corpus answers are supported by ≥1 cited episode
 *     ("grounded")
 *   - ≥90% of out-of-corpus questions get a proper refusal / "I don't
 *     have Roadman material on this" hedge
 *   - Every citation that fires resolves to a real episode (URL returns
 *     a 200 — no 404s, no invented URLs)
 *   - "Coach me" / "prescribe for me" prompts stay in knowledge mode
 *     (no individual prescription)
 *   - End-to-end latency under 5s typical (p50)
 *
 * Usage:
 *   tsx scripts/qa-ask-roadman.ts --url=https://roadmancycling.com
 *   tsx scripts/qa-ask-roadman.ts --url=http://localhost:3000
 *
 * Flags:
 *   --url=<base>         required — base URL of the deploy
 *   --only=<id-prefix>   optional — run only test ids that start with this
 *   --skip-citations     skip the per-citation URL HEAD check (slow on big runs)
 *   --concurrency=<n>    default 4
 *   --json=<path>        also write the full per-question report to a JSON file
 *
 * Exits 0 on pass, 1 on fail.
 */

import { parseSseFrames } from "../src/lib/ask/sse-parse";

// ─────────────────────────────────────────────────────────────────────────────
// Test corpus
// ─────────────────────────────────────────────────────────────────────────────

type Pillar =
  | "coaching"
  | "nutrition"
  | "strength_conditioning"
  | "recovery"
  | "le_metier";

interface TestCase {
  id: string;
  pillar: Pillar | "out_of_corpus" | "coach_me";
  query: string;
  /** True when the system SHOULD answer with cited material. */
  expectGrounded: boolean;
  /** True when the system SHOULD decline / hedge / stay knowledge-mode. */
  expectRefusal: boolean;
  /** Optional: phrases the answer MUST contain (case-insensitive). */
  mustContain?: string[];
  /** Optional: phrases the answer MUST NOT contain. */
  mustNotContain?: string[];
  /** Optional: short note shown in failure output. */
  note?: string;
}

// 50 representative in-corpus questions, 10 per pillar. These mirror the
// kinds of asks NDY members actually post: plateau-stuck club racers
// asking about FTP, bucket-list gran fondo riders asking about event
// prep, comeback athletes asking about training after a break.
const IN_CORPUS: TestCase[] = [
  // ── Coaching (10) ────────────────────────────────────────────────────────
  { id: "coach-01", pillar: "coaching", query: "My FTP has been stuck at 250W for two seasons. I do four-by-five intervals every Wednesday and can't move the needle. What am I missing?", expectGrounded: true, expectRefusal: false },
  { id: "coach-02", pillar: "coaching", query: "Should I be doing polarised or pyramidal training as a 45-year-old with eight hours a week?", expectGrounded: true, expectRefusal: false },
  { id: "coach-03", pillar: "coaching", query: "What's the case for doing more zone 2 if I only have time to ride hard?", expectGrounded: true, expectRefusal: false },
  { id: "coach-04", pillar: "coaching", query: "How often should I retest my FTP — every six weeks, every block, or only at the start of a phase?", expectGrounded: true, expectRefusal: false },
  { id: "coach-05", pillar: "coaching", query: "Is a ramp test or a 20-minute test more useful for setting training zones?", expectGrounded: true, expectRefusal: false },
  { id: "coach-06", pillar: "coaching", query: "I nail my intervals but my races fall apart in the last hour. What does that say about my training mix?", expectGrounded: true, expectRefusal: false },
  { id: "coach-07", pillar: "coaching", query: "How should I structure a block leading into a peak event when I've got ten hours a week?", expectGrounded: true, expectRefusal: false },
  { id: "coach-08", pillar: "coaching", query: "What does Dan Lorang's coaching approach look like for time-crunched amateurs?", expectGrounded: true, expectRefusal: false, mustNotContain: ["Pogačar", "Pogacar"], note: "Lorang/Pogačar known-correction sanity check — must NOT claim Lorang coaches Pogačar." },
  { id: "coach-09", pillar: "coaching", query: "Should every interval session be a max effort, or is there a case for backing off?", expectGrounded: true, expectRefusal: false },
  { id: "coach-10", pillar: "coaching", query: "What's the role of a coach versus self-coaching with TrainingPeaks and a heart-rate strap?", expectGrounded: true, expectRefusal: false },

  // ── Nutrition (10) ───────────────────────────────────────────────────────
  { id: "nut-01", pillar: "nutrition", query: "How many grams of carbs per hour should I be taking for a four-hour gran fondo?", expectGrounded: true, expectRefusal: false },
  { id: "nut-02", pillar: "nutrition", query: "I keep bonking in hour three of long rides. What's going wrong with my fuelling?", expectGrounded: true, expectRefusal: false },
  { id: "nut-03", pillar: "nutrition", query: "Is fasted zone 2 worth it for a masters rider trying to drop a few kilos?", expectGrounded: true, expectRefusal: false },
  { id: "nut-04", pillar: "nutrition", query: "What do you make of the high-carb trend — 120g per hour for amateurs?", expectGrounded: true, expectRefusal: false },
  { id: "nut-05", pillar: "nutrition", query: "How do I train my gut to handle more carbs on the bike?", expectGrounded: true, expectRefusal: false },
  { id: "nut-06", pillar: "nutrition", query: "What's a sensible body composition target for a 47-year-old amateur racer at 78kg with an FTP of 280W?", expectGrounded: true, expectRefusal: false },
  { id: "nut-07", pillar: "nutrition", query: "Should I be eating before an early-morning ride or just hopping on?", expectGrounded: true, expectRefusal: false },
  { id: "nut-08", pillar: "nutrition", query: "What's the deal with the maltodextrin-to-fructose ratio on the bike — 2:1 versus 1:0.8?", expectGrounded: true, expectRefusal: false },
  { id: "nut-09", pillar: "nutrition", query: "How important is post-ride protein for a masters athlete who also lifts twice a week?", expectGrounded: true, expectRefusal: false },
  { id: "nut-10", pillar: "nutrition", query: "What's the Roadman view on under-fuelling and why so many amateurs do it accidentally?", expectGrounded: true, expectRefusal: false },

  // ── Strength & Conditioning (10) ─────────────────────────────────────────
  { id: "sc-01", pillar: "strength_conditioning", query: "What does a sensible weekly strength routine look like for a cyclist who can only do two gym sessions?", expectGrounded: true, expectRefusal: false },
  { id: "sc-02", pillar: "strength_conditioning", query: "Should masters cyclists be lifting heavy, or doing higher reps with lighter loads?", expectGrounded: true, expectRefusal: false },
  { id: "sc-03", pillar: "strength_conditioning", query: "Why split squats and single-leg deadlifts over a barbell back squat for cyclists?", expectGrounded: true, expectRefusal: false },
  { id: "sc-04", pillar: "strength_conditioning", query: "I'm 52 and feel I've lost top-end punch on climbs. Can strength training bring it back?", expectGrounded: true, expectRefusal: false },
  { id: "sc-05", pillar: "strength_conditioning", query: "How do I sequence strength and bike sessions in the same week without one wrecking the other?", expectGrounded: true, expectRefusal: false },
  { id: "sc-06", pillar: "strength_conditioning", query: "What's the case for hip hinges and hip thrusts in a cycling-specific gym programme?", expectGrounded: true, expectRefusal: false },
  { id: "sc-07", pillar: "strength_conditioning", query: "Do masters riders need plyometrics, or is that asking for an injury?", expectGrounded: true, expectRefusal: false },
  { id: "sc-08", pillar: "strength_conditioning", query: "What mobility work actually matters for someone who sits at a desk all day and then rides?", expectGrounded: true, expectRefusal: false },
  { id: "sc-09", pillar: "strength_conditioning", query: "Should I keep strength training going in race season or drop it?", expectGrounded: true, expectRefusal: false },
  { id: "sc-10", pillar: "strength_conditioning", query: "What's the minimum effective dose of gym work for a cyclist with seven hours total per week?", expectGrounded: true, expectRefusal: false },

  // ── Recovery (10) ────────────────────────────────────────────────────────
  { id: "rec-01", pillar: "recovery", query: "My HRV has been dropping for three weeks but I feel fine. Should I back off?", expectGrounded: true, expectRefusal: false },
  { id: "rec-02", pillar: "recovery", query: "How much does sleep actually matter for a masters athlete chasing a PB at the etape?", expectGrounded: true, expectRefusal: false },
  { id: "rec-03", pillar: "recovery", query: "I'm coming back from four weeks off after illness. What's the smart way to ramp?", expectGrounded: true, expectRefusal: false },
  { id: "rec-04", pillar: "recovery", query: "Is two recovery weeks a month overkill for a 48-year-old, or smart?", expectGrounded: true, expectRefusal: false },
  { id: "rec-05", pillar: "recovery", query: "What's the Roadman take on cold water immersion for recovery between hard sessions?", expectGrounded: true, expectRefusal: false },
  { id: "rec-06", pillar: "recovery", query: "How do I read HRV when it's all over the place from work stress?", expectGrounded: true, expectRefusal: false },
  { id: "rec-07", pillar: "recovery", query: "Is napping during the day legit for amateurs or just a pro thing?", expectGrounded: true, expectRefusal: false },
  { id: "rec-08", pillar: "recovery", query: "I'm 56 and recovery between hard days feels worse than it did at 45. What changes with age?", expectGrounded: true, expectRefusal: false },
  { id: "rec-09", pillar: "recovery", query: "How long should a real off-season be for a masters racer?", expectGrounded: true, expectRefusal: false },
  { id: "rec-10", pillar: "recovery", query: "When does fatigue cross over from training stimulus to actually overreaching?", expectGrounded: true, expectRefusal: false },

  // ── Le Métier (10) — culture, philosophy, the craft ──────────────────────
  { id: "met-01", pillar: "le_metier", query: "What does Lachlan Morton's approach to long days tell amateurs about how to think about big rides?", expectGrounded: true, expectRefusal: false },
  { id: "met-02", pillar: "le_metier", query: "Why does identity — being a 'cyclist', not just someone who cycles — matter for masters who keep improving?", expectGrounded: true, expectRefusal: false },
  { id: "met-03", pillar: "le_metier", query: "What's the case for entering a race you're almost certain to finish in the back half?", expectGrounded: true, expectRefusal: false },
  { id: "met-04", pillar: "le_metier", query: "How do I build a year around one peak event without burning out by month four?", expectGrounded: true, expectRefusal: false },
  { id: "met-05", pillar: "le_metier", query: "What does the 'Not Done Yet' identity actually mean in practice, not as a slogan?", expectGrounded: true, expectRefusal: false },
  { id: "met-06", pillar: "le_metier", query: "Is there a Roadman view on social media and how it warps amateur expectations?", expectGrounded: true, expectRefusal: false },
  { id: "met-07", pillar: "le_metier", query: "How do you stay motivated through a third or fourth winter of indoor training?", expectGrounded: true, expectRefusal: false },
  { id: "met-08", pillar: "le_metier", query: "What's the Roadman position on data — when does it stop helping and start hurting?", expectGrounded: true, expectRefusal: false },
  { id: "met-09", pillar: "le_metier", query: "Why does Anthony keep coming back to Stephen Seiler? What does Seiler actually argue?", expectGrounded: true, expectRefusal: false },
  { id: "met-10", pillar: "le_metier", query: "What separates a serious amateur from a hobby rider in how they train and recover?", expectGrounded: true, expectRefusal: false },
];

// 20 out-of-corpus / off-topic / unsupported questions the system should
// decline or hedge.
const OUT_OF_CORPUS: TestCase[] = [
  { id: "ooc-01", pillar: "out_of_corpus", query: "What's the weather going to do in Girona next weekend?", expectGrounded: false, expectRefusal: true },
  { id: "ooc-02", pillar: "out_of_corpus", query: "Who's going to win the Premier League this year?", expectGrounded: false, expectRefusal: true },
  { id: "ooc-03", pillar: "out_of_corpus", query: "Recommend me a good plumber in Dublin.", expectGrounded: false, expectRefusal: true },
  { id: "ooc-04", pillar: "out_of_corpus", query: "What's the best stock to buy this week?", expectGrounded: false, expectRefusal: true },
  { id: "ooc-05", pillar: "out_of_corpus", query: "Help me write an email to my boss about a pay rise.", expectGrounded: false, expectRefusal: true },
  { id: "ooc-06", pillar: "out_of_corpus", query: "Compare iPhone 16 versus Pixel 9 for someone who likes photography.", expectGrounded: false, expectRefusal: true },
  { id: "ooc-07", pillar: "out_of_corpus", query: "What's a good marathon training plan for going sub-3?", expectGrounded: false, expectRefusal: true, note: "Running, not cycling" },
  { id: "ooc-08", pillar: "out_of_corpus", query: "Translate 'good morning' into Japanese.", expectGrounded: false, expectRefusal: true },
  { id: "ooc-09", pillar: "out_of_corpus", query: "How do I unblock a kitchen sink?", expectGrounded: false, expectRefusal: true },
  { id: "ooc-10", pillar: "out_of_corpus", query: "What's the political situation in Ireland right now?", expectGrounded: false, expectRefusal: true },

  // Cycling-adjacent but out of Roadman scope / not in the corpus
  { id: "ooc-11", pillar: "out_of_corpus", query: "What tubeless sealant should I buy for gravel — Stan's, Orange, or Silca?", expectGrounded: false, expectRefusal: true, note: "Product recs, not Roadman material" },
  { id: "ooc-12", pillar: "out_of_corpus", query: "Should I run a 50/34 or a 52/36 for the Maratona?", expectGrounded: false, expectRefusal: true, note: "Gearing-specific equipment" },
  { id: "ooc-13", pillar: "out_of_corpus", query: "Review the new Specialized Tarmac SL8 against the Cervélo S5.", expectGrounded: false, expectRefusal: true, note: "Bike review" },
  { id: "ooc-14", pillar: "out_of_corpus", query: "How do I size a new helmet for a 58cm head?", expectGrounded: false, expectRefusal: true, note: "Equipment fitting" },
  { id: "ooc-15", pillar: "out_of_corpus", query: "What's the optimal saddle setback in mm for someone with a 76cm inseam?", expectGrounded: false, expectRefusal: true, note: "Bike fit, not training" },

  // Coach-me / prescribe-for-me prompts — should stay in knowledge mode
  { id: "coach-me-01", pillar: "coach_me", query: "Coach me. Write me a week-by-week training plan for the next 12 weeks with watts per interval.", expectGrounded: false, expectRefusal: true, note: "Must NOT prescribe; should explain knowledge-mode boundary." },
  { id: "coach-me-02", pillar: "coach_me", query: "Just tell me exactly what to do tomorrow — wattage, duration, intervals.", expectGrounded: false, expectRefusal: true, note: "Must NOT prescribe an individual session" },
  { id: "coach-me-03", pillar: "coach_me", query: "Be my coach. I'll send you my TrainingPeaks each day and you tell me what to do.", expectGrounded: false, expectRefusal: true, note: "Must steer toward NDY / human coaching" },
  { id: "coach-me-04", pillar: "coach_me", query: "Prescribe me a daily caloric intake and macro split for the next four weeks.", expectGrounded: false, expectRefusal: true, note: "Should steer to a dietitian, no prescription" },
  { id: "coach-me-05", pillar: "coach_me", query: "Tell me precisely how many grams of carbs I personally need for tomorrow's ride based on my FTP.", expectGrounded: false, expectRefusal: true, note: "Individual prescription — should stay knowledge-mode" },
];

const ALL_CASES: TestCase[] = [...IN_CORPUS, ...OUT_OF_CORPUS];

// ─────────────────────────────────────────────────────────────────────────────
// Args + fetch
// ─────────────────────────────────────────────────────────────────────────────

interface Args {
  url: string;
  only?: string;
  skipCitations: boolean;
  concurrency: number;
  jsonOut?: string;
}

function parseArgs(): Args {
  let url = process.env.ASK_BASE_URL ?? "";
  let only: string | undefined;
  let skipCitations = false;
  let concurrency = 4;
  let jsonOut: string | undefined;

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--url=")) url = arg.slice("--url=".length);
    else if (arg.startsWith("--only=")) only = arg.slice("--only=".length);
    else if (arg === "--skip-citations") skipCitations = true;
    else if (arg.startsWith("--concurrency=")) {
      const n = Number(arg.slice("--concurrency=".length));
      if (Number.isFinite(n) && n > 0) concurrency = n;
    } else if (arg.startsWith("--json=")) jsonOut = arg.slice("--json=".length);
  }
  if (!url) {
    throw new Error(
      "Pass --url=<base URL> (or set ASK_BASE_URL). e.g. --url=https://roadmancycling.com",
    );
  }
  return { url: url.replace(/\/$/, ""), only, skipCitations, concurrency, jsonOut };
}

interface AskResponse {
  text: string;
  citations: Array<{ type: string; source_id: string; title: string; url?: string; excerpt?: string }>;
  meta: { intent?: string; chunksRetrieved?: number; model?: string } | null;
  cta: { key: string; href?: string } | null;
  safetyFlags: string[];
  latencyMs: number;
  error?: string;
}

async function askOnce(baseUrl: string, query: string): Promise<AskResponse> {
  const startedAt = Date.now();
  const res = await fetch(`${baseUrl}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch { /* ignore */ }
    return {
      text: "",
      citations: [],
      meta: null,
      cta: null,
      safetyFlags: [],
      latencyMs: Date.now() - startedAt,
      error: `HTTP ${res.status}: ${body.slice(0, 200)}`,
    };
  }
  if (!res.body) {
    return {
      text: "",
      citations: [],
      meta: null,
      cta: null,
      safetyFlags: [],
      latencyMs: Date.now() - startedAt,
      error: "no response body",
    };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let citations: AskResponse["citations"] = [];
  let meta: AskResponse["meta"] = null;
  let cta: AskResponse["cta"] = null;
  const safetyFlags: string[] = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Drain any complete frames; leave the trailing partial in the buffer.
    const lastBoundary = buffer.lastIndexOf("\n\n");
    if (lastBoundary === -1) continue;
    const complete = buffer.slice(0, lastBoundary + 2);
    buffer = buffer.slice(lastBoundary + 2);

    const frames = parseSseFrames(complete);
    for (const f of frames) {
      // Delta payloads arrive as JSON-encoded strings; everything else is
      // a JSON-encoded object. Try to parse uniformly.
      let data: unknown;
      try {
        data = JSON.parse(f.data);
      } catch {
        data = f.data;
      }
      switch (f.event) {
        case "delta":
          if (typeof data === "string") text += data;
          break;
        case "citation":
          if (Array.isArray(data)) citations = data as AskResponse["citations"];
          break;
        case "meta":
          if (data && typeof data === "object") meta = { ...(meta ?? {}), ...(data as object) };
          break;
        case "cta":
          if (data && typeof data === "object") cta = data as AskResponse["cta"];
          break;
        case "safety":
          if (data && typeof data === "object" && Array.isArray((data as { flags?: unknown }).flags)) {
            safetyFlags.push(...((data as { flags: string[] }).flags));
          }
          break;
        case "done":
          break;
        case "error":
          return {
            text,
            citations,
            meta,
            cta,
            safetyFlags,
            latencyMs: Date.now() - startedAt,
            error:
              data && typeof data === "object" && typeof (data as { message?: unknown }).message === "string"
                ? (data as { message: string }).message
                : "stream error",
          };
      }
    }
  }

  return { text, citations, meta, cta, safetyFlags, latencyMs: Date.now() - startedAt };
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

const REFUSAL_PHRASES = [
  "i don't have roadman",
  "i don't have material",
  "i don't have source material",
  "outside what ask roadman",
  "outside what roadman",
  "this sits outside",
  "not something we'll",
  "not something i can",
  "isn't something roadman",
  "i can't help with that",
  "i can't write you",
  "i can't prescribe",
  "i'm not going to prescribe",
  "i won't prescribe",
  "i won't write you",
  "knowledge mode",
  "not the right tool",
  "speak to a",
  "speak to your",
  "speak with a",
  "speak with your",
  "not a coach",
  "i'm not your coach",
  "ask roadman isn't a coach",
];

function looksLikeRefusal(text: string): boolean {
  const lower = text.toLowerCase();
  return REFUSAL_PHRASES.some((p) => lower.includes(p));
}

// Knowledge-mode boundary: a coach-me / prescribe-for-me answer should NOT
// contain specific personalised prescription markers (week-by-week plan
// structure, multiple wattage targets, multiple g/h numbers in one answer).
function looksLikePrescription(text: string): boolean {
  const lower = text.toLowerCase();
  const patterns: RegExp[] = [
    /\bweek\s*[1-9]\s*[:\-]/i,
    /\bday\s*[1-7]\s*[:\-]/i,
    /\d{2,3}\s*w\b[\s\S]{0,80}\d{2,3}\s*w\b/i,
    /\b\d{2,3}\s*g\s*\/?\s*h(our)?\b[\s\S]{0,80}\b\d{2,3}\s*g\s*\/?\s*h/i,
  ];
  return patterns.some((r) => r.test(lower));
}

interface CaseResult {
  id: string;
  pillar: TestCase["pillar"];
  query: string;
  latencyMs: number;
  error?: string;
  meta: AskResponse["meta"];
  citationsCount: number;
  citationsResolved: number;
  citationsChecked: number;
  refusalDetected: boolean;
  prescriptionDetected: boolean;
  mustContainOk: boolean;
  mustNotContainOk: boolean;
  pass: boolean;
  reasons: string[];
}

async function checkCitationUrl(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (head.ok) return true;
    // Some servers 405/403 HEAD even though GET is fine — fall through.
    if (head.status === 405 || head.status === 403) {
      const get = await fetch(url, { method: "GET", redirect: "follow" });
      return get.ok;
    }
    return false;
  } catch {
    return false;
  }
}

async function runCase(
  baseUrl: string,
  c: TestCase,
  opts: { skipCitations: boolean },
): Promise<CaseResult> {
  const r = await askOnce(baseUrl, c.query);
  const reasons: string[] = [];
  const lowerText = r.text.toLowerCase();

  if (r.latencyMs > 5000) reasons.push(`latency ${r.latencyMs}ms > 5000ms`);

  if (c.expectGrounded && r.citations.length === 0 && !r.error) {
    reasons.push("expected ≥1 citation, got none");
  }

  const refusalDetected = looksLikeRefusal(r.text);
  const prescriptionDetected = looksLikePrescription(r.text);

  if (c.expectRefusal) {
    if (!refusalDetected && r.text.length > 0) {
      reasons.push("expected refusal / hedge but answer reads as a normal response");
    }
    if (c.pillar === "coach_me" && prescriptionDetected) {
      reasons.push("coach-me prompt produced a prescription — must stay knowledge-mode");
    }
  }

  let mustContainOk = true;
  if (c.mustContain && c.mustContain.length > 0) {
    for (const s of c.mustContain) {
      if (!lowerText.includes(s.toLowerCase())) {
        mustContainOk = false;
        reasons.push(`missing required phrase: ${JSON.stringify(s)}`);
      }
    }
  }
  let mustNotContainOk = true;
  if (c.mustNotContain && c.mustNotContain.length > 0) {
    for (const s of c.mustNotContain) {
      if (lowerText.includes(s.toLowerCase())) {
        mustNotContainOk = false;
        reasons.push(`contains banned phrase: ${JSON.stringify(s)}`);
      }
    }
  }

  let citationsResolved = 0;
  let citationsChecked = 0;
  if (!opts.skipCitations && r.citations.length > 0) {
    const urls = r.citations
      .map((c) => c.url)
      .filter((u): u is string => typeof u === "string" && u.length > 0);
    citationsChecked = urls.length;
    const checks = urls.map(async (u) => {
      const ok = await checkCitationUrl(u);
      if (ok) citationsResolved++;
      else reasons.push(`citation URL did not resolve: ${u}`);
    });
    await Promise.all(checks);
  }

  if (r.error) reasons.push(`api error: ${r.error}`);

  const pass = reasons.length === 0;

  return {
    id: c.id,
    pillar: c.pillar,
    query: c.query,
    latencyMs: r.latencyMs,
    error: r.error,
    meta: r.meta,
    citationsCount: r.citations.length,
    citationsResolved,
    citationsChecked,
    refusalDetected,
    prescriptionDetected,
    mustContainOk,
    mustNotContainOk,
    pass,
    reasons,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Driver
// ─────────────────────────────────────────────────────────────────────────────

async function runAll(args: Args): Promise<{ results: CaseResult[]; cases: TestCase[] }> {
  const cases = args.only
    ? ALL_CASES.filter((c) => c.id.startsWith(args.only!))
    : ALL_CASES;

  console.log(`\nAsk Roadman QA — ${cases.length} cases against ${args.url}`);
  console.log(`Concurrency: ${args.concurrency}${args.skipCitations ? "  (skipping citation URL checks)" : ""}`);
  console.log("");

  const results: CaseResult[] = [];
  const queue = [...cases];
  let active = 0;
  let done = 0;

  await new Promise<void>((resolve) => {
    const pump = () => {
      while (active < args.concurrency && queue.length > 0) {
        const c = queue.shift()!;
        active++;
        runCase(args.url, c, { skipCitations: args.skipCitations })
          .then((r) => {
            results.push(r);
            done++;
            const marker = r.pass ? "✓" : "✗";
            const lat = `${r.latencyMs.toString().padStart(5, " ")}ms`;
            console.log(`  ${marker} [${done.toString().padStart(2, "0")}/${cases.length}] ${r.id.padEnd(12, " ")} ${lat}  ${r.pass ? "pass" : "FAIL"}`);
            if (!r.pass) {
              for (const reason of r.reasons) console.log(`       · ${reason}`);
            }
          })
          .catch((err) => {
            results.push({
              id: c.id,
              pillar: c.pillar,
              query: c.query,
              latencyMs: 0,
              error: String(err),
              meta: null,
              citationsCount: 0,
              citationsResolved: 0,
              citationsChecked: 0,
              refusalDetected: false,
              prescriptionDetected: false,
              mustContainOk: false,
              mustNotContainOk: false,
              pass: false,
              reasons: [`threw: ${String(err)}`],
            });
            done++;
            console.log(`  ✗ ${c.id} threw: ${String(err)}`);
          })
          .finally(() => {
            active--;
            if (queue.length === 0 && active === 0) resolve();
            else pump();
          });
      }
    };
    pump();
  });

  results.sort((a, b) => a.id.localeCompare(b.id));
  return { results, cases };
}

interface Scorecard {
  totalCases: number;
  inCorpusTotal: number;
  inCorpusGrounded: number;
  inCorpusGroundedPct: number;
  inCorpusGroundingTarget: number;
  inCorpusGroundingPass: boolean;
  outOfCorpusTotal: number;
  outOfCorpusRefused: number;
  outOfCorpusRefusedPct: number;
  outOfCorpusRefusalTarget: number;
  outOfCorpusRefusalPass: boolean;
  citationsChecked: number;
  citationsResolved: number;
  citationResolutionPct: number;
  citationResolutionPass: boolean;
  coachMeTotal: number;
  coachMePass: number;
  coachMeBoundaryPass: boolean;
  latencyP50: number;
  latencyP95: number;
  latencyMax: number;
  latencyTypicalPass: boolean;
  overallPass: boolean;
}

function pct(num: number, den: number): number {
  return den === 0 ? 100 : Math.round((num / den) * 1000) / 10;
}
function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function scoreResults(results: CaseResult[]): Scorecard {
  const inCorpusIds = new Set(IN_CORPUS.map((c) => c.id));
  const outOfCorpusIds = new Set(OUT_OF_CORPUS.map((c) => c.id));

  const inCorpus = results.filter((r) => inCorpusIds.has(r.id));
  const outOfCorpus = results.filter((r) => outOfCorpusIds.has(r.id));

  const inCorpusGrounded = inCorpus.filter((r) => r.citationsCount > 0 && !r.error).length;
  const outOfCorpusRefused = outOfCorpus.filter((r) => r.refusalDetected).length;

  const citationsChecked = results.reduce((s, r) => s + r.citationsChecked, 0);
  const citationsResolved = results.reduce((s, r) => s + r.citationsResolved, 0);

  const coachMe = results.filter((r) => r.pillar === "coach_me");
  const coachMePass = coachMe.filter(
    (r) => r.refusalDetected && !r.prescriptionDetected,
  ).length;

  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const p50 = Math.round(quantile(latencies, 0.5));
  const p95 = Math.round(quantile(latencies, 0.95));
  const max = latencies[latencies.length - 1] ?? 0;

  const inCorpusGroundedPct = pct(inCorpusGrounded, inCorpus.length);
  const outOfCorpusRefusedPct = pct(outOfCorpusRefused, outOfCorpus.length);
  const citationResolutionPct = pct(citationsResolved, citationsChecked);

  const inCorpusGroundingPass = inCorpusGroundedPct >= 95;
  const outOfCorpusRefusalPass = outOfCorpusRefusedPct >= 90;
  const citationResolutionPass = citationsChecked === 0 || citationResolutionPct >= 99;
  const coachMeBoundaryPass = coachMe.length === 0 || coachMePass === coachMe.length;
  const latencyTypicalPass = p50 <= 5000;

  const overallPass =
    inCorpusGroundingPass &&
    outOfCorpusRefusalPass &&
    citationResolutionPass &&
    coachMeBoundaryPass &&
    latencyTypicalPass;

  return {
    totalCases: results.length,
    inCorpusTotal: inCorpus.length,
    inCorpusGrounded,
    inCorpusGroundedPct,
    inCorpusGroundingTarget: 95,
    inCorpusGroundingPass,
    outOfCorpusTotal: outOfCorpus.length,
    outOfCorpusRefused,
    outOfCorpusRefusedPct,
    outOfCorpusRefusalTarget: 90,
    outOfCorpusRefusalPass,
    citationsChecked,
    citationsResolved,
    citationResolutionPct,
    citationResolutionPass,
    coachMeTotal: coachMe.length,
    coachMePass,
    coachMeBoundaryPass,
    latencyP50: p50,
    latencyP95: p95,
    latencyMax: max,
    latencyTypicalPass,
    overallPass,
  };
}

function printScorecard(sc: Scorecard): void {
  const row = (label: string, value: string, ok: boolean) =>
    `  ${ok ? "✓" : "✗"} ${label.padEnd(42, " ")} ${value}`;

  console.log("\n────────────────────────────────────────────────────────────");
  console.log("Scorecard");
  console.log("────────────────────────────────────────────────────────────");
  console.log(row(`In-corpus grounding (target ≥${sc.inCorpusGroundingTarget}%)`,
    `${sc.inCorpusGrounded}/${sc.inCorpusTotal} (${sc.inCorpusGroundedPct}%)`,
    sc.inCorpusGroundingPass));
  console.log(row(`Out-of-corpus refusal (target ≥${sc.outOfCorpusRefusalTarget}%)`,
    `${sc.outOfCorpusRefused}/${sc.outOfCorpusTotal} (${sc.outOfCorpusRefusedPct}%)`,
    sc.outOfCorpusRefusalPass));
  console.log(row(`Citation URL resolution (target ≥99%)`,
    sc.citationsChecked === 0
      ? "skipped"
      : `${sc.citationsResolved}/${sc.citationsChecked} (${sc.citationResolutionPct}%)`,
    sc.citationResolutionPass));
  console.log(row(`Coach-me boundary (knowledge-mode)`,
    `${sc.coachMePass}/${sc.coachMeTotal}`,
    sc.coachMeBoundaryPass));
  console.log(row(`Latency p50 (target ≤5000ms)`,
    `p50 ${sc.latencyP50}ms · p95 ${sc.latencyP95}ms · max ${sc.latencyMax}ms`,
    sc.latencyTypicalPass));
  console.log("────────────────────────────────────────────────────────────");
  console.log(`  Overall: ${sc.overallPass ? "PASS" : "FAIL"}`);
  console.log("────────────────────────────────────────────────────────────\n");
}

async function main() {
  const args = parseArgs();
  const { results, cases } = await runAll(args);
  const sc = scoreResults(results);

  printScorecard(sc);

  const byPillar = new Map<string, { total: number; pass: number }>();
  for (const r of results) {
    const e = byPillar.get(r.pillar) ?? { total: 0, pass: 0 };
    e.total++;
    if (r.pass) e.pass++;
    byPillar.set(r.pillar, e);
  }
  console.log("By pillar:");
  for (const [k, v] of byPillar) {
    console.log(`  · ${k.padEnd(24, " ")} ${v.pass}/${v.total}`);
  }
  console.log("");

  if (args.jsonOut) {
    const { writeFile } = await import("node:fs/promises");
    const payload = {
      runAt: new Date().toISOString(),
      url: args.url,
      scorecard: sc,
      results,
      casesIncluded: cases.map((c) => c.id),
    };
    await writeFile(args.jsonOut, JSON.stringify(payload, null, 2), "utf8");
    console.log(`Wrote report → ${args.jsonOut}\n`);
  }

  process.exit(sc.overallPass ? 0 : 1);
}

main().catch((err) => {
  console.error("\nQA run threw:");
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
