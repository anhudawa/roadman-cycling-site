import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/admin/events-store";
import { upsertOnSignup } from "@/lib/admin/subscribers-store";
import { buildMastersReportWelcomeEmail } from "@/lib/emails/masters-report-welcome";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { getResendClient } from "@/lib/integrations/resend";
import { rateLimitOr429 } from "@/lib/rate-limit/ip-rate-limit";
import { clampString, LIMITS, normaliseEmail } from "@/lib/validation";

const RESEND_FROM_ADDRESS = "Roadman Cycling <noreply@roadmancycling.com>";

/**
 * Some funnels need a transactional welcome email that arrives *now* with
 * the asset the user signed up for. /masters-report is the first — the
 * Beehiiv welcome can't carry a PDF reliably and Anthony got a complaint
 * about people subscribing and receiving nothing. Returning the matched
 * record keeps this declarative so future funnels (e.g. /age-group-ftp)
 * can plug in without changing the route handler.
 */
type ImmediateAssetDeliverable = {
  /** Beehiiv tag(s) applied alongside the source tag. */
  tags: readonly string[];
  /** Build a Resend payload for this signup. */
  build: () => { subject: string; html: string; text: string };
  /** UTM campaign code propagated to Beehiiv for attribution. */
  campaign: string;
};

function matchAssetDeliverable(source: string): ImmediateAssetDeliverable | null {
  if (source.startsWith("masters-report")) {
    return {
      tags: ["masters-report"],
      build: () => buildMastersReportWelcomeEmail(),
      campaign: "masters-report",
    };
  }
  // /go exit-intent promises the Masters Report PDF — same asset as
  // /masters-report, kept as a distinct campaign so Beehiiv segmentation
  // and Resend tagging can attribute conversions to the PPC consolation
  // capture rather than the dedicated squeeze page.
  if (source === "go-exit-intent") {
    return {
      tags: ["masters-report", "go-exit-intent"],
      build: () => buildMastersReportWelcomeEmail(),
      campaign: "go-exit-intent",
    };
  }
  return null;
}

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
  // Per-IP rate limit. Each request hits Beehiiv (paid external API)
  // and writes to our CRM — protect both surfaces from automated abuse.
  const limited = await rateLimitOr429(request, {
    namespace: "newsletter",
    tokens: 10,
    window: "10 m",
  });
  if (limited) return limited;

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
    const asset = matchAssetDeliverable(source);

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
    // 409 dedup + tagging. We suppress the Beehiiv welcome on
    // asset-delivery flows (e.g. /masters-report) because our own
    // Resend send below carries the PDF link — sending both would
    // confuse subscribers and step on each other in the inbox.
    // Tag with the acquisition channel (e.g. "go-exit-intent",
    // "masters-report-hero", "ndy-fit-not-a-fit") so subscribers can be
    // segmented in Beehiiv by where they came in. Strip a leading slash
    // so the default "/newsletter" becomes a clean "newsletter" tag.
    const sourceTag = source.replace(/^\/+/, "").trim();
    const baseTags = asset
      ? ["saturday-spin", ...asset.tags]
      : ["saturday-spin"];
    const beehiivTags =
      sourceTag && !baseTags.includes(sourceTag)
        ? [...baseTags, sourceTag]
        : baseTags;
    const beehiivCampaign = asset ? asset.campaign : "saturday-spin";
    const result = await subscribeToBeehiiv({
      email,
      name,
      tags: beehiivTags,
      sendWelcomeEmail: !asset,
      utm: {
        source: "website",
        medium: source,
        campaign: beehiivCampaign,
      },
    });

    // Transactional welcome (asset delivery). Fired after Beehiiv so the
    // subscriber row exists before the email lands — keeps the customer
    // record consistent for support if someone replies to the welcome.
    // Non-fatal: a Resend hiccup mustn't 500 a signup that was already
    // recorded in our CRM + Beehiiv.
    if (asset) {
      const resend = getResendClient();
      if (resend) {
        try {
          const payload = asset.build();
          const sendResult = await resend.emails.send({
            from: RESEND_FROM_ADDRESS,
            to: email,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
            replyTo: "anthony@roadmancycling.com",
            tags: [
              { name: "campaign", value: asset.campaign },
              { name: "source", value: source.slice(0, 40) },
            ],
          });
          console.log(
            "[Newsletter] Asset welcome sent:",
            asset.campaign,
            JSON.stringify(sendResult),
          );
        } catch (emailErr) {
          console.error(
            "[Newsletter] Resend asset welcome failed:",
            emailErr,
          );
        }
      } else {
        console.warn(
          "[Newsletter] RESEND_API_KEY not configured — asset welcome skipped",
        );
      }
    }

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
