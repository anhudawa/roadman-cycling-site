import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/admin/events-store";
import { upsertOnSignup } from "@/lib/admin/subscribers-store";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { clampString, LIMITS, normaliseEmail } from "@/lib/validation";

/**
 * Saturday Spin / newsletter subscribe endpoint.
 *
 * Hardened 2026-04 — previously used `email.includes('@')` which
 * accepted `foo@` / `@bar`. Now uses the shared EMAIL_REGEX +
 * delegates to the central `subscribeToBeehiiv` helper, which handles
 * reactivation, 409 lookups, tag application, and logging
 * consistently with /apply, /contact, and /tools/report.
 *
 * Non-fatal on all side-effects — if Beehiiv is down, we still record
 * the event + upsert the CRM subscriber row so the lead isn't lost.
 */
export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as {
      email?: unknown;
      source?: unknown;
      name?: unknown;
    };

    const email = normaliseEmail(raw.email);
    if (!email) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const source = clampString(raw.source, LIMITS.shortText) ?? "/newsletter";
    const name = clampString(raw.name, LIMITS.name) ?? undefined;

    // Analytics event + subscriber upsert — non-fatal group.
    try {
      await Promise.all([
        recordEvent("signup", source, {
          email,
          source,
          userAgent: request.headers.get("user-agent") || undefined,
        }),
        upsertOnSignup(email, source, source),
      ]);
    } catch (err) {
      console.error("[Newsletter] Analytics recording failed:", err);
    }

    // Beehiiv subscribe via the shared helper. Handles reactivation +
    // 409 dedup + tagging. Sends the Beehiiv welcome email so this
    // path differs from /apply (apply suppresses the welcome so
    // Anthony's personal reply arrives first).
    const result = await subscribeToBeehiiv({
      email,
      name,
      tags: ["saturday-spin"],
      sendWelcomeEmail: true,
      utm: {
        source: "website",
        medium: source,
        campaign: "saturday-spin",
      },
    });

    if (!result.subscriberId) {
      // Beehiiv couldn't be reached OR credentials missing. The signup
      // was still recorded in our CRM (above) so the lead isn't lost,
      // but the user should know we'll follow up manually.
      console.warn("[Newsletter] Beehiiv sync returned no subscriber id");
      return NextResponse.json({
        success: true,
        beehiivSynced: false,
        message: "We've got your signup — if you don't see a confirmation in 5 minutes, email hello@roadmancycling.com.",
      });
    }

    return NextResponse.json({ success: true, beehiivSynced: true });
  } catch (error) {
    console.error("[Newsletter] API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
