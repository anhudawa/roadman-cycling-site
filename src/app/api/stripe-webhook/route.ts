import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dispatchStripeEvent } from "@/lib/stripe/dispatch";

/**
 * POST /api/stripe-webhook
 *
 * Legacy URL kept live so Stripe accounts that point here still work.
 * Verifies signature then defers to the shared dispatcher so paid_report,
 * spotlight, S&C, subscription, and refund events all route correctly
 * regardless of which webhook URL Stripe is configured to call.
 */

export async function POST(request: Request): Promise<Response> {
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripeKey || !webhookSecret) {
    console.error(
      "[stripe-webhook] missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET",
    );
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error(`[stripe-webhook] signature verification failed: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await dispatchStripeEvent(event, {
      stripe,
      webhookPath: "/api/stripe-webhook",
    });
  } catch (err) {
    // Dispatcher's contract is always-resolves; catching here is purely
    // defensive — once the signature is verified we own the event and
    // returning non-2xx triggers Stripe's retry storm for an internal
    // bug it can't fix. Log loudly instead.
    console.error("[stripe-webhook] dispatcher threw unexpectedly:", err);
  }

  return NextResponse.json({ received: true });
}
