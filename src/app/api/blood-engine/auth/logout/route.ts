import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/blood-engine/session";

/**
 * Sign out.
 *
 * POST-only so it can't be triggered by a <img src> / <a href> on a
 * third-party page (CSRF hygiene). JSON callers get a JSON response;
 * form submits get a 303 back to the public landing.
 */
export async function POST(request: Request) {
  await clearSessionCookie();

  const ct = request.headers.get("accept") ?? "";
  if (ct.includes("application/json")) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.redirect(
    new URL(
      "/blood-engine",
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
    ),
    303
  );
}
