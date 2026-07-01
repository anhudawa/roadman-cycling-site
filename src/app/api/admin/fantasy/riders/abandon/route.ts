import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyRiders } from "@/lib/db/schema";
import { audit } from "@/lib/fantasy/queries";
import { ABANDON_REASONS, type AbandonReason } from "@/lib/fantasy/admin";
import { requireAdminJson, readJsonBody } from "../../_lib/guard";

/**
 * Manual abandon marker (DNS/DNF/HD/DSQ). The normal path is the
 * abandons section of the stage-results publish; this covers news that
 * lands between stages (e.g. a pre-stage DNS announcement).
 */
export async function POST(request: Request) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const riderId = typeof body.riderId === "number" ? body.riderId : NaN;
  const stageNumber = typeof body.stageNumber === "number" ? body.stageNumber : NaN;
  const reason = typeof body.reason === "string" ? body.reason : "";

  if (!Number.isInteger(riderId)) {
    return NextResponse.json({ error: "riderId is required" }, { status: 400 });
  }
  if (!Number.isInteger(stageNumber) || stageNumber < 1 || stageNumber > 21) {
    return NextResponse.json({ error: "stageNumber must be 1–21" }, { status: 400 });
  }
  if (!ABANDON_REASONS.includes(reason as AbandonReason)) {
    return NextResponse.json(
      { error: `reason must be one of ${ABANDON_REASONS.join("/")}` },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(fantasyRiders)
    .set({ status: "abandoned", abandonedAfterStage: stageNumber, updatedAt: new Date() })
    .where(eq(fantasyRiders.id, riderId))
    .returning({ id: fantasyRiders.id, name: fantasyRiders.name });
  if (!updated) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

  await audit(gate.user.email, "rider.abandon", "rider", String(riderId), {
    name: updated.name,
    stageNumber,
    reason,
  });

  return NextResponse.json({ ok: true });
}
