import { z } from "zod";
import { flagMessage } from "@/lib/ask/store";
import { recordEvent } from "@/lib/admin/events-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  messageId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  rating: z.enum(["up", "down"]),
  reason: z.string().max(500).optional(),
});

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const { messageId, sessionId, rating, reason } = parsed.data;

  try {
    // Thumbs-down flags the message for admin review.
    if (rating === "down") {
      await flagMessage(messageId, reason ?? "user_downvote");
      await recordEvent("ask_message_flagged", "/ask", {
        sessionId,
        meta: { messageId, reason: reason ?? "user_downvote" },
      });
    }
    await recordEvent("ask_feedback_submitted", "/ask", {
      sessionId,
      meta: { messageId, rating, ...(reason ? { reason } : {}) },
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[ask/feedback] POST failed", err);
    return Response.json({ error: "Failed to record feedback." }, { status: 500 });
  }
}
