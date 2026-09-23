import { NextResponse } from "next/server";
import { rateLimitOr429 } from "@/lib/rate-limit/ip-rate-limit";
import { ndyApplicationFlowEnabled } from "@/lib/ndy/application-offer";
import { getApplicationDecision } from "@/lib/ndy/application-workflow";

export const runtime = "nodejs";
export const maxDuration = 15;
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };

// The decision is resolved here and never on the client. /apply/next renders
// "under review" until this route says otherwise, so a direct visit, a forged
// token or an outage all leave the page showing no offer.
//
// GET intentionally has no handler: the access token travels in the page's URL
// fragment, so it never reaches an access log, and link previewers cannot probe
// an applicant's decision by following the emailed link.
export async function POST(request: Request) {
  if (!ndyApplicationFlowEnabled()) return NextResponse.json({ state: "pending" }, { status: 503, headers });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ state: "pending" }, { status: 403, headers });
  // Tighter than the action endpoint: this is the only route that answers
  // questions about a token, so it is the one worth guessing against.
  const limited = await rateLimitOr429(request, { namespace: "ndy-status", tokens: 20, window: "10 m" });
  if (limited) return limited;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("invalid");
    const { token } = body as Record<string, unknown>;
    if (typeof token !== "string") return NextResponse.json({ state: "invalid" }, { headers });
    return NextResponse.json({ state: await getApplicationDecision(token) }, { headers });
  } catch (error) {
    if (error instanceof SyntaxError || (error instanceof Error && error.message === "invalid")) {
      return NextResponse.json({ state: "invalid" }, { status: 400, headers });
    }
    // Fail closed: an unreadable database must not approve anyone.
    console.error("[NDY] Could not resolve application decision");
    return NextResponse.json({ state: "pending" }, { status: 503, headers });
  }
}
