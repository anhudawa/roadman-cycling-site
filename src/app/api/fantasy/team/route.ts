import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  fantasyCaptainPicks,
  fantasyRiders,
  fantasyTeams,
  fantasyTeamStageScores,
  fantasyTeamTotals,
  fantasyPlayers,
} from "@/lib/db/schema";
import { getFantasySessionFromRequest } from "@/lib/fantasy/auth";
import {
  getChips,
  getPlayerByEmail,
  getSquadAsOfStage,
  getTransferLedger,
  isPreTour,
  loadGameConfig,
  nextOpenStage,
  deadlineForStage,
  replaceSquadPreTour,
  leaguesForPlayer,
  audit,
} from "@/lib/fantasy/queries";
import { transferBudget, validateSquad } from "@/lib/fantasy/rules";

export const runtime = "nodejs";

async function resolveTeam(request: Request) {
  const session = getFantasySessionFromRequest(request);
  if (!session) return { error: NextResponse.json({ error: "Sign in first." }, { status: 401 }) };
  const player = await getPlayerByEmail(session.email);
  if (!player || player.deletedAt) {
    return { error: NextResponse.json({ error: "No player found." }, { status: 404 }) };
  }
  const [team] = await db.select().from(fantasyTeams).where(eq(fantasyTeams.playerId, player.id));
  if (!team) return { error: NextResponse.json({ error: "No team yet." }, { status: 404 }) };
  return { session, player, team };
}

/** GET /api/fantasy/team — the logged-in dashboard payload. */
export async function GET(request: Request) {
  const resolved = await resolveTeam(request);
  if ("error" in resolved) return resolved.error;
  const { player, team } = resolved;

  const config = await loadGameConfig();
  const openStage = await nextOpenStage();
  const targetStage = openStage?.stageNumber ?? 22;

  const [squad, ledger, chips, totalsRow, stageScores, captains, leagues] = await Promise.all([
    getSquadAsOfStage(team.id, targetStage),
    getTransferLedger(team.id),
    getChips(team.id),
    db.select().from(fantasyTeamTotals).where(eq(fantasyTeamTotals.teamId, team.id)),
    db
      .select({
        stageNumber: fantasyTeamStageScores.stageNumber,
        points: fantasyTeamStageScores.points,
        breakdown: fantasyTeamStageScores.breakdown,
        captainRiderId: fantasyTeamStageScores.captainRiderId,
      })
      .from(fantasyTeamStageScores)
      .where(eq(fantasyTeamStageScores.teamId, team.id)),
    db.select().from(fantasyCaptainPicks).where(eq(fantasyCaptainPicks.teamId, team.id)),
    leaguesForPlayer(player.id),
  ]);

  return NextResponse.json({
    team: { id: team.id, name: team.name },
    player: {
      id: player.id,
      firstName: player.firstName,
      email: player.email,
      verified: !!player.verifiedAt,
    },
    preTour: await isPreTour(),
    openStage: openStage
      ? {
          stageNumber: openStage.stageNumber,
          deadline: deadlineForStage(openStage, config.pickingDeadlineIso).toISOString(),
        }
      : null,
    squad,
    captainByStage: Object.fromEntries(captains.map((c) => [c.stageNumber, c.riderId])),
    transferBudget: openStage ? transferBudget(ledger, openStage.stageNumber, config) : null,
    chips: {
      enabled: config.chips,
      played: chips.map((c) => ({ chip: c.chip, stageNumber: c.stageNumber })),
    },
    totals: totalsRow[0] ?? null,
    stageScores,
    leagues,
  });
}

/**
 * PUT /api/fantasy/team — pre-Tour squad replacement (unlimited free
 * edits until the Stage 1 deadline). In-Tour changes go through
 * /api/fantasy/transfer, which enforces the transfer economy.
 */
export async function PUT(request: Request) {
  const resolved = await resolveTeam(request);
  if ("error" in resolved) return resolved.error;
  const { team, player } = resolved;

  if (!(await isPreTour())) {
    return NextResponse.json(
      { error: "The Tour is rolling — use transfers to change your team now." },
      { status: 400 },
    );
  }

  let body: { riderIds?: unknown; teamName?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  if (!Array.isArray(body.riderIds) || body.riderIds.some((id) => typeof id !== "number")) {
    return NextResponse.json({ error: "Squad must be a list of rider ids." }, { status: 400 });
  }
  const riderIds = body.riderIds as number[];

  const config = await loadGameConfig();
  const riders = riderIds.length
    ? await db
        .select({
          id: fantasyRiders.id,
          price: fantasyRiders.price,
          proTeamId: fantasyRiders.proTeamId,
          status: fantasyRiders.status,
        })
        .from(fantasyRiders)
        .where(inArray(fantasyRiders.id, riderIds))
    : [];
  if (riders.length !== riderIds.length) {
    return NextResponse.json({ error: "One of those riders doesn't exist." }, { status: 400 });
  }
  const verdict = validateSquad(riders, config);
  if (!verdict.valid) {
    return NextResponse.json({ error: verdict.errors[0].message, errors: verdict.errors }, { status: 400 });
  }

  await replaceSquadPreTour(team.id, riderIds);
  if (typeof body.teamName === "string" && body.teamName.trim()) {
    await db
      .update(fantasyTeams)
      .set({ name: body.teamName.trim().slice(0, 60) })
      .where(eq(fantasyTeams.id, team.id));
  }
  await audit(player.email, "team.pre_tour_edit", "team", String(team.id), { riderIds });

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/fantasy/team — GDPR deletion: anonymise the player,
 * keep the team row so mini-league history stays intact (Section 9).
 */
export async function DELETE(request: Request) {
  const resolved = await resolveTeam(request);
  if ("error" in resolved) return resolved.error;
  const { session, player, team } = resolved;
  if (session.scope !== "full") {
    return NextResponse.json(
      { error: "Account deletion needs a full sign-in — use the email link from /fantasy." },
      { status: 403 },
    );
  }

  await db
    .update(fantasyPlayers)
    .set({
      email: `deleted-${player.id}@anonymised.invalid`,
      firstName: "Departed rider",
      country: null,
      riderPersona: null,
      beehiivSubscriberId: null,
      deletedAt: new Date(),
    })
    .where(eq(fantasyPlayers.id, player.id));
  await audit(`player-${player.id}`, "player.deleted", "player", String(player.id));

  const response = NextResponse.json({ ok: true, teamPreserved: team.id });
  response.cookies.set("fantasy_session", "", { path: "/", maxAge: 0 });
  return response;
}
