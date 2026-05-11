import { NextResponse } from "next/server";
import Stripe from "stripe";
import { EMAIL_REGEX } from "@/lib/validation";
import {
  attachStripeSessionId,
  upsertPendingEnrollment,
} from "@/lib/method/enrollments";

const STR = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const DEFAULT_PRICE_CENTS = 29700; // $297

interface CheckoutBody {
  email: string;
  name: string;
}

/**
 * POST /api/method/checkout
 *
 * Captures the rider's email + name, idempotently upserts a pending
 * `method_enrollments` row, then redirects to Stripe Checkout.
 *
 * The webhook (see src/lib/stripe/method-dispatch.ts) does the rest:
 *   - flips status to 'active', sets paidAt + dripStartAt
 *   - sends the welcome / magic-link email
 *   - tags Beehiiv `method-paid`
 *
 * Until the webhook fires, the row stays at status='pending' with no
 * access granted. If the rider abandons checkout, no harm done — the
 * row just sits there and re-clicking "Buy" updates rather than spawns.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Partial<CheckoutBody>;
    const email = STR(body.email, 200).toLowerCase();
    const name = STR(body.name, 200);

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }
    if (!name) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 },
      );
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("[method/checkout] STRIPE_SECRET_KEY is not set");
      return NextResponse.json(
        {
          error:
            "Payment is unavailable right now — please try again shortly.",
        },
        { status: 500 },
      );
    }

    const enrollment = await upsertPendingEnrollment({ email, name });

    const baseUrl = new URL(request.url).origin;
    const stripe = new Stripe(stripeKey);

    type CreateParams = NonNullable<
      Parameters<typeof stripe.checkout.sessions.create>[0]
    >;
    const lineItems: NonNullable<CreateParams["line_items"]> = [];

    const explicitPriceId = process.env.STRIPE_METHOD_PRICE_ID?.trim();
    if (explicitPriceId) {
      // Pre-created Stripe Price object — preferred for production so
      // pricing is editable in the Stripe dashboard without a deploy.
      lineItems.push({ price: explicitPriceId, quantity: 1 });
    } else {
      const priceCents = parseUnitAmount(
        process.env.STRIPE_METHOD_PRICE_CENTS,
        DEFAULT_PRICE_CENTS,
      );
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: priceCents,
          product_data: {
            name: "The Roadman Method — 12-Week Course",
            description:
              "Twelve modules. One framework. Built on conversations with World Tour coaches and sport scientists.",
          },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: lineItems,
      allow_promotion_codes: true,
      metadata: {
        type: "method_course",
        enrollment_id: String(enrollment.id),
        rider_name: name,
      },
      success_url: `${baseUrl}/method/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/method/checkout?cancelled=1`,
    });

    if (!session.id || !session.url) {
      console.error("[method/checkout] Stripe returned no session URL");
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 502 },
      );
    }

    await attachStripeSessionId(enrollment.id, session.id);

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("[method/checkout] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong on our end. Try again in a moment." },
      { status: 500 },
    );
  }
}

function parseUnitAmount(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}
