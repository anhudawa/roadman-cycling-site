/**
 * Transactional emails for The Method. Reuses the project's existing
 * Resend setup (RESEND_API_KEY).
 *
 * Plain-text first, HTML second — the audience opens emails in a wide
 * range of clients (Apple Mail, Outlook, Gmail web/native, Hey, Spark,
 * Superhuman, Fastmail). The HTML uses inline styles only and avoids
 * web fonts in the body — Bebas Neue and Work Sans don't render
 * reliably across clients, so we use Arial as the metric-equivalent
 * fallback and reserve the brand fonts for screen.
 */

import { Resend } from "resend";

const FROM = "The Roadman Method <method@roadmancycling.com>";

function getReplyTo(): string {
  return process.env.METHOD_SUPPORT_EMAIL ?? "support@roadmancycling.com";
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://roadmancycling.com";
}

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

export async function sendMethodMagicLink(input: {
  to: string;
  rawToken: string;
}): Promise<void> {
  const resend = getResend();
  const url = `${getSiteUrl()}/api/method/login/verify?token=${encodeURIComponent(input.rawToken)}`;
  const text = [
    "Sign in to The Roadman Method.",
    "",
    "Tap the link below — it expires in 15 minutes and only works once.",
    "",
    url,
    "",
    "If you didn't request this, you can safely ignore this email.",
    "",
    "— Anthony",
    "Roadman Cycling",
  ].join("\n");

  await resend.emails.send({
    from: FROM,
    to: input.to,
    replyTo: getReplyTo(),
    subject: "Your sign-in link for The Method",
    text,
    html: magicLinkHtml(url),
  });
}

export async function sendMethodWelcomeEmail(input: {
  to: string;
  name: string | null;
  rawToken: string;
}): Promise<void> {
  const resend = getResend();
  const url = `${getSiteUrl()}/api/method/login/verify?token=${encodeURIComponent(input.rawToken)}`;
  const greeting = input.name ? `${input.name},` : "Welcome,";
  const text = [
    greeting,
    "",
    "You're in. The Roadman Method is yours for life.",
    "",
    "Tap this link to set up access — it expires in 15 minutes:",
    "",
    url,
    "",
    "Once you're in, Module 01 — The Honest Baseline — is waiting.",
    "Read it carefully. The next eleven build on it.",
    "",
    "Twelve weeks from now you'll be running the system, not following it. That's the point.",
    "",
    "Anything you need — reply to this email.",
    "",
    "— Anthony",
    "Roadman Cycling",
  ].join("\n");

  await resend.emails.send({
    from: FROM,
    to: input.to,
    replyTo: getReplyTo(),
    subject: "You're in — start The Method",
    text,
    html: welcomeHtml({ greeting, url }),
  });
}

/* ─────────────────────────────────────────────────────────── */
/*  HTML templates                                              */
/* ─────────────────────────────────────────────────────────── */

const HEADING_FONT = "'Helvetica Neue', Arial, sans-serif";
const BODY_FONT = "'Helvetica Neue', Arial, sans-serif";
const CHARCOAL = "#252526";
const DEEP_PURPLE = "#210140";
const CORAL = "#F16363";
const OFF_WHITE = "#FAFAFA";
const MUTED = "#9999A0";
const BORDER = "#3A3A3D";

