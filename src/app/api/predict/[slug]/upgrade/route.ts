import { NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { clampString, LIMITS, normaliseEmail } from "@/lib/validation";
import { getProductBySlug } from "@/lib/paid-reports/products";
import { createOrder } from "@/lib/paid-reports/orders";
import { createPaidReport } from "@/lib/paid-reports/reports";
import { upsertByEmail as upsertRiderProfile } from "@/lib/rider-profile/store";
import { logCrmSync } from "@/lib/paid-reports/crm-sync-log";
import { db } from "@/lib/db";
import { orders, predictions } from "@/lib/db/schema";
import {
  getPredictionBySlug,
  markPredictionPaid,
} from "@/lib/race-predictor/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UpgradeBody {
  email?: string;
  firstName?: string;
  utm?: Record<string, string | null> | null;
}

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/predict/[slug]/upgrade
 *
 * Body: { email, firstName?, utm? }
 *
 * Wires the existing reports/checkout flow to a Race prediction:
 *   1. Resolve the prediction by slug.
 *   2. Resolve report_race product from report_products.
 *   3. Upsert the rider profile.
 *   4. Create order + paid_report (pending_payment) tied to the prediction.
 *   5. Create Stripe checkout session with metadata pointing back at the
 *      prediction so the webhook can drive the race-report generator.
 *   6. Mark the prediction with the paid_report id so the public result
 *      page knows the upgrade has been initiated.
 */
export async function POST(request: Request, ctx: RouteContext) {
  const { slug } = await ctx.params;
  if (!slug) {
    return NextResponse.json({ error: "Missing prediction slug." }, { status: 400 });
  }

  let body: UpgradeBody;
  try {
    body = (await request.json()) as UpgradeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = normaliseEmail(body.email);
  if (!email) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  const firstName = clampString(body.firstName, LIMITS.name) ?? undefined;

  const prediction = await getPredictionBySlug(slug);
  if (!prediction) {
    return NextResponse.json({ error: "Prediction not found." }, { status: 404 });
  }
  if (prediction.isPaid && prediction.paidReportId) {
    return NextResponse.json(
      { error: "This prediction has already been upgraded.", paidReportId: prediction.paidReportId },
      { status: 409 },
    );
  }

  const product = await getProductBySlug("report_race");
  if (!product || !product.active) {
    return NextResponse.json(
      { error: "Race Report isn't available right now." },
      { status: 404 },
    );
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY?.trim();
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
  }
  const stripe = new Stripe(STRIPE_SECRET_KEY);

  const profile = await upsertRiderProfile({ email, firstName });

  const order = await createOrder({
    riderProfileId: profile.id,
    email,
    productSlug: product.slug,
    toolResultId: null,
    amountCents: product.priceCents,
    currency: product.currency,
    stripeCheckoutSessionId: null,
    utm: body.utm ?? null,
  });

  const paidReport = await createPaidReport({
    orderId: order.id,
    riderProfileId: profile.id,
    email,
    productSlug: product.slug,
    toolResultId: null,
  });

  // Link prediction → paid_report so the generator can find it later via the
  // reverse FK and so the result page can show "upgrade in flight" state.
  await db
    .update(predictions)
    .set({ paidReportId: paidReport.id })
    .where(eq(predictions.id, prediction.id));

  void markPredictionPaid; // keep public surface stable; webhook flips is_paid=true

  const baseUrl = new URL(request.url).origin;
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: product.stripePriceId
        ? [{ price: product.stripePriceId.trim(), quantity: 1 }]
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
        prediction_slug: prediction.slug,
        prediction_id: String(prediction.id),
        rider_profile_id: String(profile.id),
      },
      success_url: `${baseUrl}/predict/${prediction.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/predict/${prediction.slug}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe checkout failed";
    await logCrmSync({
      email,
      target: "stripe",
      operation: "create_checkout_session",
      payload: { productSlug: product.slug, orderId: order.id, predictionSlug: slug },
      status: "failed",
      error: message.slice(0, 255),
      relatedTable: "orders",
      relatedId: order.id,
    }).catch(() => {});
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }

  if (!session.id || !session.url) {
    await logCrmSync({
      email,
      target: "stripe",
      operation: "create_checkout_session",
      payload: { productSlug: product.slug, orderId: order.id, predictionSlug: slug },
      status: "failed",
      error: "Stripe returned no session url",
      relatedTable: "orders",
      relatedId: order.id,
    });
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }

  await db
    .update(orders)
    .set({ stripeCheckoutSessionId: session.id, updatedAt: new Date() })
    .where(eq(orders.id, order.id));

  await logCrmSync({
    email,
    target: "stripe",
    operation: "create_checkout_session",
    payload: {
      productSlug: product.slug,
      orderId: order.id,
      sessionId: session.id,
      predictionSlug: slug,
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
}
