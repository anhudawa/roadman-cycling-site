import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { dispatchStripeEvent } from "@/lib/stripe/dispatch";

/**
 * POST /api/webhooks/stripe
 *
 * Primary webhook URL. Verifies signature then defers to the shared
 * dispatcher so all event handling lives in one place. The legacy URL
 * `/api/stripe-webhook` does the same — both are intentionally live so
 * a misconfigured webhook URL never silently drops events.
 */

export async function POST(request: NextRequest): Promise<Response> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    console.error(
      "[webhooks/stripe] missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET",
    );
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error(`[webhooks/stripe] signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  try {
    await dispatchStripeEvent(event, {
      stripe,
      webhookPath: "/api/webhooks/stripe",
    });
  } catch (err) {
    // Dispatcher's contract is always-resolves; catching here is purely
    // defensive — once the signature is verified we own the event and
    // returning non-2xx triggers Stripe's retry storm for an internal
    // bug it can't fix. Log loudly instead.
    console.error("[webhooks/stripe] dispatcher threw unexpectedly:", err);
  }

  return NextResponse.json({ received: true });
}
