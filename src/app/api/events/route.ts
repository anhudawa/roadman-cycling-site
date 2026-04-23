import { recordEvent } from "@/lib/admin/events-store";
import type { EventType } from "@/lib/admin/events-store";
import { upsertOnSignup } from "@/lib/admin/subscribers-store";

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

    // Merge AI-referrer attribution (AEO-003) into the meta jsonb column so
    // answer-engine traffic is queryable without a dedicated schema column.
    const mergedMeta: Record<string, string> | undefined =
      ai_referrer || meta
        ? { ...(meta ?? {}), ...(ai_referrer ? { ai_referrer: String(ai_referrer) } : {}) }
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
    ];
    if (!validTypes.includes(type)) {
      return Response.json({ error: "Invalid event type" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || undefined;

    const event = await recordEvent(type, page, {
      referrer,
      userAgent,
      email,
      source,
      meta: mergedMeta,
      sessionId: session_id,
      variantId: variant_id,
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
