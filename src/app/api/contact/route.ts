import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { upsertContact, addActivity } from "@/lib/crm/contacts";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { getResendClient } from "@/lib/integrations/resend";
import { rateLimitOr429 } from "@/lib/rate-limit/ip-rate-limit";
import {
  clampString,
  escapeHtml,
  LIMITS,
  normaliseEmail,
} from "@/lib/validation";

const NOTIFICATION_EMAIL = "anthony@roadmancycling.com";

export async function POST(request: Request) {
  // Per-IP rate limit. Without this, anyone could flood Anthony's
  // inbox via the contact form (each request triggers a Resend send +
  // Beehiiv subscribe + DB write). 5/10min is generous for a real
  // human filling the form and tight enough to defang automated abuse.
  const limited = await rateLimitOr429(request, {
    namespace: "contact",
    tokens: 5,
    window: "10 m",
  });
  if (limited) return limited;

  try {
    const raw = (await request.json()) as {
      name?: unknown;
      email?: unknown;
      subject?: unknown;
      message?: unknown;
    };

    // Validate + normalise. Each helper returns null if input is
    // missing, wrong type, empty after trim, or over the length cap.
    const name = clampString(raw.name, LIMITS.name);
    const email = normaliseEmail(raw.email);
    const subject = clampString(raw.subject, LIMITS.subject);
    const message = clampString(raw.message, LIMITS.message);

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          error: !email
            ? "Please enter a valid email address."
            : "All fields are required (under length limits).",
        },
        { status: 400 }
      );
    }

    console.log(`[Contact Form] From: ${name} <${email}> | Subject: ${subject}`);

    // Store in database
    try {
      await db.insert(contactSubmissions).values({
        name,
        email,
        subject,
        message,
      });
    } catch (dbErr) {
      console.error("[Contact Form] DB insert failed:", dbErr);
    }

    // CRM: upsert contact + activity (non-fatal)
    try {
      const contact = await upsertContact({
        email,
        name,
        source: "contact_form",
      });
      await addActivity(contact.id, {
        type: "contact_submission",
        title: subject,
        body: message,
        authorName: "system",
      });
    } catch (crmErr) {
      console.error("[Contact Form] CRM sync failed:", crmErr);
    }

    // Beehiiv sync — non-fatal, tagged contact-form so it can be
    // segmented or suppressed in Saturday Spin campaigns.
    subscribeToBeehiiv({
      email,
      name,
      tags: ["contact-form"],
      customFields: { last_contact_subject: subject.slice(0, 120) },
      utm: { source: "site", medium: "contact-form", campaign: "contact-form" },
    }).catch((err) => console.error("[Contact Form] Beehiiv sync failed:", err));

    // Send notification email to Anthony (Resend). Escape user input
    // to prevent HTML injection via contact form — even though only
    // Anthony sees it, this is the correct posture.
    const resend = getResendClient();
    if (resend) {
      try {
        const emailResult = await resend.emails.send({
          from: "Roadman Cycling <noreply@roadmancycling.com>",
          to: NOTIFICATION_EMAIL,
          replyTo: email,
          subject: `[Contact Form] ${subject} — from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <hr />
            <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
            <hr />
            <p style="color: #666; font-size: 12px;">Reply directly to this email to respond to ${escapeHtml(name)}.</p>
          `,
        });
        console.log("[Contact Form] Email sent:", JSON.stringify(emailResult));
      } catch (emailErr) {
        console.error("[Contact Form] Resend email failed:", emailErr);
      }
    } else {
      console.warn("[Contact Form] RESEND_API_KEY not configured — email not sent");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
