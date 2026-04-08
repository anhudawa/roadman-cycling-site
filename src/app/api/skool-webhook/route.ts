import { NextResponse } from "next/server";

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;
const SKOOL_WEBHOOK_SECRET = process.env.SKOOL_WEBHOOK_SECRET;

/**
 * Skool → Beehiiv webhook
 *
 * When a new member joins the free Skool community and fills out the
 * questionnaire, Skool sends a webhook POST to this endpoint.
 * We create a Beehiiv subscriber, classify their persona from the
 * questionnaire answers, and tag them to trigger the correct email sequence.
 *
 * Persona classification from questionnaire answers:
 *   - "plateau"    → stuck, not improving, hit a wall
 *   - "comeback"   → returning, injury, time off, getting back
 *   - "event-prep" → event, race, sportive, gran fondo, training plan
 *   - "listener"   → new, just started, beginner, curious (default fallback)
 *
 * Tags applied:
 *   - "skool-member" (always)
 *   - One of: "plateau", "comeback", "event-prep", "listener"
 *
 * Setup: In Skool admin → Settings → Webhooks → Add this URL:
 *   https://roadmancycling.com/api/skool-webhook
 */

// ── Persona classification ─────────────────────────────────

type Persona = "plateau" | "comeback" | "event-prep" | "listener";

const PERSONA_KEYWORDS: Record<Persona, string[]> = {
  plateau: [
    "plateau", "stuck", "not improving", "stagnant", "same level",
    "can't improve", "hit a wall", "no progress", "flatlined", "stalled",
    "not getting faster", "lost motivation", "going nowhere",
  ],
  comeback: [
    "comeback", "coming back", "returning", "injury", "time off",
    "getting back", "break from cycling", "haven't ridden", "used to ride",
    "restart", "back into", "off the bike", "rehab", "recovery from",
  ],
  "event-prep": [
    "event", "race", "sportive", "gran fondo", "training plan",
    "preparing for", "first race", "goal event", "target event",
    "etape", "ironman", "triathlon", "century", "audax", "ultra",
    "competition", "time trial",
  ],
  // listener is the default — no keywords needed
  listener: [],
};

function classifyPersona(answers: string[]): Persona {
  const combined = answers.join(" ").toLowerCase();

  // Score each persona by keyword matches
  let bestPersona: Persona = "listener";
  let bestScore = 0;

  for (const [persona, keywords] of Object.entries(PERSONA_KEYWORDS)) {
    if (persona === "listener") continue;
    let score = 0;
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestPersona = persona as Persona;
    }
  }

  return bestPersona;
}

// ── Beehiiv tagging ─────────────────────────────────────────

async function tagSubscriber(
  subscriberId: string,
  tags: string[]
): Promise<boolean> {
  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) return false;

  try {
    // Beehiiv v2: POST to /tags sub-resource to add tags
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions/${subscriberId}/tags`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify({
          tags,
        }),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("[Skool Webhook] Tag error:", res.status, errData);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Skool Webhook] Tag request failed:", err);
    return false;
  }
}

// ── Main handler ────────────────────────────────────────────

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

    // Extract questionnaire answers for persona classification
    const answers: string[] = [];
    const customFields: { name: string; value: string }[] = [];

    if (firstName) customFields.push({ name: "first_name", value: firstName });
    if (lastName) customFields.push({ name: "last_name", value: lastName });

    if (data?.questions) {
      // Handle both array format (native Skool) and object format (Zapier flattened)
      const questionsArr = Array.isArray(data.questions)
        ? data.questions
        : Object.values(data.questions);

      questionsArr.forEach(
        (q: string | { question?: string; answer?: string }, i: number) => {
          // Zapier may send just the answer string, or {answer: "..."}
          const answer = typeof q === "string" ? q : q?.answer;
          if (answer) {
            answers.push(answer);
            customFields.push({
              name: `skool_q${i + 1}`,
              value: answer.slice(0, 500),
            });
          }
        }
      );
    }

    // Classify persona from questionnaire answers
    const persona = classifyPersona(answers);

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.log(
        `[Skool Webhook] ${email} (${fullName}) persona=${persona} — Beehiiv not configured`
      );
      return NextResponse.json({ success: true, persona });
    }

    // Step 1: Create subscriber in Beehiiv
    const createRes = await fetch(
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

    let subscriberId: string | null = null;

    if (createRes.ok) {
      const createData = await createRes.json();
      subscriberId = createData?.data?.id || null;
      console.log(
        `[Skool Webhook] ${email} (${fullName}) → Beehiiv created, id=${subscriberId}`
      );
    } else if (createRes.status === 409) {
      // Already exists — look up their subscriber ID to add tags
      console.log(`[Skool Webhook] ${email} already in Beehiiv, looking up ID`);
      const lookupRes = await fetch(
        `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions?email=${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` },
        }
      );
      if (lookupRes.ok) {
        const lookupData = await lookupRes.json();
        subscriberId = lookupData?.data?.[0]?.id || null;
      }
    } else {
      const errData = await createRes.json().catch(() => ({}));
      console.error("[Skool Webhook] Beehiiv create error:", createRes.status, errData);
      return NextResponse.json({ error: "Beehiiv API error" }, { status: 502 });
    }

    // Step 2: Tag the subscriber with persona + skool-member
    if (subscriberId) {
      const tags = ["skool-member", persona];
      const tagged = await tagSubscriber(subscriberId, tags);
      console.log(
        `[Skool Webhook] ${email} tagged: [${tags.join(", ")}] → ${tagged ? "OK" : "FAILED"}`
      );
    } else {
      console.warn(`[Skool Webhook] ${email} — could not get subscriber ID for tagging`);
    }

    return NextResponse.json({
      success: true,
      persona,
      tagged: !!subscriberId,
    });
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
