/**
 * Pure interpretation helper — one function the API route AND the replay script
 * both call. Keeps prompt-construction + Anthropic invocation + JSON parsing
 * + validation in a single place so we can't drift between the two callers.
 *
 * This module does NOT touch the database. The caller is responsible for
 * persistence. It also does NOT enforce auth — callers do that.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  INTERPRETATION_SYSTEM_PROMPT,
  PROMPT_VERSION,
} from "./interpretation-prompt";
import { getMarker } from "./markers";
import {
  retestTimeframeToDays,
  validateInterpretation,
  type InterpretationJSON,
  type NormalizedMarkerValue,
  type RawMarkerValue,
  type ReportContext,
} from "./schemas";
import { normalize } from "./units";

export interface RunInterpretationResult {
  normalized: NormalizedMarkerValue[];
  interpretation: InterpretationJSON;
  promptVersion: string;
  retestDueAt: Date;
}

export interface RunInterpretationOptions {
  /** Override the model — useful for replay scripts that want to A/B test. */
  model?: string;
  /** Inject an Anthropic client (for testing with a mock). */
  client?: Anthropic;
  /** Override max tokens. Default 4096. */
  maxTokens?: number;
}

/**
 * Validate inputs, normalize units, call Claude, parse + validate the JSON,
 * compute the retest due date. Throws on any validation or upstream failure
 * with a message suitable for surfacing to the API caller.
 */
export async function runInterpretation(
  context: ReportContext,
  rawResults: RawMarkerValue[],
  options: RunInterpretationOptions = {}
): Promise<RunInterpretationResult> {
  if (rawResults.length === 0) {
    throw new Error("At least one marker value is required");
  }

  // Server-side normalisation — never trust client-computed canonical values.
  const normalized: NormalizedMarkerValue[] = rawResults.map((r) => ({
    markerId: r.markerId,
    originalValue: r.value,
    originalUnit: r.unit,
    canonicalValue: normalize(r.markerId, r.value, r.unit),
  }));

  const client = options.client ?? makeClient();

  // Shape the user message so the model sees marker NAMES + canonical units.
  const markerLines = normalized.map((n) => {
    const m = getMarker(n.markerId);
    return {
      markerId: n.markerId,
      name: m.displayName,
      value: n.canonicalValue,
      unit: m.canonicalUnit,
      original: { value: n.originalValue, unit: n.originalUnit },
    };
  });

  const userPayload = JSON.stringify({ context, markers: markerLines }, null, 2);

  const message = await client.messages.create({
    model: options.model ?? "claude-sonnet-4-6",
    max_tokens: options.maxTokens ?? 8192,
    system: INTERPRETATION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is the athlete's context and marker values. Return the interpretation JSON as specified.\n\n${userPayload}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text block in Anthropic response");
  }
  const raw = stripJsonFences(textBlock.text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Interpretation engine returned invalid JSON");
  }

  const interpretation = validateInterpretation(parsed);

  // retestDueAt = drawDate + retest timeframe
  const retestDays = retestTimeframeToDays(interpretation.retest_recommendation.timeframe);
  const retestDueAt = new Date(context.drawDate + "T00:00:00Z");
  retestDueAt.setUTCDate(retestDueAt.getUTCDate() + retestDays);

  return { normalized, interpretation, promptVersion: PROMPT_VERSION, retestDueAt };
}

function makeClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}