function magicLinkHtml(url: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${CHARCOAL};">
  <div style="background:linear-gradient(180deg,${DEEP_PURPLE} 0%,${CHARCOAL} 60%);padding:48px 16px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:${CHARCOAL};border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:32px 32px 0 32px;">
          <p style="margin:0 0 8px;color:${CORAL};font-family:${HEADING_FONT};font-size:11px;letter-spacing:4px;text-transform:uppercase;">ROADMAN · THE METHOD</p>
          <h1 style="margin:0 0 24px;color:${OFF_WHITE};font-family:${HEADING_FONT};font-weight:700;font-size:30px;letter-spacing:1px;text-transform:uppercase;line-height:1;">Sign in</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px;">
          <p style="margin:0 0 24px;color:${OFF_WHITE};font-family:${BODY_FONT};font-size:16px;line-height:1.6;">Tap the button below — the link expires in 15 minutes and only works once.</p>
          <p style="margin:0 0 28px;">
            <a href="${url}" style="display:inline-block;background:${CORAL};color:${OFF_WHITE};font-family:${HEADING_FONT};font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:14px;text-decoration:none;padding:14px 28px;border-radius:6px;">Sign me in</a>
          </p>
          <p style="margin:0 0 8px;color:${MUTED};font-family:${BODY_FONT};font-size:12px;line-height:1.6;">Button not working? Paste this URL into your browser:</p>
          <p style="margin:0 0 24px;color:${MUTED};font-family:${BODY_FONT};font-size:12px;line-height:1.6;word-break:break-all;">${url}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px 32px 32px;border-top:1px solid ${BORDER};">
          <p style="margin:0 0 6px;color:${MUTED};font-family:${BODY_FONT};font-size:12px;line-height:1.6;">Didn't ask for this? You can safely ignore this email — without a click, no session is created.</p>
          <p style="margin:0;color:${MUTED};font-family:${BODY_FONT};font-size:12px;line-height:1.6;">Roadman Cycling · roadmancycling.com</p>
        </td>
      </tr>
    </table>
  </div>
</body></html>`;
}

function welcomeHtml(input: { greeting: string; url: string }): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${CHARCOAL};">
  <div style="background:linear-gradient(180deg,${DEEP_PURPLE} 0%,${CHARCOAL} 55%);padding:48px 16px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:${CHARCOAL};border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:36px 32px 0 32px;">
          <p style="margin:0 0 8px;color:${CORAL};font-family:${HEADING_FONT};font-size:11px;letter-spacing:4px;text-transform:uppercase;">ENROLLED · LIFETIME ACCESS</p>
          <h1 style="margin:0 0 24px;color:${OFF_WHITE};font-family:${HEADING_FONT};font-weight:700;font-size:42px;letter-spacing:1px;text-transform:uppercase;line-height:0.95;">You're in.</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px;">
          <p style="margin:0 0 16px;color:${OFF_WHITE};font-family:${BODY_FONT};font-size:18px;line-height:1.55;">${input.greeting}</p>
          <p style="margin:0 0 24px;color:${OFF_WHITE};font-family:${BODY_FONT};font-size:16px;line-height:1.65;">The Roadman Method is yours for life. Twelve weeks. Five pillars. One framework — built on the conversations behind Grand Tour wins.</p>
          <p style="margin:0 0 28px;color:${OFF_WHITE};font-family:${BODY_FONT};font-size:16px;line-height:1.65;">Tap the button to set up access — the link expires in 15 minutes.</p>
          <p style="margin:0 0 32px;">
            <a href="${input.url}" style="display:inline-block;background:${CORAL};color:${OFF_WHITE};font-family:${HEADING_FONT};font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:14px;text-decoration:none;padding:16px 32px;border-radius:6px;box-shadow:0 0 24px rgba(241,99,99,0.35);">Start The Method</a>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px;">
          <p style="margin:0 0 8px;color:${CORAL};font-family:${HEADING_FONT};font-size:11px;letter-spacing:4px;text-transform:uppercase;">WEEK 01 · COACHING</p>
          <h2 style="margin:0 0 12px;color:${OFF_WHITE};font-family:${HEADING_FONT};font-weight:700;font-size:22px;letter-spacing:1px;text-transform:uppercase;line-height:1.1;">Module 01 — The Honest Baseline</h2>
          <p style="margin:0 0 24px;color:${OFF_WHITE};font-family:${BODY_FONT};font-size:15px;line-height:1.65;">Where you actually are — power, weight, sleep, stress. Most serious amateurs have never done a proper audit of their own training. We start there. Read it carefully. The next eleven modules build on it.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px;">
          <p style="margin:0 0 8px;color:${OFF_WHITE};font-family:${BODY_FONT};font-size:15px;line-height:1.65;">Twelve weeks from now, the shift is from "I must be doing something wrong" to "I know exactly what I'm doing and why." That's the point.</p>
          <p style="margin:0 0 8px;color:${OFF_WHITE};font-family:${BODY_FONT};font-size:15px;line-height:1.65;">Anything you need — just reply to this email.</p>
          <p style="margin:24px 0 0;color:${OFF_WHITE};font-family:${BODY_FONT};font-size:15px;line-height:1.65;">— Anthony<br/><span style="color:${MUTED};">Host, Roadman Cycling</span></p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px 32px 32px;border-top:1px solid ${BORDER};margin-top:24px;">
          <p style="margin:0 0 6px;color:${MUTED};font-family:${BODY_FONT};font-size:12px;line-height:1.6;">If the button doesn't work, paste this URL into your browser:</p>
          <p style="margin:0 0 16px;color:${MUTED};font-family:${BODY_FONT};font-size:12px;line-height:1.6;word-break:break-all;">${input.url}</p>
          <p style="margin:0;color:${MUTED};font-family:${BODY_FONT};font-size:12px;line-height:1.6;">Roadman Cycling · roadmancycling.com</p>
        </td>
      </tr>
    </table>
  </div>
</body></html>`;
}
