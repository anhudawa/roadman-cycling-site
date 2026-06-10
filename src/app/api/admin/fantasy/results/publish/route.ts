import { NextResponse } from "next/server";
import { publishStageScoring } from "@/lib/fantasy/queries";
import { requireAdminJson, readJsonBody } from "../../_lib/guard";

/**
 * Final step of the publish flow: wipes and rewrites the stage's
 * scoring events, recomputes every team's stage score, and rebuilds the
 * leaderboard. publishStageScoring writes its own audit row.
 */
export async function POST(request: Request) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const stageNumber = typeof body.stageNumber === "number" ? body.stageNumber : NaN;
  if (!Number.isInteger(stageNumber) || stageNumber < 1 || stageNumber > 21) {
    return NextResponse.json({ error: "stageNumber must be 1–21" }, { status: 400 });
  }

  try {
    const summary = await publishStageScoring(stageNumber, gate.user.email);
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
