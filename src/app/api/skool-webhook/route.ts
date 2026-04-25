import { NextResponse } from "next/server";
import { upsertOnSkoolJoin } from "@/lib/admin/subscribers-store";
import { db } from "@/lib/db";
import { skoolEvents, tedWelcomeQueue } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { classifyPersona, type Persona } from "@/lib/skool/persona";

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;
const SKOOL_WEBHOOK_SECRET = process.env.SKOOL_WEBHOOK_SECRET;

/**
 * Skool Clubhouse → CRM webhook.
 *
 * Tolerant of three payload shapes so the admin "Skool Joins" count reflects
 * reality regardless of how signups are piped in:
 *
 *   1. Skool native webhook:
 *        { event: "member.joined", data: { email, name, questions: [...] } }
 *
 *   2. Zapier "New Member in Community" trigger → webhook POST:
 *        { email, name, questionnaire_answers: [...], ... }
 *      or flat with numeric keys (Zapier-flattened objects).
 *
 *   3. Manual / curl (testing):
 *        { email: "x@y.com", name: "...", answers: ["stuck on a plateau"] }
 *
 * Every call is logged to the `skool_events` table so /admin/integrations/skool
 * can prove the pipeline is working — including rejections, so bad secrets /
 * bad payloads don't fail silently.
 *
 * Auth: set SKOOL_WEBHOOK_SECRET and pass it via either
 *   Authorization: Bearer <secret>
 *   X-Webhook-Secret: <secret>
 *   ?secret=<secret>   (query param, for Zapier flavours that don't do headers)
 */

// ── Payload normalisation ──────────────────────────────────

interface NormalisedEvent {
  source: "skool_native" | "zapier" | "make" | "curl" | "unknown";
  eventType:
    | "member_joined"
    | "member_updated"
    | "other";
  email: string | null;
  name: string | null;
  answers: string[];
}

function normalisePayload(payload: unknown): NormalisedEvent {
  const out: NormalisedEvent = {
    source: "unknown",
    eventType: "other",
    email: null,
    name: null,
    answers: [],
  };
  if (!payload || typeof payload !== "object") return out;
  const p = payload as Record<string, unknown>;

  // --- Shape 1: Skool native ---
  if (
    typeof p.event === "string" &&
    typeof p.data === "object" &&
    p.data !== null
  ) {
    const data = p.data as Record<string, unknown>;
    out.source = "skool_native";
    if (p.event === "member.joined" || p.event === "member.created") {
      out.eventType = "member_joined";
    } else if (p.event === "member.updated" || p.event === "member.accepted") {
      out.eventType = "member_updated";
    }
    out.email = stringOrNull(data.email ?? data.Email);
    out.name = stringOrNull(data.name ?? data.full_name ?? data.Name);
    out.answers = extractAnswers(data);
    return out;
  }

  // --- Shape 2: Zapier / Make flat ---
  // Heuristics: Zapier commonly POSTs {email, name, questionnaire_1, ...}
  const email = stringOrNull(
    p.email ?? p.Email ?? p.member_email ?? p.user_email
  );
  if (email) {
    out.email = email;
    const joinedName =
      [p.first_name, p.last_name].filter(Boolean).join(" ") || undefined;
    out.name = stringOrNull(
      p.name ?? p.full_name ?? p.Name ?? joinedName
    );
    // Zapier detection: presence of `zap_meta_human_times`, etc.
    if (
      Object.keys(p).some((k) => k.startsWith("zap_")) ||
      p.source === "zapier"
    ) {
      out.source = "zapier";
    } else if (p.source === "make" || p.source === "make.com") {
      out.source = "make";
    } else {
      out.source = p.source === "curl" ? "curl" : "zapier";
    }
    // Accept multiple naming schemes for question answers
    out.answers = extractAnswers(p);

    // Event hint — some platforms send an explicit `action` field; otherwise
    // treat any payload with an email as a "join" (which is the right call for
    // the Clubhouse "New Member" Zap).
    const action = stringOrNull(p.event ?? p.action ?? p.type)?.toLowerCase();
    if (action && (action.includes("update") || action.includes("accept"))) {
      out.eventType = "member_updated";
    } else {
      out.eventType = "member_joined";
    }
    return out;
  }

  return out;
}

function stringOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t ? t : null;
}

function extractAnswers(obj: Record<string, unknown>): string[] {
  const out: string[] = [];
  const candidates: unknown[] = [];

  if (Array.isArray(obj.questions)) candidates.push(...obj.questions);
  else if (obj.questions && typeof obj.questions === "object") {
    candidates.push(...Object.values(obj.questions));
  }

  if (Array.isArray(obj.answers)) candidates.push(...obj.answers);
  if (Array.isArray(obj.questionnaire_answers))
    candidates.push(...(obj.questionnaire_answers as unknown[]));

  // Zapier-flattened: question_1, question_2, ... or q1, q2, ...
  for (const [key, value] of Object.entries(obj)) {
    if (
      /^(q|question|answer|questionnaire)[_\-]?\d+$/i.test(key) &&
      typeof value === "string"
    ) {
      candidates.push(value);
    }
  }

  for (const c of candidates) {
    if (typeof c === "string") {
      const t = c.trim();
      if (t) out.push(t);
    } else if (c && typeof c === "object") {
      const inner = c as Record<string, unknown>;
      const answer = stringOrNull(inner.answer ?? inner.value ?? inner.text);
      if (answer) out.push(answer);
    }
  }

  return out;
}

// ── Audit log ─────────────────────────────────────────────

async function logEvent(args: {
  eventType: string;
  source: string;
  email: string | null;
  name: string | null;
  persona: string | null;
  rawPayload: Record<string, unknown>;
  status: "accepted" | "skipped" | "error";
  errorMessage?: string | null;
}) {
  try {
    await db.insert(skoolEvents).values({
      eventType: args.eventType,
      source: args.source,
      email: args.email,
      name: args.name,
      persona: args.persona,
      rawPayload: args.rawPayload,
      status: args.status,
      errorMessage: args.errorMessage ?? null,
    });
  } catch (err) {
    console.error("[Skool Webhook] Failed to persist event log:", err);
  }
}

// ── Beehiiv tagging ────────────────────────────────────────

async function tagSubscriber(
  subscriberId: string,
  tags: string[]
): Promise<boolean> {
  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) return false;
  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions/${subscriberId}/tags`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify({ tags }),
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

async function upsertInBeehiiv(
  email: string,
  name: string | null,
  persona: Persona
): Promise<boolean> {
  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) return false;

  const customFields: { name: string; value: string }[] = [];
  if (name) {
    const parts = name.split(" ");
    customFields.push({ name: "first_name", value: parts[0] ?? "" });
    if (parts.length > 1) {
      customFields.push({ name: "last_name", value: parts.slice(1).join(" ") });
    }
  }

  let subscriberId: string | null = null;

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
        utm_campaign: "clubhouse-join",
        referring_site: "skool.com/roadman",
        ...(customFields.length > 0 && { custom_fields: customFields }),
      }),
    }
  );

  if (createRes.ok) {
    const createData = await createRes.json();
    subscriberId = createData?.data?.id ?? null;
  } else if (createRes.status === 409) {
    const lookupRes = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` } }
    );
    if (lookupRes.ok) {
      const data = await lookupRes.json();
      subscriberId = data?.data?.[0]?.id ?? null;
    }
  } else {
    console.error(
      "[Skool Webhook] Beehiiv create error:",
      createRes.status,
      await createRes.text().catch(() => "")
    );
    return false;
  }

  if (subscriberId) {
    await tagSubscriber(subscriberId, ["skool-member", persona]);
    return true;
  }
  return false;
}

// ── Main handler ────────────────────────────────────────────

