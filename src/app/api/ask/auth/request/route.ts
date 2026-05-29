import { NextResponse } from "next/server";
import { normaliseEmail } from "@/lib/validation";
import { rateLimitOr429 } from "@/lib/rate-limit/ip-rate-limit";
import { mintAskAuthToken } from "@/lib/ask-auth/auth";
import { sendAskMagicLinkEmail } from "@/lib/ask-auth/email";

export const runtime = "nodejs";

/**
 * POST /api/ask/auth/request
 *
 * Request a magic-link sign-in for Ask Roadman. Always returns 200 on
 * a valid email — no enumeration, no "subscriber not found". The lead-
 * gen funnel wants every valid address to land in Beehiiv, so first-
 * time addresses are accepted and synced on verify.
 *
 * Per-IP throttle prevents a bad actor from blasting magic links to
 * harvested email lists. The bcrypt cost in mintAskAuthToken is also a
 * natural rate ceiling.
 */
export async function POST(request: Request) {
  const limited = await rateLimitOr429(request, {
    namespace: "ask-auth-request",
    tokens: 5,
    window: "10 m",
  });
  if (limited) return limited;

  let body: { email?: unknown };
  try {
    body = (await request.json()) as { email?: unknown };
  } catch {
    return NextResponse.json(
      { error: "Body must be JSON." },
      { status: 400 },
    );
  }

  const email = normaliseEmail(body.email);
  if (!email) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const { rawToken } = await mintAskAuthToken(email);
    await sendAskMagicLinkEmail({ to: email, rawToken });
  } catch (err) {
    console.error("[ask-auth/request] failed:", err);
    // Still return ok so we don't leak whether the address exists or
    // whether the email service is misconfigured. The lead-gen UX is
    // "check your inbox" regardless.
  }

  return NextResponse.json({ ok: true });
}
