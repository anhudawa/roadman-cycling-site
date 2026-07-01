import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  fantasyProTeams,
  fantasyRiders,
  fantasyStageResults,
  fantasyStages,
} from "@/lib/db/schema";
import { audit } from "@/lib/fantasy/queries";
import { isHttpUrl, parseStageResultPayload } from "@/lib/fantasy/admin";
import { requireAdminJson, readJsonBody } from "../../_lib/guard";

function parseStageParam(stage: string): number | null {
  const n = parseInt(stage, 10);
  return Number.isInteger(n) && n >= 1 && n <= 21 ? n : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ stage: string }> },
) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const { stage } = await params;
  const stageNumber = parseStageParam(stage);
  if (stageNumber === null) {
    return NextResponse.json({ error: "Stage must be 1–21" }, { status: 400 });
  }

  const [row] = await db
    .select()
    .from(fantasyStageResults)
    .where(eq(fantasyStageResults.stageNumber, stageNumber));
  return NextResponse.json({ result: row ?? null });
}

/** Save (upsert) the raw stage-result payload as a draft — step one of the two-step publish. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ stage: string }> },
) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const { stage } = await params;
  const stageNumber = parseStageParam(stage);
  if (stageNumber === null) {
    return NextResponse.json({ error: "Stage must be 1–21" }, { status: 400 });
  }

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const [stageRow] = await db
    .select({ id: fantasyStages.id })
    .from(fantasyStages)
    .where(eq(fantasyStages.stageNumber, stageNumber));
  if (!stageRow) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

  const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "";
  if (sourceUrl && !isHttpUrl(sourceUrl)) {
    return NextResponse.json({ error: "sourceUrl must be a valid http(s) URL" }, { status: 400 });
  }

  const riderRows = await db.select({ id: fantasyRiders.id }).from(fantasyRiders);
  const teamRows = await db.select({ id: fantasyProTeams.id }).from(fantasyProTeams);
  const parsed = parseStageResultPayload(body.payload, {
    stageNumber,
    riderIds: new Set(riderRows.map((r) => r.id)),
    proTeamIds: new Set(teamRows.map((t) => t.id)),
  });
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Validation failed", errors: parsed.errors },
      { status: 422 },
    );
  }

  const payload = parsed.data as unknown as Record<string, unknown>;
  const [existing] = await db
    .select()
    .from(fantasyStageResults)
    .where(eq(fantasyStageResults.stageNumber, stageNumber));

  let version: number;
  if (existing) {
    // Correcting an already-published stage bumps the version so the
    // regenerated scoring events are attributable to the new result.
    version = existing.status === "published" ? existing.version + 1 : existing.version;
    await db
      .update(fantasyStageResults)
      .set({
        payload,
        version,
        status: "draft",
        sourceUrl: sourceUrl || existing.sourceUrl,
        enteredBy: gate.user.email,
        updatedAt: new Date(),
      })
      .where(eq(fantasyStageResults.stageNumber, stageNumber));
  } else {
    version = 1;
    await db.insert(fantasyStageResults).values({
      stageNumber,
      payload,
      version,
      status: "draft",
      sourceUrl: sourceUrl || null,
      enteredBy: gate.user.email,
    });
  }

  await audit(gate.user.email, "results.save_draft", "stage", String(stageNumber), {
    version,
    finishers: parsed.data.finishers?.length ?? 0,
    abandons: parsed.data.abandons?.length ?? 0,
    correction: Boolean(existing && existing.status === "published"),
  });

  return NextResponse.json({ ok: true, version, status: "draft" });
}
