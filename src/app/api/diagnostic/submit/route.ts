import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/admin/events-store";
import { upsertOnSignup } from "@/lib/admin/subscribers-store";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { normaliseEmail, clampString, LIMITS } from "@/lib/validation";
import { scoreDiagnostic } from "@/lib/diagnostic/scoring";
import { generateBreakdown } from "@/lib/diagnostic/generator";
import { insertSubmission, attachBeehiivId } from "@/lib/diagnostic/store";
import { parseAnswers, parseUtm } from "@/lib/diagnostic/parse";
import { PROFILE_LABELS } from "@/lib/diagnostic/profiles";

/**
 * Masters Plateau Diagnostic — submission endpoint.
 *
 * Flow:
 *   1. Validate answers + email. 400 on malformed input.
 *   2. Score the answers (pure, deterministic) — §8 scoring engine.
 *   3. Call Claude for a personalised breakdown; fall back to the
 *      static §9 template if the LLM fails twice or the API key is
 *      missing. The fallback path is deliberately first-class — the
 *      user never waits on a broken LLM.
 *   4. Persist everything (raw answers, scores, breakdown, UTMs).
 *   5. Best-effort Beehiiv subscribe + profile tag + CRM upsert +
 *      analytics event. Each is try/catch'd so a single failure in
 *      the side-effects group doesn't lose the lead.
 *   6. Return the slug so the client can route to /diagnostic/[slug].
 *
 * POST body shape:
 *   {
 *     email: string,
 *     age: '35-44' | ...,
 *     hoursPerWeek: 'under-5' | '5-8' | '9-12' | '13+',
 *     ftp?: number,
 *     goal?: string,
 *     Q1..Q12: 0 | 1 | 2 | 3,
 *     Q13?: string,
 *     sessionId?: string,
 *     utm?: { source, medium, campaign, content, term },
 *     referrer?: string,
 *     consent: boolean
 *   }
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const email = normaliseEmail(body.email);
  if (!email) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  // GDPR: reject unchecked consent — privacy page is linked from the
  // email gate component.
  if (body.consent !== true) {
    return NextResponse.json(
      { error: "Consent is required to send your diagnosis." },
      { status: 400 }
    );
  }

  const answers = parseAnswers(body);
  if (!answers) {
    return NextResponse.json(
      { error: "Diagnostic answers are incomplete." },
      { status: 400 }
    );
  }

  const utm = parseUtm(body.utm);
  const sessionId = clampString(body.sessionId, LIMITS.shortText) ?? "diagnostic";
  const referrer = clampString(body.referrer, LIMITS.shortText);
  const userAgent = request.headers.get("user-agent");

  const scoring = scoreDiagnostic(answers);

  let generation;
  try {
    generation = await generateBreakdown(
      scoring.primary,
      scoring.secondary,
      answers
    );
  } catch (err) {
    // generateBreakdown already catches its own errors — this is just
    // belt-and-braces. Fall through to the fallback so we never block.
    console.error("[Diagnostic] generateBreakdown threw:", err);
    generation = await generateBreakdown(
      scoring.primary,
      scoring.secondary,
      answers
    );
  }

  let submission;
  try {
    submission = await insertSubmission({
      email,
      answers,
      scoring,
      generation,
      utm,
      userAgent,
      referrer,
    });
  } catch (err) {
    console.error("[Diagnostic] insertSubmission failed:", err);
    return NextResponse.json(
      { error: "We couldn't save your diagnosis. Please try again." },
      { status: 500 }
    );
  }

  // ── Non-fatal side-effects group ─────────────────────
  // Everything below is best-effort — failures get logged but never
  // prevent the user from seeing their results.
  const profileLabel = PROFILE_LABELS[scoring.primary];

  await Promise.all([
    // Analytics event. We mask the email inside recordEvent.
    recordEvent("diagnostic_complete", "/plateau", {
      email,
      sessionId,
      userAgent: userAgent ?? undefined,
      source: utm.utmSource ?? undefined,
      variantId: utm.utmContent ?? undefined,
      meta: {
        profile: scoring.primary,
        secondary: scoring.secondary ?? "none",
        source: generation.source,
        slug: submission.slug,
      },
    }).catch((err) => console.error("[Diagnostic] recordEvent failed:", err)),

    // Unified subscribers upsert so this lead shows up alongside
    // newsletter signups in the CRM.
    upsertOnSignup(email, "/plateau", "plateau-diagnostic").catch((err) =>
      console.error("[Diagnostic] upsertOnSignup failed:", err)
    ),

    // Beehiiv subscribe + profile tag. Handles reactivation and 409
    // dedup internally. UTM values flow through so we can segment
    // diagnostic leads by ad variant inside Beehiiv.
    subscribeToBeehiiv({
      email,
      tags: [
        "plateau-diagnostic",
        `profile-${scoring.primary}`,
        ...(scoring.severeMultiSystem ? ["multi-system"] : []),
      ],
      sendWelcomeEmail: false,
      customFields: {
        diagnostic_profile: profileLabel,
        diagnostic_slug: submission.slug,
      },
      utm: {
        source: utm.utmSource ?? "diagnostic",
        medium: utm.utmMedium ?? "web",
        campaign: utm.utmCampaign ?? "plateau-diagnostic",
      },
    })
      .then((result) => {
        if (result.subscriberId) {
          return attachBeehiivId(submission.slug, result.subscriberId);
        }
      })
      .catch((err) => console.error("[Diagnostic] Beehiiv sync failed:", err)),
  ]);

  return NextResponse.json({
    success: true,
    slug: submission.slug,
    profile: scoring.primary,
  });
}
