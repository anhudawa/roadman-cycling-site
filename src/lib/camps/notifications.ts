/**
 * Camp booking emails. Modelled on the Inner-Circle / cohort flow:
 *  - admin notification to anthony@ on every booking
 *  - confirmation email to the applicant from anthony@
 *
 * Both go through Resend with the existing `emailWrapper` styling. Same
 * brand frame, same dark-purple header — the only difference is content.
 */

import type { CampConfig } from "./camps";
import { formatCampDates } from "./camps";

const FROM_ADDRESS = "Roadman Cycling <noreply@roadmancycling.com>";
const ADMIN_RECIPIENT = "anthony@roadmancycling.com";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

async function sendEmail(
  params: SendEmailParams,
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[camps/notifications] RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[camps/notifications] Resend error:", errorText);
      return { success: false, error: errorText };
    }
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[camps/notifications] Send failed:", message);
    return { success: false, error: message };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function emailWrapper(title: string, subtitle: string, body: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #210140; color: #FAFAFA; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="font-family: 'Bebas Neue', sans-serif; font-size: 28px; margin: 0; letter-spacing: 0.05em;">
          ${title}
        </h1>
        <p style="color: #F16363; margin: 8px 0 0 0; font-size: 14px;">
          ${subtitle}
        </p>
      </div>
      <div style="background: #2E2E30; color: #FAFAFA; padding: 24px; border-radius: 0 0 8px 8px;">
        ${body}
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="color: #545559; font-size: 12px; margin: 0;">
            Roadman Cycling &middot; Training Camps 2026
          </p>
        </div>
      </div>
    </div>
  `;
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: #B0B0B5; font-size: 13px; width: 40%;">${label}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 600;">${escapeHtml(value)}</td>
    </tr>
  `;
}

function table(rows: string): string {
  return `<table style="width: 100%; border-collapse: collapse;">${rows}</table>`;
}

export interface CampBookingPayload {
  name: string;
  email: string;
  phone: string;
  singleRoom: boolean;
  dietary: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medical: string;
  heardFrom: string;
}

export async function notifyCampBookingAdmin(args: {
  camp: CampConfig;
  booking: CampBookingPayload;
  status: "assigned" | "waitlist";
  roomLabel?: string;
}) {
  const { camp, booking, status, roomLabel } = args;

  const total =
    camp.pricePerPerson + (booking.singleRoom ? camp.singleSupplement : 0);

  const html = emailWrapper(
    status === "waitlist"
      ? `WAITLIST — ${camp.shortName.toUpperCase()}`
      : `NEW CAMP BOOKING — ${camp.shortName.toUpperCase()}`,
    formatCampDates(camp),
    table(
      row("Name", booking.name) +
        row("Email", booking.email) +
        row("Phone", booking.phone || "—") +
        row("Camp", camp.name) +
        row(
          "Single supplement",
          booking.singleRoom ? `Yes (+€${camp.singleSupplement})` : "No (shared)",
        ) +
        row("Auto-assigned room", roomLabel ?? "—") +
        row("Total due", `€${total.toLocaleString("en-IE")}`),
    ) +
      `<div style="margin-top: 20px;">
        <h3 style="color: #F16363; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Dietary requirements</h3>
        <p style="color: #B0B0B5; line-height: 1.6; margin: 0;">${escapeHtml(booking.dietary || "None given")}</p>
      </div>` +
      `<div style="margin-top: 20px;">
        <h3 style="color: #F16363; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Emergency contact</h3>
        <p style="color: #B0B0B5; line-height: 1.6; margin: 0;">${escapeHtml(booking.emergencyContactName || "—")} &middot; ${escapeHtml(booking.emergencyContactPhone || "—")}</p>
      </div>` +
      `<div style="margin-top: 20px;">
        <h3 style="color: #F16363; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Medical conditions</h3>
        <p style="color: #B0B0B5; line-height: 1.6; margin: 0;">${escapeHtml(booking.medical || "None given")}</p>
      </div>` +
      `<div style="margin-top: 20px;">
        <h3 style="color: #F16363; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">How they heard about us</h3>
        <p style="color: #B0B0B5; line-height: 1.6; margin: 0;">${escapeHtml(booking.heardFrom || "—")}</p>
      </div>` +
      `<p style="margin-top: 24px;">
        <a href="https://roadmancycling.com/admin/camps?camp=${camp.slug}" style="color: #F16363; text-decoration: underline;">
          View in admin →
        </a>
      </p>`,
  );

  return sendEmail({
    to: ADMIN_RECIPIENT,
    subject:
      status === "waitlist"
        ? `Waitlist: ${booking.name} — ${camp.shortName} Camp`
        : `Camp booking: ${booking.name} — ${camp.shortName} Camp`,
    html,
    replyTo: booking.email,
  });
}

export async function sendCampBookingConfirmation(args: {
  camp: CampConfig;
  name: string;
  email: string;
  singleRoom: boolean;
  status: "assigned" | "waitlist";
}) {
  const { camp, name, email, singleRoom, status } = args;
  const firstName = name.split(/\s+/)[0] || name;
  const dates = formatCampDates(camp);
  const total = camp.pricePerPerson + (singleRoom ? camp.singleSupplement : 0);

  const body =
    status === "waitlist"
      ? `
      <p style="color: #FAFAFA; line-height: 1.7; margin: 0 0 16px 0;">
        ${escapeHtml(firstName)}, payment received — but we've hit our cap.
      </p>
      <p style="color: #B0B0B5; line-height: 1.7; margin: 0 0 16px 0;">
        ${escapeHtml(camp.name)} (${escapeHtml(dates)}) is fully booked, so
        you're on the waitlist. We'll process a refund within 48 hours and
        I'll be in touch personally — if a spot opens up, you'll be the first
        to know.
      </p>
      <p style="color: #FAFAFA; line-height: 1.7; margin: 0;">
        Speak soon,<br/>Anthony
      </p>
    `
      : `
      <p style="color: #FAFAFA; line-height: 1.7; margin: 0 0 16px 0;">
        ${escapeHtml(firstName)}, you're in.
      </p>
      <p style="color: #B0B0B5; line-height: 1.7; margin: 0 0 16px 0;">
        Booked and paid for the <strong style="color:#FAFAFA;">${escapeHtml(camp.name)}</strong>
        &middot; ${escapeHtml(dates)}. Six days, five nights at our farmhouse
        base between Girona and Banyoles.
      </p>
      <p style="color: #B0B0B5; line-height: 1.7; margin: 0 0 16px 0;">
        Paid: <strong style="color:#FAFAFA;">€${total.toLocaleString("en-IE")}</strong>${singleRoom ? " (includes single-room supplement)" : ""}.
        Your card receipt is in a separate email from Stripe.
      </p>
      <p style="color: #B0B0B5; line-height: 1.7; margin: 0 0 16px 0;">
        I'll be back in your inbox closer to the camp with the intake form —
        kit list, flight times, food preferences. Heads up: refunds aren't a
        thing, but you can transfer the spot to a mate if something comes up.
      </p>
      <p style="color: #FAFAFA; line-height: 1.7; margin: 0;">
        See you in Girona,<br/>Anthony
      </p>
    `;

  const html = emailWrapper(
    status === "waitlist" ? "PAID — ON THE WAITLIST" : "PAID — YOU'RE IN",
    `${camp.shortName} &middot; ${dates}`,
    body,
  );

  return sendEmail({
    to: email,
    subject:
      status === "waitlist"
        ? `Waitlist (paid) — ${camp.name}`
        : `Confirmed — ${camp.name}`,
    html,
    replyTo: ADMIN_RECIPIENT,
  });
}
