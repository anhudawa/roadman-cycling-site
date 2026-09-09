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
const DEFAULT_SOURCE = "named_pdf";
const ALLOWED_SOURCES = new Set(["named_pdf", "podcast", "youtube", "site"]);

function cleanAttribution(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().slice(0, 120);
  if (!cleaned || !/^[a-zA-Z0-9._-]+$/.test(cleaned)) return undefined;
  return cleaned;
}

/**
 * Faster After 40 landing — Saturday Spin subscribe + report delivery.
 *
 * Flow:
 *   1. Validate email (required) + firstName (optional)
 *   2. Record analytics/CRM attribution
 *   3. Subscribe to The Saturday Spin in Beehiiv
 *   4. Send the existing transactional report email via Resend
 *   5. Return the durable on-site PDF URL for immediate download
 *
 * Beehiiv automations are intentionally not managed here.
 */

const ALLOWED_ORIGINS = [
  "https://roadmancycling.com",
  "https://www.roadmancycling.com",
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
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

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export async function POST(request: Request) {
  const cors = corsHeaders(request);

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
      source?: unknown;
      utm_source?: unknown;
      utm_medium?: unknown;
      utm_campaign?: unknown;
    };

    const email = normaliseEmail(raw.email);
    if (!email) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400, headers: cors },
      );
    }

    const firstName = clampString(raw.firstName, LIMITS.name) ?? undefined;
    const requestedSource = cleanAttribution(raw.source);
    const acquisitionSource =
      requestedSource && ALLOWED_SOURCES.has(requestedSource)
        ? requestedSource
        : DEFAULT_SOURCE;
    const utmSource = cleanAttribution(raw.utm_source);
    const utmMedium = cleanAttribution(raw.utm_medium);
    const utmCampaign = cleanAttribution(raw.utm_campaign);

    const customFields: Record<string, string> = {
      last_lead_magnet: "faster-after-40",
    };

    try {
      await Promise.all([
        recordEvent("signup", acquisitionSource, {
          email,
          source: acquisitionSource,
          userAgent: request.headers.get("user-agent") || undefined,
          meta: {
            leadMagnet: "faster-after-40",
            ...(utmSource ? { utm_source: utmSource } : {}),
            ...(utmMedium ? { utm_medium: utmMedium } : {}),
            ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
          },
        }),
        upsertOnSignup(email, acquisitionSource, acquisitionSource),
      ]);
    } catch (err) {
      console.error("[faster-after-40] Analytics recording failed:", err);
    }

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
        meta: { magnet: "faster-after-40", source: acquisitionSource },
        authorName: "system",
      });
    } catch (err) {
      console.error("[faster-after-40] CRM sync failed:", err);
    }

    const result = await subscribeToBeehiiv({
      email,
      name: firstName,
      tags: MAGNET.beehiivTags,
      customFields,
      sendWelcomeEmail: false,
      utm: {
        source: utmSource || acquisitionSource,
        medium: utmMedium || "lead-magnet",
        campaign: utmCampaign || "faster-after-40",
      },
    });

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
            { name: "source", value: acquisitionSource },
          ],
        });
        console.log(
          "[faster-after-40] Report email sent:",
          JSON.stringify(sendResult),
        );
      } catch (emailErr) {
        console.error("[faster-after-40] Resend report email failed:", emailErr);
      }
    } else {
      console.warn(
        "[faster-after-40] RESEND_API_KEY not configured — report email skipped",
      );
    }

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
