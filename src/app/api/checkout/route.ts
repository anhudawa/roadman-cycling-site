import { NextResponse } from "next/server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // Dynamic import to avoid build-time errors when key is missing
  const StripeModule = require("stripe");
  const Stripe = StripeModule.default || StripeModule;
  return new Stripe(key);
}

// The Strength Training course price ID $— set in env or hardcode after creating in Stripe
const STRENGTH_TRAINING_PRICE_ID = process.env.STRIPE_STRENGTH_PRICE_ID;

export async function POST(request: Request) {
  try {
    const { priceId, successUrl, cancelUrl } = await request.json();

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured. Set STRIPE_SECRET_KEY in env." },
        { status: 500 }
      );
    }

    const price = priceId || STRENGTH_TRAINING_PRICE_ID;

    if (!price) {
      return NextResponse.json(
        { error: "No price ID configured. Set STRIPE_STRENGTH_PRICE_ID in env." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price,
          quantity: 1,
        },
      ],
      success_url:
        successUrl || "https://roadmancycling.com/strength-training/success",
      cancel_url:
        cancelUrl || "https://roadmancycling.com/strength-training",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
