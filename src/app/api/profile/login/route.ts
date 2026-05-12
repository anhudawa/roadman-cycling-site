import { NextResponse } from "next/server";
import { EMAIL_REGEX } from "@/lib/validation";
import {
  findRiderProfileByEmailForLogin,
  mintRiderLoginToken,
} from "@/lib/profile-auth/auth";
import { sendRiderProfileMagicLink } from "@/lib/profile-auth/email";

const STR = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * POST /api/profile/login
 *
 * Request a magic-link sign-in. Returns 200 regardless of whether
 * the email matches a known profile — no enumeration. Profiles that
 * exist and have not opted out of email follow-up receive the link;
 * everyone else silently no-ops.
 *
 * We intentionally do NOT create a profile on first login attempt:
 * the rider must first complete a tool, the plateau diagnostic, or
 * a Method purchase to have a profile row. This stops random emails
 * from manufacturing empty profile shells.
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

    const profile = await findRiderProfileByEmailForLogin(email);
    if (profile && profile.consentEmailFollowup !== false) {
      try {
        const { rawToken } = await mintRiderLoginToken(profile.id);
        await sendRiderProfileMagicLink({ to: email, rawToken });
      } catch (err) {
        console.error("[profile/login] failed to send magic link:", err);
      }
    } else {
      // Anti-enumeration: same response shape regardless.
      console.log(`[profile/login] no eligible profile for ${email}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[profile/login] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Try again in a moment." },
      { status: 500 },
    );
  }
}