export async function POST(request: Request) {
  const url = new URL(request.url);
  const rawBody = await request.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {};
  } catch {
    await logEvent({
      eventType: "bad_payload",
      source: "unknown",
      email: null,
      name: null,
      persona: null,
      rawPayload: { raw: rawBody.slice(0, 2000) },
      status: "error",
      errorMessage: "Invalid JSON body",
    });
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  // --- Auth ---
  if (SKOOL_WEBHOOK_SECRET) {
    const authHeader = request.headers.get("authorization");
    const headerToken =
      authHeader?.replace("Bearer ", "") ||
      request.headers.get("x-webhook-secret") ||
      url.searchParams.get("secret");
    if (headerToken !== SKOOL_WEBHOOK_SECRET) {
      await logEvent({
        eventType: "unauthorized",
        source: "unknown",
        email: null,
        name: null,
        persona: null,
        rawPayload: payload,
        status: "error",
        errorMessage: "Invalid or missing secret",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const normalised = normalisePayload(payload);

  // Not a member event we care about (or missing email) → log + skip.
  if (!normalised.email || !normalised.email.includes("@")) {
    await logEvent({
      eventType: normalised.eventType,
      source: normalised.source,
      email: normalised.email,
      name: normalised.name,
      persona: null,
      rawPayload: payload,
      status: "skipped",
      errorMessage: "No valid email in payload",
    });
    return NextResponse.json(
      { ok: true, skipped: true, reason: "no_email" },
      { status: 200 }
    );
  }

  if (normalised.eventType === "other") {
    await logEvent({
      eventType: "other",
      source: normalised.source,
      email: normalised.email,
      name: normalised.name,
      persona: null,
      rawPayload: payload,
      status: "skipped",
      errorMessage: "Unhandled event type",
    });
    return NextResponse.json({ ok: true, skipped: true, reason: "event_type" });
  }

  const email = normalised.email.toLowerCase();
  const persona = classifyPersona(normalised.answers);

  let upsertError: string | null = null;
  try {
    await upsertOnSkoolJoin(email, persona);
  } catch (err) {
    upsertError = err instanceof Error ? err.message : String(err);
    console.error("[Skool Webhook] Subscriber upsert failed:", err);
  }

  // Enqueue a Ted welcome (idempotent — duplicate joins don't duplicate
  // welcomes). Non-blocking — Beehiiv flow continues regardless.
  if (normalised.eventType === "member_joined") {
    try {
      const existing = await db
        .select({ email: tedWelcomeQueue.memberEmail })
        .from(tedWelcomeQueue)
        .where(eq(tedWelcomeQueue.memberEmail, email))
        .limit(1);
      if (existing.length === 0) {
        const firstName = (normalised.name ?? "").split(" ")[0] ?? "";
        await db.insert(tedWelcomeQueue).values({
          memberEmail: email,
          firstName,
          persona,
          questionnaireAnswers: normalised.answers.length
            ? ({ answers: normalised.answers } as Record<string, unknown>)
            : null,
          status: "pending",
        });
      }
    } catch (err) {
      console.error("[Skool Webhook] Ted welcome enqueue failed:", err);
    }
  }

  let beehiivOk = false;
  if (BEEHIIV_API_KEY && BEEHIIV_PUBLICATION_ID) {
    try {
      beehiivOk = await upsertInBeehiiv(email, normalised.name, persona);
    } catch (err) {
      console.error("[Skool Webhook] Beehiiv flow failed:", err);
    }
  }

  await logEvent({
    eventType: normalised.eventType,
    source: normalised.source,
    email,
    name: normalised.name,
    persona,
    rawPayload: payload,
    status: upsertError ? "error" : "accepted",
    errorMessage: upsertError,
  });

  return NextResponse.json({
    ok: !upsertError,
    email,
    persona,
    source: normalised.source,
    beehiiv: beehiivOk,
    subscribersUpserted: !upsertError,
  });
}

// Health check — returns the real status of the Skool webhook so /admin can
// show it on a pill without making a full POST.
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "skool-webhook",
    secretConfigured: Boolean(SKOOL_WEBHOOK_SECRET),
    beehiivConfigured: Boolean(BEEHIIV_API_KEY && BEEHIIV_PUBLICATION_ID),
  });
}
