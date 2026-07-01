import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyRiders, fantasyTeams } from "@/lib/db/schema";
import { getFantasySessionFromRequest } from "@/lib/fantasy/auth";
import {
  applyTransfer,
  deadlineForStage,
  getChips,
  getPlayerByEmail,
  getSquadAsOfStage,
  getTransferLedger,
  isPreTour,
  loadGameConfig,
  nextOpenStage,
  audit,
} from "@/lib/fantasy/queries";
import { validateTransfer, type SelectableRider } from "@/lib/fantasy/rules";

export const runtime = "nodejs";

/**
 * POST /api/fantasy/transfer — one in-Tour transfer (Section 4.3).
 *
 * The rules module decides what it costs: a standard transfer (8 for
 * the Tour), an unlocked rest-day bonus, or a free grace swap when the
 * outgoing rider was flagged DNS before Stage 1. Pre-Tour the squad is
 * edited wholesale via PUT /api/fantasy/team instead.
 */
export async function POST(request: Request) {
  const session = getFantasySessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const player = await getPlayerByEmail(session.email);
  if (!player || player.deletedAt) return NextResponse.json({ error: "No player found." }, { status: 404 });
  const [team] = await db.select().from(fantasyTeams).where(eq(fantasyTeams.playerId, player.id));
  if (!team) return NextResponse.json({ error: "No team yet." }, { status: 404 });

  let body: { riderOutId?: unknown; riderInId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  if (typeof body.riderOutId !== "number" || typeof body.riderInId !== "number") {
    return NextResponse.json({ error: "riderOutId and riderInId are required." }, { status: 400 });
  }

  if (await isPreTour()) {
    return NextResponse.json(
      { error: "Before Stage 1 you can rebuild your whole team for free — no transfers needed." },
      { status: 400 },
    );
  }

  const openStage = await nextOpenStage();
  if (!openStage) {
    return NextResponse.json({ error: "The Tour is over — transfers are closed." }, { status: 400 });
  }

  const config = await loadGameConfig();
  const [squad, ledger, chips, riderInRows] = await Promise.all([
    getSquadAsOfStage(team.id, openStage.stageNumber),
    getTransferLedger(team.id),
    getChips(team.id),
    db
      .select({
        id: fantasyRiders.id,
        price: fantasyRiders.price,
        proTeamId: fantasyRiders.proTeamId,
        status: fantasyRiders.status,
      })
      .from(fantasyRiders)
      .where(eq(fantasyRiders.id, body.riderInId)),
  ]);
  if (riderInRows.length === 0) {
    return NextResponse.json({ error: "That rider doesn't exist." }, { status: 400 });
  }

  const currentSquad: SelectableRider[] = squad.map((r) => ({
    id: r.riderId,
    price: r.price,
    proTeamId: r.proTeamId,
    status: r.status,
  }));
  const riderOut = currentSquad.find((r) => r.id === body.riderOutId);

  // Grace window: a rider flagged DNS before the race can be swapped
  // free while Stage 1/2 deadlines are still open (Section 4.3).
  const isGrace = riderOut?.status === "dns" && openStage.stageNumber <= 2;
  const wildcardActive = chips.some(
    (c) => c.chip === "wildcard" && c.stageNumber === openStage.stageNumber,
  );

  const decision = validateTransfer(
    {
      riderOutId: body.riderOutId,
      riderInId: body.riderInId,
      currentSquad,
      riderIn: riderInRows[0],
      effectiveFromStage: openStage.stageNumber,
      priorTransfers: ledger,
      stageStartTime: deadlineForStage(openStage, config.pickingDeadlineIso),
      now: new Date(),
      isPreTour: false,
      isGrace,
      wildcardActive,
    },
    config,
  );
  if (!decision.valid) {
    return NextResponse.json({ error: decision.errors[0].message, errors: decision.errors }, { status: 400 });
  }

  await applyTransfer({
    teamId: team.id,
    riderOutId: body.riderOutId,
    riderInId: body.riderInId,
    effectiveFromStage: openStage.stageNumber,
    kind: decision.kind === "pre_tour" ? "grace" : decision.kind,
  });
  await audit(player.email, "team.transfer", "team", String(team.id), {
    riderOutId: body.riderOutId,
    riderInId: body.riderInId,
    effectiveFromStage: openStage.stageNumber,
    kind: decision.kind,
  });

  return NextResponse.json({ ok: true, kind: decision.kind, effectiveFromStage: openStage.stageNumber });
}
