import { z } from "zod";
import { recordEvent } from "@/lib/admin/events-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  sessionId: z.string().uuid().optional(),
  messageId: z.string().uuid().optional(),
  ctaKey: z.string().min(1).max(64),
  href: z.string().min(1).max(512),
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

  try {
    await recordEvent("ask_cta_clicked", "/ask", {
      sessionId: parsed.data.sessionId,
      meta: {
        ctaKey: parsed.data.ctaKey,
        href: parsed.data.href,
        ...(parsed.data.messageId ? { messageId: parsed.data.messageId } : {}),
      },
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[ask/cta-click] POST failed", err);
    return Response.json({ error: "Failed to record click." }, { status: 500 });
  }
}
