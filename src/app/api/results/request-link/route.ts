import { NextResponse } from "next/server";
import { z } from "zod";
import { mintHistoryToken } from "@/lib/tool-results/history-token";
import { sendHistoryLinkEmail } from "@/lib/tool-results/history-email";
import { normaliseEmail } from "@/lib/validation";

/**
 * Mint a signed history-page link and email it to the rider. We always
 * return success even when the email isn't recognised $€” giving 404s on
 * unknown emails would let an attacker enumerate whose results we hold.
 * The actual gating is the HMAC-signed token; only the real owner of
 * the inbox can read the link.
 */

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  email: z.string(),
});

function originFromRequest(req: Request): string {
  const fwdHost = req.headers.get("x-forwarded-host");
  const fwdProto = req.headers.get("x-forwarded-proto") ?? "https";
  if (fwdHost) return `${fwdProto}://${fwdHost}`;
  try {
    const u = new URL(req.url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "https://roadmancycling.com";
  }
}

export async function POST(request: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const email = normaliseEmail(parsed.data.email);
  if (!email) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const minted = mintHistoryToken(email);
  const link = `${originFromRequest(request)}/results?token=${encodeURIComponent(minted.token)}`;

  // Fire-and-forget $€” we always respond success from the UI's point of
  // view, and Resend failures are logged server-side.
  void sendHistoryLinkEmail({
    email,
    link,
    expiresAt: minted.expiresAt,
  }).catch((err) => console.error("[results/request-link] email failed:", err));

  return NextResponse.json({ success: true });
}
