import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyStageResults } from "@/lib/db/schema";
import { audit, previewStageScoring } from "@/lib/fantasy/queries";
import { requireAdminJson, readJsonBody } from "../../_lib/guard";

/** Step two of the publish flow: compute scoring events without storing them. */
export async function POST(request: Request) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const stageNumber = typeof body.stageNumber === "number" ? body.stageNumber : NaN;
  if (!Number.isInteger(stageNumber) || stageNumber < 1 || stageNumber > 21) {
    return NextResponse.json({ error: "stageNumber must be 1–21" }, { status: 400 });
  }

  let events;
  try {
    events = await previewStageScoring(stageNumber);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Mark the draft as eyeballed so the results index shows progress.
  await db
    .update(fantasyStageResults)
    .set({ status: "previewed", updatedAt: new Date() })
    .where(
      and(
        eq(fantasyStageResults.stageNumber, stageNumber),
        eq(fantasyStageResults.status, "draft"),
      ),
    );

  await audit(gate.user.email, "scoring.preview", "stage", String(stageNumber), {
    events: events.length,
  });

  return NextResponse.json({ events });
}
