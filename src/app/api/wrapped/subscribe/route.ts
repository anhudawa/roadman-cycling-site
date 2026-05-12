import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/admin/events-store";
import { upsertOnSignup } from "@/lib/admin/subscribers-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  email?: string;
  firstName?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/wrapped/subscribe
 *
 * Lightweight email capture for the Season Wrapped gate. Beehiiv wiring
 * is intentionally a follow-up — but we DO want the lead recorded in
 * the unified subscribers table so it shows up in /admin alongside
 * newsletter/diagnostic/lead-magnet signups. Otherwise wrapped opt-ins
 * vanish into Vercel logs.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json(
      { error: "Enter a valid email." },
      { status: 400 },
    );
  }
  const firstName = String(body.firstName ?? "").trim().slice(0, 80) || null;

  console.log(
    `[wrapped/subscribe] ${email}${firstName ? ` (${firstName})` : ""}`,
  );

  // Non-fatal — the user still sees their cards even if the DB hiccups.
  try {
    await Promise.all([
      recordEvent("signup", "/wrapped", {
        email,
        source: "wrapped",
        userAgent: request.headers.get("user-agent") || undefined,
      }),
      upsertOnSignup(email, "/wrapped", "wrapped"),
    ]);
  } catch (err) {
    console.error("[wrapped/subscribe] Analytics recording failed:", err);
  }

  return NextResponse.json({ ok: true });
}
