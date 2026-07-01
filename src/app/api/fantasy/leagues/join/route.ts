import { NextResponse } from "next/server";
import { clampString } from "@/lib/validation";
import { getFantasySessionFromRequest } from "@/lib/fantasy/auth";
import { getPlayerByEmail, joinLeague, audit } from "@/lib/fantasy/queries";

export const runtime = "nodejs";

/** POST /api/fantasy/leagues/join — join by 6-character invite code. */
export async function POST(request: Request) {
  const session = getFantasySessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const player = await getPlayerByEmail(session.email);
  if (!player || player.deletedAt) return NextResponse.json({ error: "No player found." }, { status: 404 });

  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const code = clampString(body.code, 6)?.toUpperCase();
  if (!code || code.length !== 6) {
    return NextResponse.json({ error: "League codes are 6 characters." }, { status: 400 });
  }

  const league = await joinLeague(code, player.id);
  if (!league) {
    return NextResponse.json({ error: "No league with that code. Check it with whoever shared it." }, { status: 404 });
  }
  await audit(player.email, "league.join", "league", String(league.id));

  return NextResponse.json({ ok: true, name: league.name, code: league.code });
}
