/**
 * Transactional emails for The Method. Reuses the project's existing
 * Resend setup (RESEND_API_KEY). Plain-text first, HTML second — the
 * audience opens emails in a wide range of clients.
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
    "If you didn't request this, you can ignore the email.",
    "",
    "— Anthony",
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
    `${greeting}`,
    "",
    "You're in. The Roadman Method is yours for life.",
    "",
    "Tap this link to set up access — it expires in 15 minutes:",
    "",
    url,
    "",
    "Once you're in, Module 01 — The Honest Baseline — is waiting. Read it carefully. The next eleven build on it.",
    "",
    "Anything you need — reply to this email.",
    "",
    "— Anthony",
  ].join("\n");

  await resend.emails.send({
    from: FROM,
    to: input.to,
    replyTo: getReplyTo(),
    subject: "Welcome to The Roadman Method",
    text,
    html: welcomeHtml({ greeting, url }),
  });
}

/* ─────────────────────────────────────────────────────────── */

function magicLinkHtml(url: string): string {
  return `<!doctype html>
<html><body style="background:#252526;color:#FAFAFA;font-family:'Work Sans',Arial,sans-serif;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;">
    <h1 style="font-family:'Bebas Neue',Arial,sans-serif;letter-spacing:0.04em;font-size:32px;margin:0 0 24px;">SIGN IN TO THE METHOD</h1>
    <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">Tap the button below — the link expires in 15 minutes and only works once.</p>
    <p style="margin:0 0 32px;">
      <a href="${url}" style="display:inline-block;background:#F16363;color:#FAFAFA;font-family:'Bebas Neue',Arial,sans-serif;letter-spacing:0.08em;font-size:16px;text-decoration:none;padding:14px 28px;border-radius:6px;">SIGN ME IN</a>
    </p>
    <p style="font-size:13px;color:#B0B0B5;line-height:1.6;margin:0 0 8px;">If the button doesn't work, paste this URL into your browser:</p>
    <p style="font-size:13px;color:#B0B0B5;word-break:break-all;margin:0 0 24px;">${url}</p>
    <p style="font-size:13px;color:#B0B0B5;margin:0;">If you didn't request this, you can ignore the email.</p>
  </div>
</body></html>`;
}

function welcomeHtml(input: { greeting: string; url: string }): string {
  return `<!doctype html>
<html><body style="background:#252526;color:#FAFAFA;font-family:'Work Sans',Arial,sans-serif;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;">
    <h1 style="font-family:'Bebas Neue',Arial,sans-serif;letter-spacing:0.04em;font-size:36px;margin:0 0 24px;">YOU'RE IN.</h1>
    <p style="font-size:18px;line-height:1.6;margin:0 0 16px;">${input.greeting}</p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">The Roadman Method is yours for life. Tap the button to set up access — the link expires in 15 minutes.</p>
    <p style="margin:0 0 32px;">
      <a href="${input.url}" style="display:inline-block;background:#F16363;color:#FAFAFA;font-family:'Bebas Neue',Arial,sans-serif;letter-spacing:0.08em;font-size:16px;text-decoration:none;padding:14px 28px;border-radius:6px;">START THE METHOD</a>
    </p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Once you're in, Module 01 — The Honest Baseline — is waiting. Read it carefully. The next eleven build on it.</p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 8px;">Anything you need — reply to this email.</p>
    <p style="font-size:16px;line-height:1.6;margin:0;">— Anthony</p>
  </div>
</body></html>`;
}
