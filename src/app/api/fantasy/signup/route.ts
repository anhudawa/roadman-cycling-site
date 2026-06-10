import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyPlayers, fantasyRiders, fantasyTeams } from "@/lib/db/schema";
import { normaliseEmail, clampString } from "@/lib/validation";
import { rateLimitOr429 } from "@/lib/rate-limit/ip-rate-limit";
import { mintFantasyToken } from "@/lib/fantasy/auth";
import { sendFantasyMagicLinkEmail } from "@/lib/fantasy/emails";
import { loadGameConfig, replaceSquadPreTour, isPreTour, audit } from "@/lib/fantasy/queries";
import { validateSquad } from "@/lib/fantasy/rules";

export const runtime = "nodejs";

/**
 * POST /api/fantasy/signup — the email gate (Section 5.1).
 *
 * Fires when the player hits "Save your team" after building in the
 * open (ungated) builder. Creates the player (unverified), stores the
 * draft squad, and sends the magic link that locks it in. Verification
 * is the double-opt-in; Beehiiv sync happens on verify, not here.
 *
 * If the email already belongs to a VERIFIED player, nothing is
 * changed (someone who knows your email must not be able to overwrite
 * your team) — we send a sign-in link instead and return the same
 * "check your inbox" response. No enumeration.
 */
export async function POST(request: Request) {
  const limited = await rateLimitOr429(request, {
    namespace: "fantasy-signup",
    tokens: 5,
    window: "10 m",
  });
  if (limited) return limited;

  let body: {
    email?: unknown;
    firstName?: unknown;
    country?: unknown;
    riderPersona?: unknown;
    consent?: unknown;
    teamName?: unknown;
    riderIds?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const email = normaliseEmail(body.email);
  const firstName = clampString(body.firstName, 60);
  const teamName = clampString(body.teamName, 60);
  const country = clampString(body.country, 60);
  const riderPersona = clampString(body.riderPersona, 40);
  if (!email) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!firstName) return NextResponse.json({ error: "Please tell us your first name." }, { status: 400 });
  if (!teamName) return NextResponse.json({ error: "Give your team a name." }, { status: 400 });
  if (body.consent !== true) {
    return NextResponse.json(
      { error: "Tick the consent box to get the daily Tour email — that's how the game is played." },
      { status: 400 },
    );
  }
  if (!Array.isArray(body.riderIds) || body.riderIds.some((id) => typeof id !== "number")) {
    return NextResponse.json({ error: "Squad must be a list of rider ids." }, { status: 400 });
  }
  const riderIds = body.riderIds as number[];

  // Server-side squad validation — the client check is just UX.
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
  if (!(await isPreTour())) {
    return NextResponse.json(
      { error: "Team creation closed when Stage 1 rolled out of Barcelona." },
      { status: 400 },
    );
  }

  try {
    const [existing] = await db.select().from(fantasyPlayers).where(eq(fantasyPlayers.email, email));

    if (existing?.verifiedAt) {
      // Verified account: don't touch the team, just send a sign-in link.
      const { rawToken } = await mintFantasyToken(email, "login");
      await sendFantasyMagicLinkEmail({ to: email, firstName: existing.firstName, rawToken, teamName });
      return NextResponse.json({ ok: true });
    }

    const playerValues = {
      email,
      firstName,
      country,
      riderPersona,
      consentAt: new Date(),
    };
    let playerId: number;
    if (existing) {
      await db.update(fantasyPlayers).set(playerValues).where(eq(fantasyPlayers.id, existing.id));
      playerId = existing.id;
    } else {
      const [created] = await db
        .insert(fantasyPlayers)
        .values(playerValues)
        .returning({ id: fantasyPlayers.id });
      playerId = created.id;
    }

    const [existingTeam] = await db
      .select({ id: fantasyTeams.id })
      .from(fantasyTeams)
      .where(eq(fantasyTeams.playerId, playerId));
    let teamId: number;
    if (existingTeam) {
      await db.update(fantasyTeams).set({ name: teamName }).where(eq(fantasyTeams.id, existingTeam.id));
      teamId = existingTeam.id;
    } else {
      const [created] = await db
        .insert(fantasyTeams)
        .values({ playerId, name: teamName })
        .returning({ id: fantasyTeams.id });
      teamId = created.id;
    }
    await replaceSquadPreTour(teamId, riderIds);

    const { rawToken } = await mintFantasyToken(email, "login");
    await sendFantasyMagicLinkEmail({ to: email, firstName, rawToken, teamName });
    await audit(email, "player.signup", "team", String(teamId), { riderIds, teamName });
  } catch (error) {
    console.error("[fantasy/signup] failed:", error);
    // Same response either way — "check your inbox" is the UX contract.
  }

  return NextResponse.json({ ok: true });
}
