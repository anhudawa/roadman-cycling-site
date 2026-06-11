import { NextResponse } from "next/server";
import { requireAdminJson, readJsonBody } from "../_lib/guard";
import { previewReset, performReset, type ResetScope } from "@/lib/fantasy/reset";
import { listStages, deadlineForStage } from "@/lib/fantasy/queries";

export const runtime = "nodejs";

function parseScope(value: unknown): ResetScope | null {
  return value === "scoring" || value === "demo-full" ? value : null;
}

/**
 * The reset refuses to run once the real Tour is rolling — after the
 * Stage 1 deadline this would destroy live standings. The demo window
 * is pre-Tour by definition.
 */
async function tourHasStarted(): Promise<boolean> {
  const stages = await listStages();
  const stage1 = stages.find((s) => s.stageNumber === 1);
  return !!stage1 && deadlineForStage(stage1) <= new Date();
}

/** POST /api/admin/fantasy/reset { scope, dryRun?, confirm? } */
export async function POST(request: Request) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const body = await readJsonBody(request);
  const scope = parseScope(body?.scope);
  if (!scope) {
    return NextResponse.json({ error: "scope must be 'scoring' or 'demo-full'." }, { status: 400 });
  }

  if (body?.dryRun === true) {
    return NextResponse.json({ ok: true, preview: await previewReset(scope) });
  }

  if (body?.confirm !== "RESET") {
    return NextResponse.json(
      { error: "Type RESET in the confirmation box to run this. It cannot be undone." },
      { status: 400 },
    );
  }
  if (await tourHasStarted()) {
    return NextResponse.json(
      { error: "Stage 1 has rolled out — the reset is locked. Live standings are never wiped." },
      { status: 409 },
    );
  }

  const result = await performReset(scope, gate.user.email);
  return NextResponse.json({ ok: true, deleted: result });
}
