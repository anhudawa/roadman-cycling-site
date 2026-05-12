/**
 * Rider profile login — magic-link email.
 *
 * Mirrors the look of the Method magic link but talks to riders who
 * may not be enrolled in the paid course. The "from" address is the
 * generic Roadman one so it doesn't imply Method membership.
 */

import { Resend } from "resend";

const FROM = "Roadman Cycling <hello@roadmancycling.com>";

function getReplyTo(): string {
  return process.env.METHOD_SUPPORT_EMAIL ?? "sarah@roadmancycling.com";
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://roadmancycling.com";
}

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

export async function sendRiderProfileMagicLink(input: {
  to: string;
  rawToken: string;
}): Promise<void> {
  const resend = getResend();
  const url = `${getSiteUrl()}/api/profile/login/verify?token=${encodeURIComponent(input.rawToken)}`;
  const text = [
    "Sign in to your Roadman rider profile.",
    "",
    "Tap the link below — it expires in 15 minutes and only works once.",
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
    subject: "Your Roadman rider-profile sign-in link",
    text,
    html: magicLinkHtml(url),
  });
}

function magicLinkHtml(url: string): string {
  return `<!doctype html>
<html><body style="margin:0;background:#252526;color:#FAFAFA;font-family:Arial,sans-serif;padding:32px 16px;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;">
    <tr><td style="padding-bottom:24px;">
      <p style="margin:0 0 8px 0;color:#F16363;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;">Roadman Cycling</p>
      <h1 style="margin:0;font-size:28px;line-height:1.05;text-transform:uppercase;">Sign in to your rider profile</h1>
    </td></tr>
    <tr><td style="padding-bottom:24px;color:#CBD5E1;font-size:15px;line-height:1.55;">
      Tap the button below to sign in. The link works once and expires in 15 minutes.
    </td></tr>
    <tr><td style="padding-bottom:24px;">
      <a href="${url}" style="display:inline-block;background:#F16363;color:#0B0B0E;font-weight:700;text-decoration:none;padding:14px 22px;border-radius:6px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;">Sign me in</a>
    </td></tr>
    <tr><td style="padding-bottom:8px;color:#94A3B8;font-size:12px;line-height:1.55;">
      Or paste this URL into your browser:
    </td></tr>
    <tr><td style="padding-bottom:24px;color:#94A3B8;font-size:12px;line-height:1.55;word-break:break-all;">
      ${url}
    </td></tr>
    <tr><td style="padding-top:16px;border-top:1px solid #2F2F33;color:#64748B;font-size:12px;line-height:1.55;">
      Didn't request this? You can safely ignore this email — no changes will be made to your profile.
    </td></tr>
  </table>
</body></html>`;
}
