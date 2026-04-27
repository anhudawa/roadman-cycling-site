import { NextResponse } from "next/server";

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
 * Lightweight email capture for the Season Wrapped gate. Right now it
 * simply validates and acknowledges — downstream wiring (ClickFunnels
 * webhook, Klaviyo list, Skool invite) is intentionally a follow-up.
 * Logged server-side so the subscription is auditable in Vercel logs.
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

  return NextResponse.json({ ok: true });
}
