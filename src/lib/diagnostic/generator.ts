import Anthropic from "@anthropic-ai/sdk";
import { PROFILE_BREAKDOWNS, PROFILE_LABELS } from "./profiles";
import { buildUserMessage, SYSTEM_PROMPT } from "./prompt";
import type { Answers, Breakdown, GenerationSource, Profile } from "./types";
import { validateBreakdown, type ValidationResult } from "./validator";

/**
 * Calls Claude to generate a personalised breakdown, validates it,
 * and falls back to the static §9 template on failure. One retry on
 * transient failures; on the second strike we return the fallback
 * rather than blocking the user on a spinner.
 */

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2000;
const TEMPERATURE = 0.7;

// Hard ceiling per Claude attempt. Paid traffic won't tolerate a
// 15-second spinner — at 6s we abandon the attempt and either retry
// (if attempts remain) or fall back to the static §9 template.
const ATTEMPT_TIMEOUT_MS = 6_000;

export type { GenerationSource } from "./types";

export interface GenerationResult {
  breakdown: Breakdown;
  source: GenerationSource;
  /** null if we returned the static fallback straight away. */
  rawModelOutput: string | null;
  /** Validation result from the last model attempt, even if we ended
   * up returning the fallback — useful for the admin QA view. */
  validation: ValidationResult | null;
  attempts: number;
  errors: string[];
}

type CandidateBreakdown = {
  headline?: unknown;
  diagnosis?: unknown;
  whyThisIsHappening?: unknown;
  whatItsCosting?: unknown;
  fix?: unknown;
  whyAlone?: unknown;
  nextMove?: unknown;
  secondaryNote?: unknown;
};

/**
 * Extract the JSON object from the model's message. The prompt tells
 * the model to return JSON only, but we defensively strip code fences
 * and leading/trailing commentary in case it ignores the instruction.
 */
function extractJson(text: string): unknown {
  const trimmed = text.trim();

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    return JSON.parse(fencedMatch[1].trim());
  }

  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }

  throw new Error("No JSON object found in model output");
}

function toBreakdown(candidate: unknown): Breakdown {
  if (!candidate || typeof candidate !== "object") {
    throw new Error("Model output was not an object");
  }
  const c = candidate as CandidateBreakdown;

  if (!Array.isArray(c.fix)) throw new Error("fix must be an array");
  const fix = c.fix.map((step, i): Breakdown["fix"][number] => {
    if (!step || typeof step !== "object") {
      throw new Error(`fix[${i}] must be an object`);
    }
    const s = step as { step?: unknown; title?: unknown; detail?: unknown };
    const stepNum = typeof s.step === "number" ? s.step : i + 1;
    if (stepNum !== 1 && stepNum !== 2 && stepNum !== 3) {
      throw new Error(`fix[${i}].step must be 1, 2, or 3`);
    }
    return {
      step: stepNum,
      title: String(s.title ?? ""),
      detail: String(s.detail ?? ""),
    };
  });

  return {
    headline: String(c.headline ?? ""),
    diagnosis: String(c.diagnosis ?? ""),
    whyThisIsHappening: String(c.whyThisIsHappening ?? ""),
    whatItsCosting: String(c.whatItsCosting ?? ""),
    fix,
    whyAlone: String(c.whyAlone ?? ""),
    nextMove: String(c.nextMove ?? ""),
    secondaryNote:
      typeof c.secondaryNote === "string" && c.secondaryNote.trim().length > 0
        ? c.secondaryNote
        : null,
  };
}

async function callClaude(userMessage: string): Promise<string> {
  const client = new Anthropic();
  // Race the API against a hard timeout. The Anthropic SDK supports
  // an AbortSignal so we can cancel the underlying fetch on timeout
  // rather than just leaving it dangling.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
  try {
    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      },
      { signal: controller.signal }
    );

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    if (!text.trim()) throw new Error("Model returned no text content");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

function fallbackFor(primary: Profile, secondary: Profile | null): Breakdown {
  const base = PROFILE_BREAKDOWNS[primary];
  if (!secondary) return base;

  // Append a contributing-factor note pulled from the secondary's own
  // static template so the fallback path still respects §8's
  // secondary-profile rule.
  return {
    ...base,
    secondaryNote: `Your secondary issue is ${PROFILE_LABELS[secondary]}. Fix the primary first, but keep ${PROFILE_LABELS[secondary]} in view — it's close enough to the surface to matter.`,
  };
}

export async function generateBreakdown(
  primary: Profile,
  secondary: Profile | null,
  answers: Answers
): Promise<GenerationResult> {
  const errors: string[] = [];

  if (!process.env.ANTHROPIC_API_KEY) {
    errors.push("ANTHROPIC_API_KEY missing — serving static fallback");
    return {
      breakdown: fallbackFor(primary, secondary),
      source: "fallback",
      rawModelOutput: null,
      validation: null,
      attempts: 0,
      errors,
    };
  }

  const userMessage = buildUserMessage(primary, secondary, answers);
  let lastValidation: ValidationResult | null = null;
  let lastRaw: string | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await callClaude(userMessage);
      lastRaw = raw;

      const parsed = toBreakdown(extractJson(raw));
      const validation = validateBreakdown(parsed);
      lastValidation = validation;

      if (validation.ok) {
        return {
          breakdown: parsed,
          source: "llm",
          rawModelOutput: raw,
          validation,
          attempts: attempt,
          errors,
        };
      }

      errors.push(
        `attempt ${attempt} validation failed: ${validation.failures
          .map((f) => `${f.code} (${f.detail})`)
          .join("; ")}`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`attempt ${attempt} threw: ${msg}`);
      // Tight inter-attempt pause. The 6-second per-attempt timeout
      // is the real back-pressure; a 500ms gap is enough to dodge a
      // transient blip without making paid traffic stare at a
      // spinner for 14 seconds in the worst case.
      if (attempt === 1) await new Promise((r) => setTimeout(r, 500));
    }
  }

  return {
    breakdown: fallbackFor(primary, secondary),
    source: "fallback",
    rawModelOutput: lastRaw,
    validation: lastValidation,
    attempts: 2,
    errors,
  };
}
