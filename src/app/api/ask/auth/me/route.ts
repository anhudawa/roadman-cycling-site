import { NextResponse } from "next/server";
import { getAskSession } from "@/lib/ask-auth/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/ask/auth/me
 *
 * Returns the authenticated email for the Ask Roadman session, or 401
 * if the cookie is missing/expired. The gate component polls this on
 * page load so it knows whether to show the email form or the chat.
 */
export async function GET() {
  const session = await getAskSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    email: session.email,
  });
}
