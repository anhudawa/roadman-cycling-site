import { NextResponse, type NextRequest } from "next/server";
import { and, eq, isNotNull, isNull, lt, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyLeagueMembers, fantasyLeagues, fantasyPlayers, fantasyTeams } from "@/lib/db/schema";
import { verifyBearer } from "@/lib/security/bearer";
import { mintDeepLinkToken } from "@/lib/fantasy/auth";
import { renderLeagueNudgeEmail, sendRenderedEmail } from "@/lib/fantasy/emails";
import { audit } from "@/lib/fantasy/queries";

export const runtime = "nodejs";
export const maxDuration = 300;

const NUDGE_AFTER_HOURS = 48;
const BATCH_LIMIT = 300;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return verifyBearer(req.headers.get("authorization"), secret);
}

/**
 * GET /api/cron/fantasy-lifecycle — daily from launch (June + July).
 *
 * Currently one job: the mini-league nudge (Section 5.3). Verified,
 * consented, non-demo players who created a team 48+ hours ago and
 * still aren't in any league get one email pointing at league setup
 * and the Roadman Clubhouse code. `league_nudge_sent_at` guarantees
 * one nudge per player, ever.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [clubhouse] = await db
    .select({ code: fantasyLeagues.code })
    .from(fantasyLeagues)
    .where(eq(fantasyLeagues.isOfficial, true))
    .limit(1);

  const cutoff = new Date(Date.now() - NUDGE_AFTER_HOURS * 3_600_000);
  const memberPlayerIds = db
    .select({ playerId: fantasyLeagueMembers.playerId })
    .from(fantasyLeagueMembers);

  const due = await db
    .select({
      playerId: fantasyPlayers.id,
      email: fantasyPlayers.email,
      firstName: fantasyPlayers.firstName,
      teamName: fantasyTeams.name,
    })
    .from(fantasyPlayers)
    .innerJoin(fantasyTeams, eq(fantasyTeams.playerId, fantasyPlayers.id))
    .where(
      and(
        isNotNull(fantasyPlayers.verifiedAt),
        isNotNull(fantasyPlayers.consentAt),
        isNull(fantasyPlayers.deletedAt),
        eq(fantasyPlayers.isDemo, false),
        isNull(fantasyPlayers.leagueNudgeSentAt),
        lt(fantasyPlayers.createdAt, cutoff),
        notInArray(fantasyPlayers.id, memberPlayerIds),
      ),
    )
    .limit(BATCH_LIMIT);

  let sent = 0;
  for (const player of due) {
    const rendered = renderLeagueNudgeEmail({
      firstName: player.firstName,
      teamName: player.teamName,
      deepLinkToken: mintDeepLinkToken(player.email),
      clubhouseCode: clubhouse?.code ?? "RDMNCC",
    });
    const ok = await sendRenderedEmail(player.email, rendered, "fantasy-league-nudge");
    // Mark even on failure: one attempt per player. A transient Resend
    // outage costing a few nudges beats double-nudging anyone.
    await db
      .update(fantasyPlayers)
      .set({ leagueNudgeSentAt: new Date() })
      .where(eq(fantasyPlayers.id, player.playerId));
    if (ok) sent++;
  }

  if (sent > 0) {
    await audit("cron", "lifecycle.league_nudge", "players", null, { sent, due: due.length });
  }
  return NextResponse.json({ ok: true, due: due.length, sent });
}
