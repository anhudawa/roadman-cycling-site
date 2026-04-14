import { NextResponse } from "next/server";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { recordTosAcceptance, saveReport } from "@/lib/blood-engine/db";
import { runInterpretation } from "@/lib/blood-engine/run-interpretation";
import {
  validateContext,
  validateRawResults,
} from "@/lib/blood-engine/schemas";
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

  let result;
  try {
    result = await runInterpretation(context, rawResults);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Interpretation failed";
    console.error("[blood-engine/interpret]", message);
    // 400 for validation-style messages, 502 for upstream Anthropic issues
    const status =
      message.startsWith("At least one marker") ||
      message.startsWith("Unsupported unit") ||
      message.includes("invalid") ||
      message.startsWith("interpretation.")
        ? 400
        : 502;
    return NextResponse.json({ error: message }, { status });
  }

  const report = await saveReport({
    userId: user.id,
    context,
    results: result.normalized,
    interpretation: result.interpretation,
    promptVersion: result.promptVersion,
    retestDueAt: result.retestDueAt,
    drawDate: context.drawDate,
  });

  return NextResponse.json({ reportId: report.id, interpretation: result.interpretation });
}
