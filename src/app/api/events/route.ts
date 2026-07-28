import { recordEvent } from "@/lib/admin/events-store";
import type { EventType } from "@/lib/admin/events-store";
import { upsertOnSignup } from "@/lib/admin/subscribers-store";
import { readAnonSessionKey } from "@/lib/rider-profile/anon-session";
import { detectAIReferrerFromRequest } from "@/lib/analytics/ai-referrer-server";
import { rateLimitOr429 } from "@/lib/rate-limit/ip-rate-limit";
import { clampString, normaliseEmail } from "@/lib/validation";

const MAX_EVENT_BODY_BYTES = 16_384;
const MAX_META_FIELDS = 25;

type BoundedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413; error: string };

function optionalString(value: unknown, maxLength: number) {
  if (value == null || value === "") return undefined;
  return clampString(value, maxLength) ?? undefined;
}

function hasAllowedOrigin(request: Request): boolean {
  const suppliedOrigin = request.headers.get("origin");
  if (!suppliedOrigin) return true;

  try {
    return new URL(suppliedOrigin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function readBoundedJson(request: Request): Promise<BoundedJsonResult> {
  if (!request.body) {
    return { ok: false, status: 400, error: "Invalid event payload" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_EVENT_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return {
          ok: false,
          status: 413,
          error: "Event payload is too large",
        };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: "Invalid event payload" };
  } finally {
    reader.releaseLock();
  }

  try {
    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: 400, error: "Invalid event payload" };
  }
}

function sanitiseMeta(input: unknown): Record<string, string> | undefined | null {
  if (input == null) return undefined;
  if (typeof input !== "object" || Array.isArray(input)) return null;

  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length > MAX_META_FIELDS) return null;

  const clean: Record<string, string> = {};
  for (const [rawKey, rawValue] of entries) {
    const key = clampString(rawKey, 64);
    if (!key || !/^[A-Za-z0-9_.-]+$/.test(key)) return null;
    if (
      rawValue !== null &&
      typeof rawValue !== "string" &&
      typeof rawValue !== "number" &&
      typeof rawValue !== "boolean"
    ) {
      return null;
    }
    const value = clampString(String(rawValue ?? ""), 500);
    if (value != null) clean[key] = value;
  }
  return clean;
}

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request)) {
    return Response.json(
      { error: "Cross-origin event submissions are not allowed" },
      { status: 403 },
    );
  }

  const limited = await rateLimitOr429(request, {
    namespace: "analytics-events",
    tokens: 120,
    window: "1 m",
  });
  if (limited) return limited;

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_EVENT_BODY_BYTES) {
    return Response.json({ error: "Event payload is too large" }, { status: 413 });
  }

  try {
    const bodyResult = await readBoundedJson(request);
    if (!bodyResult.ok) {
      return Response.json(
        { error: bodyResult.error },
        { status: bodyResult.status },
      );
    }
    const parsed = bodyResult.value;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return Response.json({ error: "Invalid event payload" }, { status: 400 });
    }
    const body = parsed as Record<string, unknown>;
    const type = optionalString(body.type, 64);
    const page = optionalString(body.page, 500);
    const referrer = optionalString(body.referrer, 1_000);
    const source = optionalString(body.source, 120);
    const sessionId = optionalString(body.session_id, 150);
    const variantId = optionalString(body.variant_id, 100);
    const aiReferrer = optionalString(body.ai_referrer, 120);
    const meta = sanitiseMeta(body.meta);
    const email =
      body.email == null || body.email === ""
        ? undefined
        : normaliseEmail(body.email) ?? null;

    if (!type || !page) {
      return Response.json({ error: "type and page are required" }, { status: 400 });
    }
    if (email === null) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    if (meta === null) {
      return Response.json({ error: "Invalid event metadata" }, { status: 400 });
    }

    // Server-side AI-referrer fallback. The client sends `ai_referrer` from
    // sessionStorage when consent is granted, but adblock/strict modes can
    // strip it. Re-derive from the inbound page URL's utm_source + Referer
    // header so attribution still lands. Persist to the indexed column
    // (DEV-DATA-02) AND to meta.ai_referrer for back-compat with any reader
    // still pointing at the jsonb path.
    const refererHeader = request.headers.get("referer");
    const derivedAiReferrer =
      aiReferrer ??
      detectAIReferrerFromRequest({
        pageUrl: page,
        referer: refererHeader,
      });

    const mergedMeta: Record<string, string> | undefined =
      derivedAiReferrer || meta
        ? {
            ...(meta ?? {}),
            ...(derivedAiReferrer ? { ai_referrer: String(derivedAiReferrer) } : {}),
          }
        : undefined;

    const validTypes: EventType[] = [
      "pageview",
      "signup",
      "form_submit",
      "skool_trial",
      "checkout_initiated",
      "checkout_completed",
      "error_report",
      "diagnostic_start",
      "diagnostic_progress",
      "diagnostic_complete",
      "diagnostic_results_view",
      "diagnostic_cta_click",
      "ask_session_started",
      "ask_question_submitted",
      "ask_intent_classified",
      "ask_retrieval_completed",
      "ask_answer_streamed",
      "ask_citation_shown",
      "ask_cta_shown",
      "ask_cta_clicked",
      "ask_safety_triggered",
      "ask_message_flagged",
      "ask_feedback_submitted",
      "ask_profile_saved",
      "ask_starter_prompt_clicked",
      "ask_rate_limited",
      "ask_error_shown",
      "paid_report_checkout_start",
      "paid_report_checkout_success",
      "paid_report_generated",
      "paid_report_delivered",
      "paid_report_failed",
      "paid_report_downloaded",
      "paid_report_viewed",
      "paid_report_ask_handoff",
      "tool_result_upsell_view",
      "tool_result_ask_handoff",
      // Conversion funnel (acquisition)
      "page_view",
      "prediction_started",
      "prediction_completed",
      "email_captured",
      "report_purchased",
      "community_cta_clicked",
      "ask_roadman_used",
      "race_page_viewed",
      "share_clicked",
      "apply_form_start",
      "apply_step_completed",
      "apply_submit_error",
      "apply_submit_success",
      "coaching_apply_submitted",
      // Micro-events (engagement signal layer)
      "scroll_depth",
      "cta_click",
      "tool_start",
      "tool_complete",
      "video_play",
      "podcast_play",
      "link_click_internal",
      "link_click_external",
      "form_start",
      "error_boundary",
      "time_on_page",
      "web_vital",
    ];
    if (!validTypes.includes(type as EventType)) {
      return Response.json({ error: "Invalid event type" }, { status: 400 });
    }
    const eventType = type as EventType;

    const userAgent = request.headers.get("user-agent") || undefined;

    // Fall back to the httpOnly anon cookie when the client doesn't supply
    // a session_id. Lets useTrack callers in random page components log
    // events without each one having to plumb a session id through props.
    let resolvedSessionId: string | undefined = sessionId;
    if (!resolvedSessionId) {
      try {
        resolvedSessionId = (await readAnonSessionKey()) ?? undefined;
      } catch {
        // cookie store unavailable — leave undefined, recordEvent stores "unknown"
      }
    }

    const event = await recordEvent(eventType, page, {
      referrer,
      userAgent,
      email,
      source,
      meta: mergedMeta,
      sessionId: resolvedSessionId,
      variantId,
      aiReferrer: derivedAiReferrer ? String(derivedAiReferrer) : undefined,
    });

    // Upsert subscriber on signup events
    if (eventType === "signup" && email) {
      try {
        await upsertOnSignup(email, page, source);
      } catch (err) {
        console.error("[Events API] Subscriber upsert failed:", err);
        // Non-blocking — event was already recorded
      }
    }

    return Response.json({ success: true, id: event.id });
  } catch (error) {
    console.error("[Events API] Error:", error);
    return Response.json({ error: "Failed to record event" }, { status: 500 });
  }
}
