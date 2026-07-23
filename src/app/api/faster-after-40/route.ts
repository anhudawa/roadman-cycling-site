import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/admin/events-store";
import { upsertOnSignup } from "@/lib/admin/subscribers-store";
import { upsertContact, addActivity } from "@/lib/crm/contacts";
import { buildFasterAfter40WelcomeEmail } from "@/lib/emails/faster-after-40-welcome";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { getResendClient } from "@/lib/integrations/resend";
import { rateLimitOr429 } from "@/lib/rate-limit/ip-rate-limit";
import { clampString, LIMITS, normaliseEmail } from "@/lib/validation";
import { getLeadMagnet } from "@/lib/cta/lead-magnets";

const MAGNET = getLeadMagnet("faster-after-40");
const RESEND_FROM_ADDRESS = "Roadman Cycling <noreply@roadmancycling.com>";
const SOURCE = "lead-magnet-faster-after-40";

/**
 * Faster After 40 squeeze page — subscribe + asset delivery.
 *
 * Flow:
 *   1. Validate email (required) + firstName (optional)
 *   2. Record analytics event + CRM subscriber row
 *   3. Subscribe in Beehiiv with "faster-after-40" tag
 *   4. Send transactional welcome email via Resend with PDF download link
 *   5. Return success with download URL for immediate gratification
 *
 * CORS: allows requests from roadmancycling.com, localhost, and any
 * Vercel preview deployment so the standalone HTML squeeze page works
 * regardless of where it's hosted.
 */

// ── CORS helpers ────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "https://roadmancycling.com",
  "https://www.roadmancycling.com",
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Vercel preview deployments
  if (origin.endsWith(".vercel.app")) return true;
  // Local dev
  if (origin.startsWith("http://localhost:")) return true;
  if (origin.startsWith("http://127.0.0.1:")) return true;
  return false;
}

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  if (isAllowedOrigin(origin)) {
    return {
      "Access-Control-Allow-Origin": origin!,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };
  }
  return {};
}

// ── OPTIONS (CORS preflight) ────────────────────────────────

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

// ── POST handler ────────────────────────────────────────────

export async function POST(request: Request) {
  const cors = corsHeaders(request);

  // Rate limit: 10 requests per 10 minutes per IP
  const limited = await rateLimitOr429(request, {
    namespace: "faster-after-40",
    tokens: 10,
    window: "10 m",
  });
  if (limited) {
    return new NextResponse(limited.body, {
      status: limited.status,
      headers: { ...Object.fromEntries(limited.headers.entries()), ...cors },
    });
  }

  try {
    const raw = (await request.json()) as {
      email?: unknown;
      firstName?: unknown;
    };

    const email = normaliseEmail(raw.email);
    if (!email) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400, headers: cors },
      );
    }

    const firstName = clampString(raw.firstName, LIMITS.name) ?? undefined;

    const customFields: Record<string, string> = {
      last_lead_magnet: "faster-after-40",
    };

    // ── Analytics + CRM subscriber (non-fatal) ──────────────

    try {
      await Promise.all([
        recordEvent("signup", SOURCE, {
          email,
          source: SOURCE,
          userAgent: request.headers.get("user-agent") || undefined,
        }),
        upsertOnSignup(email, SOURCE, SOURCE),
      ]);
    } catch (err) {
      console.error("[faster-after-40] Analytics recording failed:", err);
    }

    // ── CRM contact (non-fatal) ─────────────────────────────

    try {
      const contact = await upsertContact({
        email,
        name: firstName,
        source: "subscribers",
        customFields,
      });
      await addActivity(contact.id, {
        type: "tag_added",
        title: `Requested lead magnet: ${MAGNET.label}`,
        meta: { magnet: "faster-after-40" },
        authorName: "system",
      });
    } catch (err) {
      console.error("[faster-after-40] CRM sync failed:", err);
    }

    // ── Beehiiv subscribe ───────────────────────────────────

    const result = await subscribeToBeehiiv({
      email,
      name: firstName,
      tags: MAGNET.beehiivTags,
      customFields,
      sendWelcomeEmail: false,
      utm: {
        source: "site",
        medium: "lead-magnet",
        campaign: "faster-after-40",
      },
    });

    // ── Transactional welcome email via Resend ──────────────

    const resend = getResendClient();
    if (resend) {
      try {
        const payload = buildFasterAfter40WelcomeEmail(firstName);
        const sendResult = await resend.emails.send({
          from: RESEND_FROM_ADDRESS,
          to: email,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          replyTo: "anthony@roadmancycling.com",
          tags: [
            { name: "campaign", value: "faster-after-40" },
            { name: "source", value: "squeeze-page" },
          ],
        });
        console.log(
          "[faster-after-40] Welcome email sent:",
          JSON.stringify(sendResult),
        );
      } catch (emailErr) {
        console.error("[faster-after-40] Resend welcome failed:", emailErr);
      }
    } else {
      console.warn(
        "[faster-after-40] RESEND_API_KEY not configured — welcome email skipped",
      );
    }

    // ── Response ────────────────────────────────────────────

    return NextResponse.json(
      {
        success: true,
        beehiivSynced: Boolean(result.subscriberId),
        downloadUrl: "/downloads/faster-after-40-report.pdf",
      },
      { headers: cors },
    );
  } catch (error) {
    console.error("[faster-after-40] API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again or email anthony@roadmancycling.com" },
      { status: 500, headers: cors },
    );
  }
}
