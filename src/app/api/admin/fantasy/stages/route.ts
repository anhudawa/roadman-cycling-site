import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyStages } from "@/lib/db/schema";
import { audit } from "@/lib/fantasy/queries";
import { checkContent } from "@/lib/fantasy/content-guard";
import { parseCestDateTime } from "@/lib/fantasy/admin";
import { requireAdminJson, readJsonBody } from "../_lib/guard";

/** Update a stage's official start time (CEST) and/or its Roadman take. */
export async function PATCH(request: Request) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const stageNumber = typeof body.stageNumber === "number" ? body.stageNumber : NaN;
  if (!Number.isInteger(stageNumber) || stageNumber < 1 || stageNumber > 21) {
    return NextResponse.json({ error: "stageNumber must be 1–21" }, { status: 400 });
  }

  const patch: { startTimeCest?: Date | null; roadmanTake?: string | null } = {};

  if ("startTimeCest" in body) {
    if (body.startTimeCest === null || body.startTimeCest === "") {
      patch.startTimeCest = null;
    } else if (typeof body.startTimeCest === "string") {
      const parsed = parseCestDateTime(body.startTimeCest);
      if (!parsed) {
        return NextResponse.json(
          { error: "startTimeCest must be YYYY-MM-DDTHH:mm (entered as CEST)" },
          { status: 400 },
        );
      }
      patch.startTimeCest = parsed;
    } else {
      return NextResponse.json({ error: "startTimeCest must be a string" }, { status: 400 });
    }
  }

  if ("roadmanTake" in body) {
    if (body.roadmanTake === null || (typeof body.roadmanTake === "string" && body.roadmanTake.trim() === "")) {
      patch.roadmanTake = null;
    } else if (typeof body.roadmanTake === "string") {
      const check = checkContent(body.roadmanTake);
      if (!check.ok) {
        return NextResponse.json(
          {
            error: "Roadman take rejected by the content guard",
            violations: check.violations.map((v) => v.detail),
          },
          { status: 422 },
        );
      }
      patch.roadmanTake = body.roadmanTake.trim();
    } else {
      return NextResponse.json({ error: "roadmanTake must be a string" }, { status: 400 });
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(fantasyStages)
    .set(patch)
    .where(eq(fantasyStages.stageNumber, stageNumber))
    .returning({ id: fantasyStages.id });
  if (!updated) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

  await audit(gate.user.email, "stage.update", "stage", String(stageNumber), {
    ...("startTimeCest" in patch
      ? { startTimeCest: patch.startTimeCest ? patch.startTimeCest.toISOString() : null }
      : {}),
    ...("roadmanTake" in patch ? { roadmanTake: patch.roadmanTake } : {}),
  });

  return NextResponse.json({ ok: true });
}
