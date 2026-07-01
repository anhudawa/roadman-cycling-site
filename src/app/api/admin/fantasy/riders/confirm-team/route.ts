import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyProTeams, fantasyRiders } from "@/lib/db/schema";
import { audit } from "@/lib/fantasy/queries";
import { isHttpUrl } from "@/lib/fantasy/admin";
import { requireAdminJson, readJsonBody } from "../../_lib/guard";

/**
 * Official startlist confirmation for one pro team: flips every
 * provisional rider to confirmed with the announcement source recorded
 * (Section 6.2 lifecycle).
 */
export async function POST(request: Request) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const proTeamId = typeof body.proTeamId === "number" ? body.proTeamId : NaN;
  const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "";

  if (!Number.isInteger(proTeamId)) {
    return NextResponse.json({ error: "proTeamId is required" }, { status: 400 });
  }
  if (!sourceUrl || !isHttpUrl(sourceUrl)) {
    return NextResponse.json(
      { error: "A source URL for the official announcement is required" },
      { status: 400 },
    );
  }

  const [team] = await db
    .select({ id: fantasyProTeams.id, name: fantasyProTeams.name })
    .from(fantasyProTeams)
    .where(eq(fantasyProTeams.id, proTeamId));
  if (!team) return NextResponse.json({ error: "Unknown pro team" }, { status: 404 });

  const confirmed = await db
    .update(fantasyRiders)
    .set({
      status: "confirmed",
      confirmedSource: sourceUrl,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(fantasyRiders.proTeamId, proTeamId), eq(fantasyRiders.status, "provisional")))
    .returning({ id: fantasyRiders.id });

  await audit(gate.user.email, "riders.confirm_team", "pro_team", String(proTeamId), {
    teamName: team.name,
    sourceUrl,
    confirmed: confirmed.length,
  });

  return NextResponse.json({ ok: true, confirmed: confirmed.length });
}
