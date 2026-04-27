/**
 * Admin notifications triggered by Stripe events.
 *
 * Pulled out of the inline route handler so the dispatcher (and tests)
 * can call it without owning the email rendering. All notifications are
 * non-fatal — Resend missing or failing must never break a webhook.
 */

import type Stripe from "stripe";
import { getResendClient } from "@/lib/integrations/resend";

const ADMIN_EMAIL =
  process.env.PAID_REPORT_ADMIN_EMAIL ??
  process.env.ADMIN_SALES_EMAIL ??
  "anthony@roadmancycling.com";
const FROM = "Roadman Cycling <notifications@roadmancycling.com>";

function formatAmount(cents: number | null | undefined): string {
  if (typeof cents !== "number") return "unknown";
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * S&C strength training course sale — legacy code path that pre-dates
 * the typed paid_report flow. Sends an admin email with the buyer's
 * details so Anthony can grant Skool access.
 */
export async function sendStripeSaleNotification(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const customerEmail =
    session.customer_details?.email ?? session.customer_email ?? "unknown";
  const customerName = session.customer_details?.name ?? "unknown";
  const amount = formatAmount(session.amount_total);

  console.log(
    `[stripe] sale notification: ${customerName} (${customerEmail}) ${amount}`,
  );

  const resend = getResendClient();
  if (!resend) {
    console.warn(
      "[stripe] Resend not configured — admin sale email skipped (set RESEND_API_KEY)",
    );
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New S&C Sale — ${customerName} (${amount})`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 500px;">
          <h2 style="margin-bottom: 4px;">New S&C Plan Purchase</h2>
          <p style="color: #666; margin-top: 0;">Grant this person access in Skool.</p>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #999; width: 80px;">Name</td>
              <td style="padding: 8px 0; font-weight: 600;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #999;">Email</td>
              <td style="padding: 8px 0; font-weight: 600;">${customerEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #999;">Amount</td>
              <td style="padding: 8px 0; font-weight: 600;">${amount}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; color: #999; font-size: 13px;">
            Action: Find them in Skool by email and grant S&C access.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[stripe] failed to send S&C admin email:", err);
  }
}

/**
 * Paid Race Report sale — confirms money has changed hands. The customer
 * delivery email is sent separately by the report generator; this is the
 * owner/operator alert so Anthony knows a report sold.
 */
export async function notifyPaidReportSale(args: {
  email: string;
  productSlug: string;
  orderId: number;
  paidReportId: number;
  amountCents: number | null | undefined;
  predictionSlug?: string | null;
}): Promise<void> {
  const amount = formatAmount(args.amountCents);
  console.log(
    `[stripe] paid report sale: ${args.productSlug} ${args.email} ${amount}`,
  );

  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `[stripe] Resend not configured — paid report sale email skipped for report ${args.paidReportId}`,
    );
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      replyTo: "anthony@roadmancycling.com",
      subject: `New Race Report Sale — ${amount}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 560px;">
          <h2 style="color: #4C1273; margin-bottom: 4px;">New Race Report sale</h2>
          <p style="color: #545559; margin-top: 0;">
            Stripe checkout completed. The report generator should now create and email the customer's private report link.
          </p>
          <table style="border-collapse: collapse; width: 100%; margin-top: 12px;">
            <tr><td style="padding: 6px 0; color: #888; width: 120px;">Customer</td><td style="padding: 6px 0; font-weight: 600;">${args.email}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Amount</td><td style="padding: 6px 0; font-weight: 600;">${amount}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Product</td><td style="padding: 6px 0; font-weight: 600;">${args.productSlug}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Order ID</td><td style="padding: 6px 0; font-weight: 600;">${args.orderId}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Report ID</td><td style="padding: 6px 0; font-weight: 600;">${args.paidReportId}</td></tr>
            ${
              args.predictionSlug
                ? `<tr><td style="padding: 6px 0; color: #888;">Prediction</td><td style="padding: 6px 0; font-weight: 600;"><a href="https://roadmancycling.com/predict/${args.predictionSlug}">${args.predictionSlug}</a></td></tr>`
                : ""
            }
          </table>
          <p style="margin-top: 18px; color: #545559; font-size: 13px;">
            Admin: open <strong>/admin/paid-reports</strong> to check delivery status.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[stripe] failed to send paid report sale email:", err);
  }
}

/**
 * Paid-report delivery failed — fired by the generator when the report
 * stays in `failed` state. Admin needs to resend manually or refund.
 */
export async function notifyPaidReportDeliveryFailed(args: {
  paidReportId: number;
  email: string;
  productSlug: string;
  reason: string;
}): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `[stripe] Resend not configured — admin failure email skipped for report ${args.paidReportId}`,
    );
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      replyTo: "anthony@roadmancycling.com",
      subject: `[ACTION] Paid report ${args.paidReportId} delivery failed`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 540px;">
          <h2 style="color: #4C1273; margin-bottom: 4px;">Paid report delivery failed</h2>
          <p style="color: #545559; margin-top: 0;">
            A paying customer is waiting on a report we couldn't deliver. Resend manually or refund.
          </p>
          <table style="border-collapse: collapse; width: 100%; margin-top: 12px;">
            <tr><td style="padding: 6px 0; color: #888; width: 110px;">Report ID</td><td style="padding: 6px 0; font-weight: 600;">${args.paidReportId}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Customer</td><td style="padding: 6px 0; font-weight: 600;">${args.email}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Product</td><td style="padding: 6px 0; font-weight: 600;">${args.productSlug}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Reason</td><td style="padding: 6px 0; font-weight: 600; color: #F16363;">${args.reason}</td></tr>
          </table>
          <p style="margin-top: 18px; color: #545559; font-size: 13px;">
            Open <strong>/admin/paid-reports</strong> to resend or refund.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[stripe] failed to send admin failure email:", err);
  }
}
