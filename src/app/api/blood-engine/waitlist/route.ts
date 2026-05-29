import { NextResponse } from "next/server";
import { Resend } from "resend";
import { addToWaitlist } from "@/lib/blood-engine/waitlist";

/**
 * POST /api/blood-engine/waitlist
 * body: { email: string, source?: string }
 *
 * Idempotent. Always returns 200 with { ok: true, isNew } — never leaks
 * whether an email was new vs. already on the list (except via the isNew
 * flag the client uses to vary the thank-you copy).
 *
 * Admin gets a single notification email on first signup only.
 */
export async function POST(request: Request) {
  let body: { email?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  }
  // Cap source to a reasonable length to prevent abuse.
  const rawSource = typeof body?.source === "string" ? body.source : "landing";
  const source = rawSource.slice(0, 64);

  const referrer = request.headers.get("referer")?.slice(0, 500) ?? null;
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;
  // Vercel sets x-forwarded-for; fall back to x-real-ip.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  try {
    const { isNew } = await addToWaitlist({ email, source, referrer, userAgent, ip });

    if (isNew) {
      // Fire-and-forget admin notification.
      void notifyAdmin(email, source).catch((err) =>
        console.error("[blood-engine/waitlist] admin notify failed:", err)
      );
    }

    return NextResponse.json({ ok: true, isNew });
  } catch (err) {
    console.error("[blood-engine/waitlist] insert failed:", err);
    return NextResponse.json({ error: "Could not add you to the list" }, { status: 500 });
  }
}

async function notifyAdmin(email: string, source: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const resend = new Resend(key);
  await resend.emails.send({
    from: "Roadman Cycling <notifications@roadmancycling.com>",
    to: "admin@roadmancycling.com",
    subject: `Blood Engine waitlist +1 — ${email}`,
    html: `<div style="font-family:system-ui,sans-serif">
      <p><strong>${email}</strong> just joined the Blood Engine waiting list.</p>
      <p>Source: <code>${escapeHtml(source)}</code></p>
      <p>See full list: <a href="https://roadmancycling.com/admin/blood-engine/waitlist">/admin/blood-engine/waitlist</a></p>
    </div>`,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
