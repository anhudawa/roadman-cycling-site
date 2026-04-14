import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { recordTosAcceptance, saveReport } from "@/lib/blood-engine/db";
import {
  INTERPRETATION_SYSTEM_PROMPT,
  PROMPT_VERSION,
} from "@/lib/blood-engine/interpretation-prompt";
import { getMarker } from "@/lib/blood-engine/markers";
import {
  type NormalizedMarkerValue,
  retestTimeframeToDays,
  validateContext,
  validateInterpretation,
  validateRawResults,
} from "@/lib/blood-engine/schemas";
import { normalize } from "@/lib/blood-engine/units";
import { TOS_VERSION } from "../../../../../content/blood-engine/disclaimer";

/**
 * Run an interpretation.
 *
 * POST body: { context, results, acceptedTos?: boolean }
 *
 * Returns: { reportId, interpretation }
 */

export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await requireBloodEngineAccess();

  let body: { context?: unknown; results?: unknown; acceptedTos?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!user.tosAcceptedAt) {
    if (body.acceptedTos !== true) {
      return NextResponse.json(
        { error: "Terms of Service acceptance required" },
        { status: 400 }
      );
    }
    await recordTosAcceptance(user.id, TOS_VERSION);
  }

  let context;
  let rawResults;
  try {
    context = validateContext(body.context);
    rawResults = validateRawResults(body.results);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (rawResults.length === 0) {
    return NextResponse.json({ error: "At least one marker value is required" }, { status: 400 });
  }

  // Server-side normalisation — never trust client-computed canonical values.
  let normalized: NormalizedMarkerValue[];
  try {
    normalized = rawResults.map((r) => ({
      markerId: r.markerId,
      originalValue: r.value,
      originalUnit: r.unit,
      canonicalValue: normalize(r.markerId, r.value, r.unit),
    }));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unit conversion failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  // Shape the user message so the model sees marker NAMES + canonical units,
  // not opaque ids. Keeps the prompt stable even if we rename a markerId.
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

  let raw;
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
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
    raw = stripJsonFences(textBlock.text);
  } catch (err) {
    console.error("[blood-engine/interpret] Anthropic call failed:", err);
    return NextResponse.json({ error: "Interpretation engine unavailable" }, { status: 502 });
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("[blood-engine/interpret] model returned non-JSON:", raw.slice(0, 400));
    return NextResponse.json({ error: "Interpretation engine returned invalid JSON" }, { status: 502 });
  }

  let interpretation;
  try {
    interpretation = validateInterpretation(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid interpretation shape";
    console.error("[blood-engine/interpret] validation failed:", message);
    return NextResponse.json({ error: "Interpretation failed validation: " + message }, { status: 502 });
  }

  // Compute retest due date from draw date + recommended timeframe
  const retestDays = retestTimeframeToDays(interpretation.retest_recommendation.timeframe);
  const retestDueAt = new Date(context.drawDate + "T00:00:00Z");
  retestDueAt.setUTCDate(retestDueAt.getUTCDate() + retestDays);

  const report = await saveReport({
    userId: user.id,
    context,
    results: normalized,
    interpretation,
    promptVersion: PROMPT_VERSION,
    retestDueAt,
    drawDate: context.drawDate,
  });

  return NextResponse.json({ reportId: report.id, interpretation });
}

/**
 * Strip ```json fences if the model decided to ignore instructions and wrap
 * its output. We're strict about parsing but kind about what we accept.
 */
function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}
