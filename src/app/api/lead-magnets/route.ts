import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/admin/events-store";
import { upsertOnSignup } from "@/lib/admin/subscribers-store";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { upsertContact, addActivity } from "@/lib/crm/contacts";
import { rateLimitOr429 } from "@/lib/rate-limit/ip-rate-limit";
import { clampString, LIMITS, normaliseEmail } from "@/lib/validation";
import {
  getLeadMagnet,
  isLeadMagnetId,
  type LeadMagnetId,
} from "@/lib/cta/lead-magnets";

/**
 * Lead-magnet subscribe endpoint. Single shared route for every
 * intent-specific CTA on the site (zones plan, event plan, masters
 * checklist, fuelling guide, 2-day gym plan, episode playlist).
 *
 * Behaviour mirrors /api/newsletter:
 *   - validate email, clamp inputs
 *   - record signup event + upsert subscriber row (CRM)
 *   - subscribe in Beehiiv with the magnet's tag set so the right
 *     Beehiiv automation fires the actual delivery
 *   - never throws on integration hiccups — the CRM row is the lead
 *     of record, Beehiiv is downstream
 *
 * Asset delivery is handled by Beehiiv automations keyed off the tag,
 * not by this route. Adding a new magnet means: add it to
 * `src/lib/cta/lead-magnets.ts` AND wire the automation in Beehiiv.
 */
export async function POST(request: Request) {
  // Per-IP rate limit. Same posture as /api/newsletter — every
  // request hits Beehiiv + CRM, so cap automated abuse.
  const limited = await rateLimitOr429(request, {
    namespace: "lead-magnets",
    tokens: 10,
    window: "10 m",
  });
  if (limited) return limited;

  try {
    const raw = (await request.json()) as {
      magnet?: unknown;
      email?: unknown;
      name?: unknown;
      source?: unknown;
      context?: unknown;
      consent?: unknown;
    };

    if (!isLeadMagnetId(raw.magnet)) {
      return NextResponse.json(
        { error: "Unknown lead magnet." },
        { status: 400 },
      );
    }
    const magnetId: LeadMagnetId = raw.magnet;
    const magnet = getLeadMagnet(magnetId);

    const email = normaliseEmail(raw.email);
    if (!email) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (raw.consent !== true) {
      return NextResponse.json(
        { error: "Please agree to receive emails from Roadman Cycling." },
        { status: 400 },
      );
    }

    const name = clampString(raw.name, LIMITS.name) ?? undefined;
    const source =
      clampString(raw.source, LIMITS.shortText) ?? `lead-magnet-${magnetId}`;
    const context = magnet.acceptsContext
      ? (clampString(raw.context, LIMITS.shortText) ?? undefined)
      : undefined;

    // Custom fields stored on the Beehiiv subscriber + CRM contact so
    // segmentation later doesn't need a join. The contextFieldName is
    // taken from the magnet definition (e.g. "target_event" for
    // sportive plans, "playlist_topic" for episode playlists).
    const customFields: Record<string, string> = {
      last_lead_magnet: magnetId,
    };
    if (context && magnet.contextFieldName) {
      customFields[magnet.contextFieldName] = context;
    }

    // Analytics + CRM upsert — non-fatal group. Mirrors /api/newsletter.
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
      console.error("[lead-magnets] Analytics/subscriber recording failed:", err);
    }

    // CRM contact — independent best-effort.
    try {
      const contact = await upsertContact({
        email,
        name,
        source: "subscribers",
        customFields,
      });
      await addActivity(contact.id, {
        type: "tag_added",
        title: `Requested lead magnet: ${magnet.label}`,
        body: context ? `Context: ${context}` : undefined,
        meta: { magnet: magnetId, ...(context ? { context } : {}) },
        authorName: "system",
      });
    } catch (err) {
      console.error("[lead-magnets] CRM sync failed:", err);
    }

    const result = await subscribeToBeehiiv({
      email,
      name,
      tags: magnet.beehiivTags,
      customFields,
      // The magnet's own automation in Beehiiv handles delivery — we
      // do NOT want the generic Beehiiv welcome firing on top of it.
      sendWelcomeEmail: false,
      utm: {
        source: "site",
        medium: "lead-magnet",
        campaign: magnetId,
      },
    });

    return NextResponse.json({
      success: true,
      beehiivSynced: Boolean(result.subscriberId),
      message: magnet.successMessage,
    });
  } catch (error) {
    console.error("[lead-magnets] API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
