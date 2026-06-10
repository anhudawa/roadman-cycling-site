import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyTeams } from "@/lib/db/schema";
import { getFantasySessionFromRequest } from "@/lib/fantasy/auth";
import {
  deadlineForStage,
  getPlayerByEmail,
  getSquadAsOfStage,
  nextOpenStage,
  setCaptain,
  audit,
} from "@/lib/fantasy/queries";
import { validateCaptainPick } from "@/lib/fantasy/rules";

export const runtime = "nodejs";

/**
 * POST /api/fantasy/captain — set the captain for the next open stage.
 * Changeable as often as you like until the stage rolls out; the pick
 * then scores double for that stage only.
 */
export async function POST(request: Request) {
  const session = getFantasySessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const player = await getPlayerByEmail(session.email);
  if (!player || player.deletedAt) return NextResponse.json({ error: "No player found." }, { status: 404 });
  const [team] = await db.select().from(fantasyTeams).where(eq(fantasyTeams.playerId, player.id));
  if (!team) return NextResponse.json({ error: "No team yet." }, { status: 404 });

  let body: { riderId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  if (typeof body.riderId !== "number") {
    return NextResponse.json({ error: "riderId is required." }, { status: 400 });
  }

  const openStage = await nextOpenStage();
  if (!openStage) {
    return NextResponse.json({ error: "The Tour is over." }, { status: 400 });
  }

  const squad = await getSquadAsOfStage(team.id, openStage.stageNumber);
  const verdict = validateCaptainPick(
    body.riderId,
    squad.map((r) => r.riderId),
    deadlineForStage(openStage),
    new Date(),
  );
  if (!verdict.valid) {
    return NextResponse.json({ error: verdict.errors[0].message, errors: verdict.errors }, { status: 400 });
  }

  await setCaptain(team.id, openStage.stageNumber, body.riderId);
  await audit(player.email, "team.captain", "team", String(team.id), {
    stageNumber: openStage.stageNumber,
    riderId: body.riderId,
  });

  return NextResponse.json({ ok: true, stageNumber: openStage.stageNumber });
}
