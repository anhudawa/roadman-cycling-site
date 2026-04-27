import { recordEvent } from "@/lib/admin/events-store";
import type { EventType } from "@/lib/admin/events-store";
import { upsertOnSignup } from "@/lib/admin/subscribers-store";
import { readAnonSessionKey } from "@/lib/rider-profile/anon-session";
import { detectAIReferrerFromRequest } from "@/lib/analytics/ai-referrer-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      page,
      referrer,
      email,
      source,
      meta,
      session_id,
      variant_id,
      ai_referrer,
    } = body;

    if (!type || !page) {
      return Response.json({ error: "type and page are required" }, { status: 400 });
    }

    // Server-side AI-referrer fallback. The client sends `ai_referrer` from
    // sessionStorage when consent is granted, but adblock/strict modes can
    // strip it. Re-derive from the inbound page URL's utm_source + Referer
    // header so attribution still lands. Persist to the indexed column
    // (DEV-DATA-02) AND to meta.ai_referrer for back-compat with any reader
    // still pointing at the jsonb path.
    const refererHeader = request.headers.get("referer");
    const derivedAiReferrer =
      ai_referrer ??
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
      "coaching_apply_submitted",
    ];
    if (!validTypes.includes(type)) {
      return Response.json({ error: "Invalid event type" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || undefined;

    // Fall back to the httpOnly anon cookie when the client doesn't supply
    // a session_id. Lets useTrack callers in random page components log
    // events without each one having to plumb a session id through props.
    let resolvedSessionId: string | undefined = session_id;
    if (!resolvedSessionId) {
      try {
        resolvedSessionId = (await readAnonSessionKey()) ?? undefined;
      } catch {
        // cookie store unavailable — leave undefined, recordEvent stores "unknown"
      }
    }

    const event = await recordEvent(type, page, {
      referrer,
      userAgent,
      email,
      source,
      meta: mergedMeta,
      sessionId: resolvedSessionId,
      variantId: variant_id,
      aiReferrer: derivedAiReferrer ? String(derivedAiReferrer) : undefined,
    });

    // Upsert subscriber on signup events
    if (type === "signup" && email) {
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
