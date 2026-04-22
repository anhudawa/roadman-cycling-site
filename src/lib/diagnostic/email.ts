import { Resend } from "resend";
import { escapeHtml } from "@/lib/validation";
import { labelFor } from "./profiles";
import type { Breakdown, Profile } from "./types";

/**
 * Transactional confirmation email sent via Resend immediately after
 * a submission. Short and service-oriented — just the link back to
 * the results page and a one-line "what you got" summary. The §13
 * nurture sequence (Emails 1–5, Beehiiv-authored) handles the actual
 * handoff + sell.
 *
 * Non-fatal — if RESEND_API_KEY is missing we log and return. The
 * user still has the results page and will be picked up by Beehiiv.
 */

const FROM = "Roadman Cycling <noreply@roadmancycling.com>";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function resultsUrl(slug: string): string {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://roadmancycling.com";
  return `${origin.replace(/\/$/, "")}/diagnostic/${slug}`;
}

export interface ConfirmationEmailInput {
  email: string;
  slug: string;
  primary: Profile;
  closeToBreakthrough: boolean;
  breakdown: Breakdown;
}

export async function sendDiagnosisConfirmation(
  input: ConfirmationEmailInput
): Promise<{ sent: boolean; messageId?: string; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "[Diagnostic] RESEND_API_KEY not configured — confirmation email skipped"
    );
    return { sent: false, error: "resend_not_configured" };
  }

  const profileLabel = labelFor(input.primary, input.closeToBreakthrough);
  const url = resultsUrl(input.slug);

  const subject = `Your diagnosis: ${profileLabel}`;
  const { html, text } = renderTemplate({
    profileLabel,
    headline: input.breakdown.headline,
    url,
  });

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: input.email,
      replyTo: "anthony@roadmancycling.com",
      subject,
      html,
      text,
    });
    return { sent: true, messageId: result.data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Diagnostic] Resend confirmation failed:", msg);
    return { sent: false, error: msg };
  }
}

interface TemplateInput {
  profileLabel: string;
  headline: string;
  url: string;
}

function renderTemplate(input: TemplateInput): { html: string; text: string } {
  const { profileLabel, headline, url } = input;
  const safeLabel = escapeHtml(profileLabel);
  const safeHeadline = escapeHtml(headline);
  const safeUrl = escapeHtml(url);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safeHeadline}</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <tr><td>
      <p style="font-size:12px;letter-spacing:2px;color:#F16363;margin:0 0 12px;text-transform:uppercase;font-weight:600;">
        Your diagnosis &middot; ${safeLabel}
      </p>
      <h1 style="font-size:26px;line-height:1.25;margin:0 0 16px;color:#252526;">
        ${safeHeadline}
      </h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 20px;color:#333;">
        Morning.
      </p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 20px;color:#333;">
        Your full diagnosis is on the link below. Takes about three
        minutes to read properly.
      </p>
      <p style="margin:28px 0;text-align:left;">
        <a href="${safeUrl}" style="display:inline-block;background:#F16363;color:#fff;text-decoration:none;padding:14px 24px;border-radius:6px;font-weight:600;letter-spacing:0.5px;">
          Open your diagnosis &rarr;
        </a>
      </p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 20px;color:#333;">
        Save the link. Some riders come back to this a few weeks in,
        once the denial wears off.
      </p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 8px;color:#333;">
        Anthony
      </p>
      <hr style="border:none;border-top:1px solid #e5e5e3;margin:32px 0;" />
      <p style="font-size:12px;line-height:1.5;color:#777;margin:0;">
        You&rsquo;re getting this because you just completed the
        Masters Plateau Diagnostic at
        <a href="https://roadmancycling.com/plateau" style="color:#777;">roadmancycling.com/plateau</a>.
        Unsubscribe in any follow-up email.
      </p>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `YOUR DIAGNOSIS — ${profileLabel}`,
    "",
    headline,
    "",
    "Morning.",
    "",
    "Your full diagnosis is on the link below. Takes about three minutes to read properly.",
    "",
    url,
    "",
    "Save the link. Some riders come back to this a few weeks in, once the denial wears off.",
    "",
    "Anthony",
    "",
    "—",
    "You're getting this because you just completed the Masters Plateau Diagnostic at https://roadmancycling.com/plateau.",
  ].join("\n");

  return { html, text };
}
