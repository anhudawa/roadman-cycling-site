import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyPlayers } from "@/lib/db/schema";
import {
  consumeFantasyToken,
  verifyDeepLinkToken,
  signFantasySessionToken,
  FANTASY_SESSION_COOKIE,
  FANTASY_SESSION_COOKIE_OPTS,
  type SessionScope,
} from "@/lib/fantasy/auth";
import { syncPlayerToBeehiiv, sendCapiLeadEvent } from "@/lib/fantasy/marketing";
import { audit, joinOfficialLeague } from "@/lib/fantasy/queries";

export const runtime = "nodejs";

/** Only ever redirect within the fantasy game — no open-redirect surface. */
function safeNext(next: string | null): string {
  if (next && next.startsWith("/fantasy")) return next;
  return "/fantasy/team";
}

/**
 * GET /api/fantasy/auth/verify?token=...&next=/fantasy/team
 *
 * Two token shapes land here:
 *  - DB-backed login tokens (single-use, 24h) from "Save your team" /
 *    sign-in. First successful click = double-opt-in: marks the player
 *    verified and fires the Beehiiv sync + Meta CAPI Lead event.
 *  - Stateless deep-link JWTs (multi-use, 7d, play scope) from the
 *    daily stage email CTA — one tap into the logged-in team page.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const rawToken = url.searchParams.get("token")?.trim() ?? "";
  const next = safeNext(url.searchParams.get("next"));
  const origin = url.origin;

  if (!rawToken) {
    return NextResponse.redirect(`${origin}/fantasy?auth=invalid`);
  }

  let email: string | null = null;
  let scope: SessionScope = "full";
  let isFirstVerification = false;

  // JWT-shaped tokens (two dots) are stateless deep links; try them first.
  if (rawToken.split(".").length === 3) {
    const deepLink = verifyDeepLinkToken(rawToken);
    if (deepLink) {
      email = deepLink.email;
      scope = "play";
    }
  }
  if (!email) {
    try {
      const result = await consumeFantasyToken(rawToken);
      if (result) {
        email = result.email;
        scope = result.scope;
        isFirstVerification = result.isFirstVerification;
      }
    } catch (error) {
      console.error("[fantasy/verify] token consumption failed:", error);
    }
  }
  if (!email) {
    return NextResponse.redirect(`${origin}/fantasy?auth=invalid`);
  }

  if (isFirstVerification) {
    const [player] = await db.select().from(fantasyPlayers).where(eq(fantasyPlayers.email, email));
    if (player) {
      // Fire-and-forget: the player is mid-redirect. Failures land in
      // the retry queue (beehiivSyncedAt stays null; cron sweeps it).
      // Demo-window players never reach Beehiiv or Meta.
      if (!player.isDemo) {
        void syncPlayerToBeehiiv(player);
        void sendCapiLeadEvent(player);
      }
      // FPL-style: everyone lands in the official league automatically —
      // instant social proof instead of an empty leagues panel.
      void joinOfficialLeague(player.id);
      void audit(email, "player.verified", "player", String(player.id));
    }
  }

  const jwt = signFantasySessionToken(email, scope);
  const response = NextResponse.redirect(`${origin}${next}${isFirstVerification ? "?welcome=1" : ""}`);
  response.cookies.set(FANTASY_SESSION_COOKIE, jwt, FANTASY_SESSION_COOKIE_OPTS);
  return response;
}
