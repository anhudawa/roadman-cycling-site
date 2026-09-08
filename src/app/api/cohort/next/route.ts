import { NextResponse } from "next/server";
import { rateLimitOr429 } from "@/lib/rate-limit/ip-rate-limit";
import { ndyApplicationFlowEnabled } from "@/lib/ndy/application-offer";
import { deliverSarahNotification, recordApplicantAction } from "@/lib/ndy/application-workflow";

export const runtime = "nodejs";
export const maxDuration = 30;
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };

// GET intentionally has no handler. Email scanners and link previews cannot
// request a call, send Sarah mail, or mark anyone as having purchased.
export async function POST(request: Request) {
  if (!ndyApplicationFlowEnabled()) return NextResponse.json({ error: "Application follow-up is not available yet." }, { status: 503, headers });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin" }, { status: 403, headers });
  const limited = await rateLimitOr429(request, { namespace: "ndy-next", tokens: 8, window: "10 m" });
  if (limited) return limited;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("invalid");
    const { token, action, question } = body as Record<string, unknown>;
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token) || (action !== "join" && action !== "questions")) {
      return NextResponse.json({ error: "Please use the link in your application email." }, { status: 400, headers });
    }
    if (action === "questions" && (typeof question !== "string" || question.trim().length < 3 || question.trim().length > 2000)) {
      return NextResponse.json({ error: "Please enter your question (3–2,000 characters)." }, { status: 400, headers });
    }
    const result = await recordApplicantAction(token, action, typeof question === "string" ? question.trim() : undefined);
    if (!result) return NextResponse.json({ error: "This link has expired or been replaced. Use the link in your latest application email, or email Sarah." }, { status: 410, headers });
    if (action === "questions") {
      // The question is already committed. Failure here is retried from the
      // durable outbox and shown to Sarah in admin, not lost or reported sent.
      await deliverSarahNotification(result.id).catch(() => console.error("[NDY] Admin notification remains queued"));
    }
    return NextResponse.json({ success: true, duplicate: result.duplicate,
      ...(action === "join" ? { checkoutUrl: result.checkoutUrl } : {}),
    }, { headers });
  } catch (error) {
    if (error instanceof SyntaxError || (error instanceof Error && error.message === "invalid")) {
      return NextResponse.json({ error: "Please submit a valid request." }, { status: 400, headers });
    }
    console.error("[NDY] Could not save applicant action");
    return NextResponse.json({ error: "We couldn't save that. Please try again; your question is still here." }, { status: 500, headers });
  }
}
