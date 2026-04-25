import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateSlot, getSlots } from "@/lib/inventory";
import { notifySpotlightPurchase } from "@/lib/notifications";
import { upsertOnTrialStart, upsertOnPaid, upsertOnChurn } from "@/lib/admin/subscribers-store";
import { markOrderPaid, markOrderRefunded } from "@/lib/paid-reports/orders";
import {
  getPaidReportByOrderId,
  markPaymentConfirmed,
  markRefunded as markPaidReportRefunded,
} from "@/lib/paid-reports/reports";
import { logCrmSync } from "@/lib/paid-reports/crm-sync-log";
import { refreshLeadScore } from "@/lib/paid-reports/lead-score";
import { generateAndDeliverPaidReport } from "@/lib/paid-reports/generator";
import {
  PAID_REPORT_EVENTS,
  recordPaidReportServerEvent,
} from "@/lib/analytics/paid-report-events";

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events:
 * - checkout.session.completed: marks the purchased slot as 'sold' in Airtable
 *
 * The webhook secret must be set in STRIPE_WEBHOOK_SECRET env var.
 * Create the webhook in Stripe Dashboard pointing to:
 *   https://roadmancycling.com/api/webhooks/stripe
 */

export async function POST(request: NextRequest) {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe env vars not configured for webhook");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session, event.id);
      break;
    }

    case "customer.subscription.created": {
      try {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (!customer.deleted && customer.email) {
          if (subscription.trial_end) {
            await upsertOnTrialStart(customer.email, customer.id);
            console.log(`[Stripe Webhook] Trial started: ${customer.email}`);
          } else {
            await upsertOnPaid(customer.email, customer.id);
            console.log(`[Stripe Webhook] Paid directly: ${customer.email}`);
          }
        }
      } catch (err) {
        console.error("[Stripe Webhook] subscription.created handler error:", err);
      }
      break;
    }

    case "invoice.paid": {
      try {
        const invoice = event.data.object as Stripe.Invoice;
        // Only process subscription-related invoices
        const isSubscriptionInvoice =
          invoice.billing_reason === "subscription_cycle" ||
          invoice.billing_reason === "subscription_create" ||
          invoice.billing_reason === "subscription_update";
        if (isSubscriptionInvoice) {
          const customer = await stripe.customers.retrieve(invoice.customer as string);
          if (!customer.deleted && customer.email) {
            if (
              invoice.billing_reason === "subscription_cycle" ||
              (invoice.billing_reason === "subscription_create" && (invoice.amount_paid ?? 0) > 0)
            ) {
              await upsertOnPaid(customer.email, customer.id);
              console.log(`[Stripe Webhook] Paid invoice: ${customer.email}, amount: ${invoice.amount_paid}`);
            }
          }
        }
      } catch (err) {
        console.error("[Stripe Webhook] invoice.paid handler error:", err);
      }
      break;
    }

    case "customer.subscription.deleted": {
      try {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (!customer.deleted && customer.email) {
          await upsertOnChurn(customer.email);
          console.log(`[Stripe Webhook] Churned: ${customer.email}`);
        }
      } catch (err) {
        console.error("[Stripe Webhook] subscription.deleted handler error:", err);
      }
      break;
    }

    case "charge.refunded": {
      try {
        const charge = event.data.object as Stripe.Charge;
        await handlePaidReportRefund(charge, event.id);
      } catch (err) {
        console.error("[Stripe Webhook] charge.refunded handler error:", err);
      }
      break;
    }

    default:
      // Unhandled event type $€” log and acknowledge
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  eventId: string,
) {
  const metadata = session.metadata;

  if (metadata?.type === "paid_report") {
    await handlePaidReportCheckoutCompleted(session, eventId);
    return;
  }

  if (metadata?.type !== "spotlight") {
    console.log("Checkout session is not a spotlight purchase, skipping");
    return;
  }

  const { slotType, brandName } = metadata;

  try {
    // Find the next available slot of this type
    const availableSlots = await getSlots({
      inventoryType: slotType as Parameters<typeof getSlots>[0] extends undefined
        ? never
        : NonNullable<Parameters<typeof getSlots>[0]>["inventoryType"],
      status: "available",
    });

    if (availableSlots.length === 0) {
      console.error(`No available ${slotType} slots found for spotlight purchase`);
      // TODO: Send alert email to sarah@roadmancycling.com
      return;
    }

    // Take the earliest available slot
    const slot = availableSlots[0];

    // Update slot status to sold
    await updateSlot(slot.id, {
      status: "sold",
      ratePaid: session.amount_total ? session.amount_total / 100 : null,
      campaignId: `SPOTLIGHT-${brandName?.toUpperCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 7)}`,
      notes: `Spotlight purchase via Stripe.\nBrand: ${brandName}\nProduct: ${metadata.productService}\nKey Message: ${metadata.keyMessage}\nShow Notes URL: ${metadata.showNotesUrl}\nWords to Avoid: ${metadata.wordsToAvoid}\nStripe Session: ${session.id}`,
    });

    console.log(`Spotlight slot ${slot.id} marked as sold for ${brandName}`);

    // Notify anthony + sarah about the purchase
    await notifySpotlightPurchase(
      brandName ?? "Unknown",
      slotType ?? "unknown",
      slot.plannedPublishDate,
      session.amount_total ? session.amount_total / 100 : 0,
    );
  } catch (error) {
    console.error("Failed to update slot after checkout:", error);
    // TODO: Send error alert email
  }
}

