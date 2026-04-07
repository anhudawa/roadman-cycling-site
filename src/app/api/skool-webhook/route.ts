import { NextResponse } from "next/server";

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;
const SKOOL_WEBHOOK_SECRET = process.env.SKOOL_WEBHOOK_SECRET;

/**
 * Skool → Beehiiv webhook
 *
 * When a new member joins the free Skool community and fills out the
 * questionnaire, Skool sends a webhook POST to this endpoint.
 * We create a Beehiiv subscriber with their email + name + UTM tags.
 *
 * Skool webhook payload (new member):
 * {
 *   "event": "member.joined",
 *   "data": {
 *     "id": "...",
 *     "name": "First Last",
 *     "email": "user@example.com",
 *     "bio": "...",
 *     "questions": [
 *       { "question": "...", "answer": "..." }
 *     ]
 *   }
 * }
 *
 * Setup: In Skool admin → Settings → Webhooks → Add this URL:
 *   https://roadmancycling.com/api/skool-webhook
 *
 * Env vars needed:
 *   BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID (already set)
 *   SKOOL_WEBHOOK_SECRET (optional — set in Skool webhook config for verification)
 */
export async function POST(request: Request) {
  try {
    // Verify webhook secret if configured
    if (SKOOL_WEBHOOK_SECRET) {
      const authHeader = request.headers.get("authorization");
      const secretHeader = request.headers.get("x-webhook-secret");
      const token = authHeader?.replace("Bearer ", "") || secretHeader;

      if (token !== SKOOL_WEBHOOK_SECRET) {
        console.error("[Skool Webhook] Invalid secret");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = await request.json();
    const { event, data } = payload;

    // Only process new member events
    if (event !== "member.joined" && event !== "member.created") {
      return NextResponse.json({ success: true, skipped: true });
    }

    const email = data?.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      console.error("[Skool Webhook] No valid email in payload:", payload);
      return NextResponse.json({ error: "No valid email" }, { status: 400 });
    }

    // Extract name parts
    const fullName = data?.name?.trim() || "";
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Extract questionnaire answers as custom fields
    const customFields: { name: string; value: string }[] = [];
    if (firstName) customFields.push({ name: "first_name", value: firstName });
    if (lastName) customFields.push({ name: "last_name", value: lastName });

    if (data?.questions && Array.isArray(data.questions)) {
      data.questions.forEach((q: { question: string; answer: string }, i: number) => {
        if (q.answer) {
          customFields.push({
            name: `skool_q${i + 1}`,
            value: q.answer.slice(0, 500),
          });
        }
      });
    }

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.log(`[Skool Webhook] ${email} (${fullName}) — Beehiiv not configured, logging only`);
      return NextResponse.json({ success: true });
    }

    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: false,
          utm_source: "skool",
          utm_medium: "community",
          utm_campaign: "free-group-join",
          referring_site: "skool.com/roadman",
          ...(customFields.length > 0 && { custom_fields: customFields }),
        }),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      // 409 = already exists, which is fine
      if (res.status === 409) {
        console.log(`[Skool Webhook] ${email} already in Beehiiv`);
        return NextResponse.json({ success: true, existing: true });
      }
      console.error("[Skool Webhook] Beehiiv error:", res.status, errData);
      return NextResponse.json({ error: "Beehiiv API error" }, { status: 502 });
    }

    console.log(`[Skool Webhook] ${email} (${fullName}) → Beehiiv OK`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Skool Webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "skool-webhook" });
}
