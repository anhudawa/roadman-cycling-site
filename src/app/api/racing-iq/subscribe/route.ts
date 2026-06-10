import { NextResponse, after } from "next/server";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { recordEvent } from "@/lib/admin/events-store";
import { normaliseEmail, clampString, LIMITS } from "@/lib/validation";

/**
 * Racing IQ — email capture endpoint.
 *
 * Integration points (same stub pattern as the Plateau Diagnostic):
 *  - Beehiiv: `subscribeToBeehiiv` reads BEEHIIV_API_KEY and
 *    BEEHIIV_PUBLICATION_ID from env. With keys absent (local/dev) it
 *    logs and returns { subscriberId: null } without throwing — the
 *    response then reports subscribed:false and the client falls back
 *    to its retry-at-result path. Ted supplies production credentials.
 *  - Meta: the Lead event fires client-side via the shared MetaPixel
 *    component (ConsentAwarePixel owns init), identical to the
 *    diagnostic build. Server-side Conversions API dedup is not wired
 *    yet there either — when the CAPI token lands, both surfaces
 *    should share eventID per Meta's dedup rules.
 *
 * The game never blocks on this endpoint: any failure mode returns a
 * clean { subscribed: false } and play continues.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = normaliseEmail(body.email);
  if (!email) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const sessionId = clampString(body.sessionId, LIMITS.shortText) ?? "racing-iq";
  const where = body.where === "result" ? "result" : "gate";

  const { subscriberId, created } = await subscribeToBeehiiv({
    email,
    tags: ["racing-iq"],
    utm: { source: "racing-iq", medium: "game", campaign: "racing-iq-stage-1" },
    customFields: { racing_iq_played: "true" },
  });

  after(async () => {
    try {
      await recordEvent("email_captured", "/racing-iq", {
        email,
        source: "racing-iq",
        sessionId,
        meta: {
          where,
          created: String(created),
          subscribed: String(Boolean(subscriberId)),
        },
      });
    } catch (err) {
      console.error("[RacingIQ] recordEvent failed:", err);
    }
  });

  return NextResponse.json({ subscribed: Boolean(subscriberId) });
}
