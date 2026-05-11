import { NextResponse } from "next/server";
import { EMAIL_REGEX } from "@/lib/validation";
import { getEnrollmentByEmail } from "@/lib/method/enrollments";
import { mintLoginToken } from "@/lib/method/auth";
import { sendMethodMagicLink } from "@/lib/method/email";

const STR = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * POST /api/method/login
 *
 * Request a magic-link sign-in email. Returns 200 regardless of whether
 * the email is enrolled — no enumeration. Failed enrolment lookups silently
 * noop; legitimate riders see the email arrive in 30 seconds.
 *
 * Rate-limited at the network edge (Vercel) and via @upstash/ratelimit
 * upstream — Phase 1 trusts the platform; a per-route limiter is a
 * follow-up if abuse appears.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { email?: unknown };
    const email = STR(body.email, 200).toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const enrollment = await getEnrollmentByEmail(email);
    if (enrollment && enrollment.status === "active") {
      try {
        const { rawToken } = await mintLoginToken(enrollment.id);
        await sendMethodMagicLink({ to: email, rawToken });
      } catch (err) {
        // Logged but not surfaced — silently noop preserves the
        // anti-enumeration property even if the mailer is down.
        console.error("[method/login] failed to send magic link:", err);
      }
    } else {
      // Deliberate: no signal back to the caller about enrollment status.
      // Riders who never bought see the same "check your email" page;
      // they simply never get the email.
      console.log(`[method/login] no active enrollment for ${email}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[method/login] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Try again in a moment." },
      { status: 500 },
    );
  }
}
