import { NextResponse, type NextRequest } from "next/server";
import {
  consumeAskAuthToken,
  signAskSessionToken,
  recordBeehiivSync,
  ASK_SESSION_COOKIE,
  ASK_SESSION_COOKIE_OPTS,
} from "@/lib/ask-auth/auth";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";

export const runtime = "nodejs";

/**
 * GET /api/ask/auth/verify?token=...
 *
 * Consumes the magic-link token, sets the `ask_session` cookie on the
 * redirect response, and on first authentication syncs the email to
 * Beehiiv tagged "ask-roadman". Invalid / expired / already-used
 * tokens redirect back to /ask with ?auth=invalid so the gate can
 * surface a clear error.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const rawToken = url.searchParams.get("token")?.trim() ?? "";
  const origin = url.origin;

  if (!rawToken) {
    return NextResponse.redirect(`${origin}/ask?auth=invalid`);
  }

  let result: { email: string; isFirstAuth: boolean } | null;
  try {
    result = await consumeAskAuthToken(rawToken);
  } catch (err) {
    console.error("[ask-auth/verify] token consumption failed:", err);
    return NextResponse.redirect(`${origin}/ask?auth=invalid`);
  }
  if (!result) {
    return NextResponse.redirect(`${origin}/ask?auth=invalid`);
  }

  // Fire-and-forget Beehiiv sync on first auth. We don't await the
  // call because the user is mid-redirect and a slow Beehiiv response
  // shouldn't delay the chat UI loading. Failure is logged inside the
  // helper and the row can be re-synced from a cron later if needed.
  if (result.isFirstAuth) {
    void syncFirstAuthToBeehiiv(result.email);
  }

  const { jwt } = signAskSessionToken(result.email);
  const response = NextResponse.redirect(`${origin}/ask?auth=ok`);
  response.cookies.set(ASK_SESSION_COOKIE, jwt, ASK_SESSION_COOKIE_OPTS);
  return response;
}

async function syncFirstAuthToBeehiiv(email: string): Promise<void> {
  try {
    const r = await subscribeToBeehiiv({
      email,
      tags: ["ask-roadman"],
      sendWelcomeEmail: false,
      utm: {
        source: "website",
        medium: "ask-roadman",
        campaign: "ask-roadman-gate",
      },
    });
    await recordBeehiivSync(email, r.subscriberId);
  } catch (err) {
    console.error("[ask-auth/verify] beehiiv sync failed:", err);
  }
}