/* ============================================================ */
/* Paid report $€” checkout completed                              */
/* ============================================================ */
/**
 * Webhook branch for paid-report checkouts. Flow:
 *  1. Dedupe by event id $€” Stripe retries, we don't re-generate.
 *  2. Flip the order to paid (idempotent).
 *  3. Flip the paid_report row to payment_confirmed.
 *  4. Fire the async generator $€” it owns the rest of the lifecycle.
 *  5. Refresh lead score so admin sees the new paying rider.
 */
async function handlePaidReportCheckoutCompleted(
  session: Stripe.Checkout.Session,
  eventId: string,
) {
  const metadata = session.metadata ?? {};
  const orderId = Number(metadata.order_id);
  const paidReportId = Number(metadata.paid_report_id);
  if (!orderId || !paidReportId) {
    console.error(
      "[Stripe Webhook] paid_report checkout missing order/report id in metadata",
    );
    return;
  }

  const email = session.customer_email ?? session.customer_details?.email ?? "";
  if (!email) {
    console.error("[Stripe Webhook] paid_report checkout missing email");
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const receiptUrl = null;

  const { flipped } = await markOrderPaid({
    orderId,
    paymentIntentId,
    receiptUrl,
    stripeEventId: eventId,
  });

  if (!flipped) {
    console.log(
      `[Stripe Webhook] paid_report order ${orderId} already paid $€” skipping`,
    );
    return;
  }

  await markPaymentConfirmed(paidReportId);

  await logCrmSync({
    email,
    target: "stripe",
    operation: "checkout_session_completed",
    payload: { orderId, paidReportId, sessionId: session.id },
    status: "success",
    relatedTable: "orders",
    relatedId: orderId,
  });
  await recordPaidReportServerEvent({
    name: PAID_REPORT_EVENTS.CHECKOUT_SUCCESS,
    page: "/api/webhooks/stripe",
    email,
    productSlug: typeof metadata.product_slug === "string"
      ? metadata.product_slug
      : undefined,
    reportId: paidReportId,
    orderId,
  });

  // Lead score refresh $€” non-fatal.
  const riderProfileId = Number(metadata.rider_profile_id);
  if (riderProfileId) {
    void refreshLeadScore(riderProfileId).catch((err) =>
      console.error("[Stripe Webhook] refreshLeadScore failed:", err),
    );
  }

  // Kick off async generation. The generator owns status transitions.
  void generateAndDeliverPaidReport(paidReportId).catch((err) => {
    console.error("[Stripe Webhook] generator failed:", err);
  });
}

/* ============================================================ */
/* Paid report $€” refund handler                                  */
/* ============================================================ */
async function handlePaidReportRefund(charge: Stripe.Charge, eventId: string) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id ?? null;
  if (!paymentIntentId) return;

  // Find the order by payment intent $€” we may have multiple orders in the
  // DB so scan. Refunds are rare enough that a sequential scan is fine.
  const { db } = await import("@/lib/db");
  const { orders: ordersTable } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.stripePaymentIntentId, paymentIntentId));

  for (const row of rows) {
    await markOrderRefunded(row.id, eventId);
    const report = await getPaidReportByOrderId(row.id);
    if (report) await markPaidReportRefunded(report.id);
    await logCrmSync({
      email: row.email,
      target: "stripe",
      operation: "charge_refunded",
      payload: { orderId: row.id, paymentIntentId },
      status: "success",
      relatedTable: "orders",
      relatedId: row.id,
    });
  }
}
