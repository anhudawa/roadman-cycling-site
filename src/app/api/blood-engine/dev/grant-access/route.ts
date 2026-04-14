import { NextResponse } from "next/server";
import { grantAccess } from "@/lib/blood-engine/db";
import { magicLinkUrl, mintMagicLinkToken } from "@/lib/blood-engine/magic-link";

/**
 * DEV-ONLY helper — locally grant Blood Engine access to an email without
 * going through Stripe, and return the magic-link URL so you can paste it
 * into the browser.
 *
 *   GET /api/blood-engine/dev/grant-access?email=test@example.com
 *
 * Returns 404 in production.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Missing ?email=" }, { status: 400 });
  }

  const { user } = await grantAccess({ email });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const token = mintMagicLinkToken(user.id);
  return NextResponse.json({
    userId: user.id,
    email: user.email,
    magicLink: magicLinkUrl(siteUrl, token),
  });
}
