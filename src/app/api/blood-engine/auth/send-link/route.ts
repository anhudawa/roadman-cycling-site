import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/blood-engine/db";
import { sendMagicLink } from "@/lib/blood-engine/email";
import { magicLinkUrl, mintMagicLinkToken } from "@/lib/blood-engine/magic-link";

/**
 * Request a magic-link email for an existing Blood Engine user.
 * POST body: { email: string }
 *
 * For security we always return success — never leak whether an email exists
 * in our database. Only users with hasAccess=true actually receive the email.
 */
export async function POST(request: Request) {
  let email: string;
  try {
    const body = await request.json();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (user?.hasAccess) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://roadmancycling.com";
    const token = mintMagicLinkToken(user.id);
    const link = magicLinkUrl(siteUrl, token);
    // fire and forget — don't block the response on email latency
    void sendMagicLink(email, link);
  }
  // Always return the same shape regardless of whether the user exists.
  return NextResponse.json({ ok: true });
}
