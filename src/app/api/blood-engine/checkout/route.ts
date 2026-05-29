import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Creates a Stripe Checkout session for Blood Engine (€97 one-off).
 *
 * POST body: { successUrl?: string, cancelUrl?: string }
 *
 * Returns: { url: string }
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
  const priceId = process.env.STRIPE_BLOOD_ENGINE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { error: "Blood Engine price not configured. Set STRIPE_BLOOD_ENGINE_PRICE_ID." },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY in env." },
      { status: 500 }
    );
  }

  let body: { successUrl?: string; cancelUrl?: string } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine — use defaults
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_creation: "always",
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: body.successUrl || `${siteUrl()}/blood-engine/login?paid=1`,
      cancel_url: body.cancelUrl || `${siteUrl()}/blood-engine`,
      metadata: { product: "blood_engine" },
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[blood-engine/checkout] error:", error);
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
