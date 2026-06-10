import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyPlayers } from "@/lib/db/schema";
import { normaliseEmail } from "@/lib/validation";
import { rateLimitOr429 } from "@/lib/rate-limit/ip-rate-limit";
import { mintFantasyToken } from "@/lib/fantasy/auth";
import { sendFantasyMagicLinkEmail } from "@/lib/fantasy/emails";

export const runtime = "nodejs";

/**
 * POST /api/fantasy/auth/request — sign-in link for returning players.
 * Always answers "check your inbox" on a valid address; whether an
 * account exists is never leaked. Links only go to known players —
 * new players come through /api/fantasy/signup with a team attached.
 */
export async function POST(request: Request) {
  const limited = await rateLimitOr429(request, {
    namespace: "fantasy-auth-request",
    tokens: 5,
    window: "10 m",
  });
  if (limited) return limited;

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const email = normaliseEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    const [player] = await db.select().from(fantasyPlayers).where(eq(fantasyPlayers.email, email));
    if (player && !player.deletedAt) {
      const { rawToken } = await mintFantasyToken(email, "login");
      await sendFantasyMagicLinkEmail({
        to: email,
        firstName: player.firstName,
        rawToken,
        teamName: "your team",
      });
    }
  } catch (error) {
    console.error("[fantasy/auth/request] failed:", error);
  }

  return NextResponse.json({ ok: true });
}
