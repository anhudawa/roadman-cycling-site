import { NextResponse } from "next/server";
import Stripe from "stripe";
import { grantAccess } from "@/lib/blood-engine/db";
import { mintMagicLinkToken, magicLinkUrl } from "@/lib/blood-engine/magic-link";
import {
  sendAdminPurchaseNotification,
  sendWelcomeAndMagicLink,
} from "@/lib/blood-engine/email";

/**
 * Dedicated Stripe webhook endpoint for Blood Engine purchases.
 * Configure in Stripe → Webhooks with its own endpoint + secret
 * (STRIPE_BLOOD_ENGINE_WEBHOOK_SECRET), separate from the existing
 * /api/stripe-webhook endpoint.
 *
 * Listens for `checkout.session.completed` and grants lifetime access.
 */

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://roadmancycling.com";
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_BLOOD_ENGINE_WEBHOOK_SECRET;
  const stripe = getStripe();
  if (!stripe || !secret) {
    console.error(
      "[blood-engine/stripe-webhook] missing STRIPE_SECRET_KEY or STRIPE_BLOOD_ENGINE_WEBHOOK_SECRET"
    );
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error(`[blood-engine/stripe-webhook] signature verification failed: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object;
  const email: string | undefined =
    session.customer_details?.email || session.customer_email || undefined;
  if (!email) {
    console.error("[blood-engine/stripe-webhook] no email on session", session.id);
    return NextResponse.json({ error: "No email on session" }, { status: 400 });
  }

  // Blood Engine sessions carry metadata.product = "blood_engine". Defend
  // against the webhook being fired for non-BE sessions even if the endpoint
  // is misconfigured.
  const product = session.metadata?.product;
  if (product && product !== "blood_engine") {
    return NextResponse.json({ received: true, ignored: "non-be-session" });
  }

  try {
    const user = await grantAccess({
      email,
      stripeCustomerId:
        typeof session.customer === "string" ? session.customer : session.customer?.id,
      stripeSessionId: session.id,
    });

    const token = mintMagicLinkToken(user.id);
    const link = magicLinkUrl(siteUrl(), token);

    await sendWelcomeAndMagicLink(email, link);

    const amount = session.amount_total
      ? `€${(session.amount_total / 100).toFixed(2)}`
      : "unknown";
    await sendAdminPurchaseNotification(email, amount);

    return NextResponse.json({ received: true, userId: user.id });
  } catch (err) {
    console.error("[blood-engine/stripe-webhook] grantAccess failed:", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
