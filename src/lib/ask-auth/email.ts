/**
 * Magic-link email for the Ask Roadman lead-gen gate.
 *
 * Brand-styled (dark charcoal background, coral accent, Bebas Neue
 * header — falling back to Arial Black where webfonts can't load,
 * since most inbox clients strip <link> imports). Suppresses no-image
 * fallbacks: the entire layout is plain HTML tables so it renders
 * identically in Gmail, Apple Mail, and Outlook.
 */

import { getResendClient } from "@/lib/integrations/resend";
import { escapeHtml } from "@/lib/validation";

const FROM = "Roadman Cycling <hello@roadmancycling.com>";

function getReplyTo(): string {
  return "anthony@roadmancycling.com";
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://roadmancycling.com";
}

export async function sendAskMagicLinkEmail(input: {
  to: string;
  rawToken: string;
}): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[ask-auth] RESEND_API_KEY not configured — magic link skipped");
    return;
  }
  const url = `${getSiteUrl()}/api/ask/auth/verify?token=${encodeURIComponent(input.rawToken)}`;
  const text = [
    "Tap the link below to start asking Roadman.",
    "",
    "It expires in 15 minutes and works once.",
    "",
    url,
    "",
    "If you didn't request this, you can safely ignore this email.",
    "",
    "— Roadman Cycling",
  ].join("\n");

  await resend.emails.send({
    from: FROM,
    to: input.to,
    replyTo: getReplyTo(),
    subject: "Your Ask Roadman sign-in link",
    text,
    html: askMagicLinkHtml(url),
    tags: [{ name: "campaign", value: "ask-roadman-magic-link" }],
  });
}

function askMagicLinkHtml(url: string): string {
  const safeUrl = escapeHtml(url);
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ask Roadman — sign in</title>
</head>
<body style="margin:0;padding:0;background:#252526;color:#FAFAFA;font-family:'Work Sans',Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#252526;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;">
        <tr><td style="padding:0 0 28px 0;">
          <p style="margin:0 0 10px 0;color:#F16363;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;font-family:'Bebas Neue',Arial Black,sans-serif;font-weight:700;">Ask Roadman</p>
          <h1 style="margin:0;font-size:34px;line-height:1.02;letter-spacing:0.01em;text-transform:uppercase;color:#FAFAFA;font-family:'Bebas Neue',Arial Black,sans-serif;font-weight:700;">
            One tap and you're in.
          </h1>
        </td></tr>

        <tr><td style="padding:0 0 24px 0;color:#CBD5E1;font-size:16px;line-height:1.6;">
          You asked for a sign-in link to Ask Roadman — Anthony's coaching brain on tap, grounded in a 1,400+ episode podcast catalogue featuring World Tour coaches, sports scientists, and pro cyclists.
        </td></tr>

        <tr><td style="padding:0 0 28px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr><td bgcolor="#F16363" style="background:#F16363;border-radius:6px;">
              <a href="${safeUrl}"
                 style="display:inline-block;padding:16px 28px;color:#252526;text-decoration:none;font-family:'Bebas Neue',Arial Black,sans-serif;font-weight:700;font-size:16px;letter-spacing:0.16em;text-transform:uppercase;">
                Start asking →
              </a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 0 8px 0;color:#94A3B8;font-size:13px;line-height:1.5;">
          The link expires in 15 minutes and only works once. After that you'll stay signed in for a week.
        </td></tr>
        <tr><td style="padding:0 0 24px 0;color:#94A3B8;font-size:12px;line-height:1.55;word-break:break-all;">
          Or paste this into your browser:<br>
          <a href="${safeUrl}" style="color:#F16363;text-decoration:underline;">${safeUrl}</a>
        </td></tr>

        <tr><td style="padding:20px 0 0 0;border-top:1px solid #3A3A3D;color:#64748B;font-size:12px;line-height:1.55;">
          Didn't request this? You can safely ignore this email — nothing happens until you tap the link.
        </td></tr>
        <tr><td style="padding:18px 0 0 0;color:#64748B;font-size:11px;line-height:1.55;letter-spacing:0.04em;">
          Roadman Cycling — Cycling is hard. This will help.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
