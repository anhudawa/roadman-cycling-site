import { NextResponse } from "next/server";
import { normaliseEmail } from "@/lib/validation";
import {
  getPredictionBySlug,
  setPredictionEmail,
} from "@/lib/race-predictor/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UnlockBody {
  email?: string;
  firstName?: string;
}

/**
 * POST /api/predict/[slug]/unlock
 *
 * Free-tier email capture gate. Records the email against the prediction so
 * the result page can reveal the full breakdown. Always returns 200 if the
 * email is well-formed and the prediction exists — the caller doesn't need
 * to distinguish between "newly unlocked" and "already unlocked".
 *
 * Lead-gen path: capture the email, then the marketing pipeline picks it up
 * via the `predictions.email` index for the nurture sequence.
 */
export async function POST(
  request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  if (!slug || !/^[a-z0-9-]{4,40}$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug." }, { status: 400 });
  }

  let body: UnlockBody;
  try {
    body = (await request.json()) as UnlockBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = normaliseEmail(body.email);
  if (!email) {
    return NextResponse.json(
      { error: "Enter a valid email so we can send your full breakdown." },
      { status: 400 },
    );
  }

  const prediction = await getPredictionBySlug(slug);
  if (!prediction) {
    return NextResponse.json({ error: "Prediction not found." }, { status: 404 });
  }

  // Lead is the most useful thing we capture here. If the DB write fails we
  // still want to log it server-side so it isn't lost.
  const updated = await setPredictionEmail(slug, email).catch((err) => {
    console.error("[predict/unlock] write failed:", err, { slug, email });
    return false;
  });
  if (!updated) {
    console.warn("[predict/unlock] lead captured but not persisted:", { slug, email });
  }

  return NextResponse.json({
    unlocked: true,
    email,
    firstName: typeof body.firstName === "string" ? body.firstName.slice(0, 80) : null,
  });
}
