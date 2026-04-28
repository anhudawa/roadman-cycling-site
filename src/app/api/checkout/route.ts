import { NextResponse } from "next/server";

async function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // Dynamic import to avoid build-time errors when key is missing
  const StripeModule = await import("stripe");
  const Stripe = StripeModule.default || StripeModule;
  return new Stripe(key);
}

// The Strength Training course price ID — set in env or hardcode after creating in Stripe
const STRENGTH_TRAINING_PRICE_ID = process.env.STRIPE_STRENGTH_PRICE_ID;

// Allowlist of hosts we'll redirect back to after Stripe checkout. Anything
// else falls through to the safe default. Stripe itself will reject obvious
// nonsense, but defence-in-depth: we don't want this endpoint to act as an
// open redirect that an attacker could phish through.
const ALLOWED_REDIRECT_HOSTS = new Set([
  "roadmancycling.com",
  "www.roadmancycling.com",
  "coaching.roadmancycling.com",
  "localhost",
]);

const DEFAULT_SUCCESS_URL =
  "https://roadmancycling.com/strength-training/success";
const DEFAULT_CANCEL_URL = "https://roadmancycling.com/strength-training";

function safeRedirectUrl(input: unknown, fallback: string): string {
  if (typeof input !== "string" || input.length === 0) return fallback;
  if (input.length > 2048) return fallback;
  try {
    const u = new URL(input);
    if (u.protocol !== "https:" && u.protocol !== "http:") return fallback;
    // Allow `localhost` over http for local testing; everywhere else
    // require https.
    if (u.protocol === "http:" && u.hostname !== "localhost") return fallback;
    if (!ALLOWED_REDIRECT_HOSTS.has(u.hostname)) return fallback;
    return u.toString();
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  try {
    const { priceId, successUrl, cancelUrl } = await request.json();

    const stripe = await getStripe();
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
      success_url: safeRedirectUrl(successUrl, DEFAULT_SUCCESS_URL),
      cancel_url: safeRedirectUrl(cancelUrl, DEFAULT_CANCEL_URL),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Log the full error server-side; return a generic message so we
    // don't leak Stripe SDK internals, API keys partial state, or
    // other integration details to the caller.
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Checkout could not be created. Please try again or contact support." },
      { status: 500 },
    );
  }
}
