import { NextResponse } from "next/server";
import { Resend } from "resend";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const NOTIFICATION_EMAIL = "admin@roadmancycling.com";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const StripeModule = require("stripe");
  const Stripe = StripeModule.default || StripeModule;
  return new Stripe(key);
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe || !WEBHOOK_SECRET) {
    console.error("Stripe webhook: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error(`Stripe webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email || "unknown";
    const customerName = session.customer_details?.name || "unknown";
    const amount = session.amount_total
      ? `$${(session.amount_total / 100).toFixed(2)}`
      : "unknown";

    console.log(
      `[S&C SALE] ${customerName} (${customerEmail}) paid ${amount}`
    );

    // Send notification email
    const resend = getResend();
    if (resend) {
      try {
        await resend.emails.send({
          from: "Roadman Cycling <notifications@roadmancycling.com>",
          to: NOTIFICATION_EMAIL,
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
      } catch (emailErr) {
        console.error("Failed to send notification email:", emailErr);
      }
    } else {
      console.warn("Resend not configured — no email notification sent. Set RESEND_API_KEY.");
    }
  }

  return NextResponse.json({ received: true });
}
