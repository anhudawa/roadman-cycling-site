import { NextResponse } from "next/server";
import { clampString } from "@/lib/validation";
import { rateLimitOr429 } from "@/lib/rate-limit/ip-rate-limit";
import { getFantasySessionFromRequest } from "@/lib/fantasy/auth";
import { createLeague, getPlayerByEmail, leaguesForPlayer, audit } from "@/lib/fantasy/queries";

export const runtime = "nodejs";

/** GET /api/fantasy/leagues — the signed-in player's leagues. */
export async function GET(request: Request) {
  const session = getFantasySessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const player = await getPlayerByEmail(session.email);
  if (!player) return NextResponse.json({ error: "No player found." }, { status: 404 });
  return NextResponse.json({ leagues: await leaguesForPlayer(player.id) });
}

/**
 * POST /api/fantasy/leagues — create a mini-league. Returns the
 * 6-character invite code and share link (the viral mechanic).
 */
export async function POST(request: Request) {
  const limited = await rateLimitOr429(request, {
    namespace: "fantasy-league-create",
    tokens: 10,
    window: "10 m",
  });
  if (limited) return limited;

  const session = getFantasySessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const player = await getPlayerByEmail(session.email);
  if (!player || player.deletedAt) return NextResponse.json({ error: "No player found." }, { status: 404 });

  let body: { name?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const name = clampString(body.name, 60);
  if (!name) return NextResponse.json({ error: "Give your league a name." }, { status: 400 });

  const league = await createLeague(name, player.id);
  await audit(player.email, "league.create", "league", String(league.id), { name });

  return NextResponse.json({
    ok: true,
    code: league.code,
    shareUrl: `/fantasy/league/${league.code}`,
  });
}
