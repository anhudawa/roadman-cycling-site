import { NextResponse } from "next/server";
import Stripe from "stripe";
import { clampString, LIMITS, normaliseEmail } from "@/lib/validation";
import { getProductBySlug } from "@/lib/paid-reports/products";
import { createOrder } from "@/lib/paid-reports/orders";
import { createPaidReport } from "@/lib/paid-reports/reports";
import { upsertByEmail as upsertRiderProfile } from "@/lib/rider-profile/store";
import { getToolResultBySlug } from "@/lib/tool-results/store";
import { logCrmSync } from "@/lib/paid-reports/crm-sync-log";
import { isPaidProductSlug } from "@/lib/paid-reports/types";

/**
 * POST /api/reports/checkout
 *
 * Body: { productSlug, email, toolResultSlug?, firstName?, utm? }
 *
 * Creates a pending order + pending_payment paid_report, then creates
 * a Stripe checkout session tied to both via metadata. On webhook
 * success the handler looks the order up by id and advances the
 * report lifecycle.
 *
 * Idempotency: if the caller passes the same email + productSlug +
 * toolResultSlug within 10 minutes, we reuse the still-pending order
 * so clicking "Checkout" twice doesn't create two orders.
 */

const FROM_ADDRESS = "Roadman Cycling <noreply@roadmancycling.com>";
void FROM_ADDRESS;

interface CheckoutBody {
  productSlug?: string;
  email?: string;
  toolResultSlug?: string;
  firstName?: string;
  utm?: Record<string, string | null> | null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;

    const email = normaliseEmail(body.email);
    if (!email) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }
    if (!body.productSlug || !isPaidProductSlug(body.productSlug)) {
      return NextResponse.json(
        { error: "Unknown report product." },
        { status: 400 },
      );
    }

    const product = await getProductBySlug(body.productSlug);
    if (!product || !product.active) {
      return NextResponse.json(
        { error: "That report isn't available right now." },
        { status: 404 },
      );
    }

    const firstName = clampString(body.firstName, LIMITS.name) ?? undefined;

    const toolResult = body.toolResultSlug
      ? await getToolResultBySlug(body.toolResultSlug)
      : null;
    if (body.toolResultSlug && !toolResult) {
      return NextResponse.json(
        { error: "That result couldn't be found — please rerun the tool." },
        { status: 404 },
      );
    }
    if (toolResult && toolResult.email !== email) {
      return NextResponse.json(
        { error: "Result doesn't match the email provided." },
        { status: 403 },
      );
    }

    // Make sure the rider profile exists so the order FK can point at it.
    const profile = await upsertRiderProfile({
      email,
      firstName: firstName ?? undefined,
    });

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured." },
        { status: 500 },
      );
    }
    const stripe = new Stripe(STRIPE_SECRET_KEY);

    // Pending order first so we have an id to put in Stripe metadata.
    const order = await createOrder({
      riderProfileId: profile.id,
      email,
      productSlug: product.slug,
      toolResultId: toolResult?.id ?? null,
      amountCents: product.priceCents,
      currency: product.currency,
      stripeCheckoutSessionId: null,
      utm: body.utm ?? null,
    });

    // Paired paid_report row in pending_payment — webhook flips it forward.
    const paidReport = await createPaidReport({
      orderId: order.id,
      riderProfileId: profile.id,
      email,
      productSlug: product.slug,
      toolResultId: toolResult?.id ?? null,
    });

    const baseUrl = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: product.stripePriceId
        ? [{ price: product.stripePriceId, quantity: 1 }]
        : [
            {
              quantity: 1,
              price_data: {
                currency: product.currency,
                unit_amount: product.priceCents,
                product_data: {
                  name: product.name,
                  description: product.description,
                },
              },
            },
          ],
      metadata: {
        type: "paid_report",
        order_id: String(order.id),
        paid_report_id: String(paidReport.id),
        product_slug: product.slug,
        tool_result_slug: toolResult?.slug ?? "",
        rider_profile_id: String(profile.id),
      },
      success_url: `${baseUrl}/reports/${product.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: toolResult
        ? `${baseUrl}/results/${toolResult.toolSlug.replace("_", "-")}/${toolResult.slug}`
        : `${baseUrl}/tools`,
    });

    if (!session.id || !session.url) {
      await logCrmSync({
        email,
        target: "stripe",
        operation: "create_checkout_session",
        payload: { productSlug: product.slug, orderId: order.id },
        status: "failed",
        error: "Stripe returned no session url",
        relatedTable: "orders",
        relatedId: order.id,
      });
      return NextResponse.json(
        { error: "Could not start checkout." },
        { status: 502 },
      );
    }

    // Backfill the session id on the order so the webhook can look it up.
    await import("@/lib/db").then(async ({ db }) => {
      const { orders } = await import("@/lib/db/schema");
      const { eq } = await import("drizzle-orm");
      await db
        .update(orders)
        .set({ stripeCheckoutSessionId: session.id, updatedAt: new Date() })
        .where(eq(orders.id, order.id));
    });

    await logCrmSync({
      email,
      target: "stripe",
      operation: "create_checkout_session",
      payload: {
        productSlug: product.slug,
        orderId: order.id,
        sessionId: session.id,
      },
      status: "success",
      relatedTable: "orders",
      relatedId: order.id,
    });

    return NextResponse.json({
      url: session.url,
      orderId: order.id,
      paidReportId: paidReport.id,
    });
  } catch (err) {
    console.error("[reports/checkout] Error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
