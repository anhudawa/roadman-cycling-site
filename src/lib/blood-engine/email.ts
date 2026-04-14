/**
 * Resend transactional email helpers for Blood Engine.
 *
 * All emails carry the disclaimer in the footer. Resend is configured at the
 * project level (RESEND_API_KEY env var). If the key is missing we log a
 * warning and return false rather than throwing — useful in dev.
 */

import { Resend } from "resend";
import { BLOOD_ENGINE_DISCLAIMER } from "../../../content/blood-engine/disclaimer";

const FROM = "Blood Engine <noreply@roadmancycling.com>";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[blood-engine/email] RESEND_API_KEY missing — not sending email");
    return null;
  }
  return new Resend(key);
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://roadmancycling.com";
}

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="font-family:'Work Sans',system-ui,sans-serif;background:#252526;color:#FAFAFA;margin:0;padding:32px;">
    <div style="max-width:560px;margin:0 auto;background:#2E2E30;border-radius:12px;padding:32px;">
      <h1 style="font-family:'Bebas Neue',sans-serif;letter-spacing:.05em;color:#F16363;margin:0 0 16px;font-size:32px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top:32px;padding-top:16px;border-top:1px solid #444;font-size:11px;color:#9A9A9F;line-height:1.5;">${BLOOD_ENGINE_DISCLAIMER}</p>
    </div>
  </body></html>`;
}

export async function sendMagicLink(email: string, url: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Sign in to Blood Engine",
      html: shell(
        "Sign in to Blood Engine",
        `<p>Click the button below to sign in. The link expires in 30 minutes.</p>
         <p style="margin:24px 0;"><a href="${url}" style="display:inline-block;background:#F16363;color:#FAFAFA;padding:14px 28px;border-radius:6px;text-decoration:none;font-family:'Bebas Neue',sans-serif;letter-spacing:.1em;">Sign in</a></p>
         <p style="font-size:13px;color:#B0B0B5;">If the button doesn't work, paste this link into your browser:<br><span style="word-break:break-all;color:#F16363;">${url}</span></p>`
      ),
    });
    return true;
  } catch (err) {
    console.error("[blood-engine/email] sendMagicLink failed:", err);
    return false;
  }
}

export async function sendWelcomeAndMagicLink(email: string, url: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "You're in. Decode your bloodwork.",
      html: shell(
        "Welcome to Blood Engine",
        `<p>Your lifetime access is unlocked. Click below to sign in and run your first report.</p>
         <p style="margin:24px 0;"><a href="${url}" style="display:inline-block;background:#F16363;color:#FAFAFA;padding:14px 28px;border-radius:6px;text-decoration:none;font-family:'Bebas Neue',sans-serif;letter-spacing:.1em;">Open Blood Engine</a></p>
         <p style="font-size:13px;color:#B0B0B5;">Bookmark <a href="${siteUrl()}/blood-engine/dashboard" style="color:#F16363;">${siteUrl()}/blood-engine/dashboard</a> — sign in any time with the email link from <a href="${siteUrl()}/blood-engine/login" style="color:#F16363;">/blood-engine/login</a>.</p>
         <p style="font-size:13px;color:#B0B0B5;">This sign-in link expires in 30 minutes.</p>`
      ),
    });
    return true;
  } catch (err) {
    console.error("[blood-engine/email] sendWelcomeAndMagicLink failed:", err);
    return false;
  }
}

export async function sendRetestNudge(email: string, reportId: number, focusMarkers: string[]): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  const focus = focusMarkers.length > 0 ? focusMarkers.join(", ") : "the markers we flagged";
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Time to retest your bloodwork",
      html: shell(
        "It's retest time",
        `<p>Last time we recommended re-running ${focus}. Today's the day.</p>
         <p>Order your next panel from any provider, then upload it into Blood Engine to see exactly what's moved.</p>
         <p style="margin:24px 0;"><a href="${siteUrl()}/blood-engine/new" style="display:inline-block;background:#F16363;color:#FAFAFA;padding:14px 28px;border-radius:6px;text-decoration:none;font-family:'Bebas Neue',sans-serif;letter-spacing:.1em;">Run a new report</a></p>
         <p style="font-size:13px;color:#B0B0B5;">Reference: report #${reportId}</p>`
      ),
    });
    return true;
  } catch (err) {
    console.error("[blood-engine/email] sendRetestNudge failed:", err);
    return false;
  }
}

export async function sendAdminPurchaseNotification(email: string, amount: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: "Roadman Cycling <notifications@roadmancycling.com>",
      to: "admin@roadmancycling.com",
      subject: `New Blood Engine sale — ${email} (${amount})`,
      html: `<p>${email} purchased Blood Engine lifetime access (${amount}).</p>`,
    });
  } catch (err) {
    console.error("[blood-engine/email] sendAdminPurchaseNotification failed:", err);
  }
}
