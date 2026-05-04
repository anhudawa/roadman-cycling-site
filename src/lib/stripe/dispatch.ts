/**
 * Single dispatcher for every Stripe webhook event.
 *
 * Both `/api/stripe-webhook` and `/api/webhooks/stripe` call into this
 * module after signature verification. Either URL can therefore handle
 * the full event surface — paid reports, spotlight slot purchases, S&C
 * sale notifications, subscriptions, refunds.
 *
 * Why both URLs? The original `/api/stripe-webhook` shipped with the S&C
 * course. The newer `/api/webhooks/stripe` shipped with paid reports.
 * Production Stripe configuration may point at either — consolidating
 * here means a misconfigured webhook URL no longer silently drops
 * paid-report events.
 */

import type Stripe from "stripe";
import {
  upsertOnTrialStart,
  upsertOnPaid,
  upsertOnChurn,
} from "@/lib/admin/subscribers-store";
import { updateSlot, getSlots } from "@/lib/inventory";
import { notifySpotlightPurchase } from "@/lib/notifications";
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
import {
  notifyPaidReportSale,
  sendStripeSaleNotification,
} from "./notifications";

export interface DispatchOptions {
  /** Pre-built Stripe SDK client. Required for events that need follow-up
   *  API calls (subscription/customer lookup). */
  stripe: Stripe;
  /** Source URL the event arrived at — used for breadcrumb logs only. */
  webhookPath: string;
}

/**
 * Dispatch a verified Stripe.Event. Always resolves — handler errors are
 * caught and logged so a single bad branch never bricks the webhook.
 */
export async function dispatchStripeEvent(
  event: Stripe.Event,
  opts: DispatchOptions,
): Promise<void> {
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
          event.id,
        );
        return;

      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription,
          opts,
        );
        return;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice, opts);
        return;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          opts,
        );
        return;

      case "charge.refunded":
        await handlePaidReportRefund(
          event.data.object as Stripe.Charge,
          event.id,
        );
        return;

      default:
        // Acknowledged but unhandled — Stripe expects a 2xx so it doesn't retry.
        console.log(
          `[stripe/dispatch] unhandled event ${event.type} from ${opts.webhookPath}`,
        );
        return;
    }
  } catch (err) {
    console.error(
      `[stripe/dispatch] handler ${event.type} threw:`,
      err instanceof Error ? err.message : err,
    );
  }
}

/* ============================================================ */
/* checkout.session.completed                                   */
/* ============================================================ */

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> {
  const metadata = session.metadata ?? {};

  if (metadata.type === "paid_report") {
    await handlePaidReportCheckoutCompleted(session, eventId);
    return;
  }
  if (metadata.type === "spotlight") {
    await handleSpotlightCheckoutCompleted(session);
    return;
  }
  if (metadata.type === "camp_booking") {
    await handleCampBookingCheckoutCompleted(session);
    return;
  }

  // Fallback: legacy S&C strength training course. No metadata.type set
  // because the original `/api/checkout` route predates the typed flow.
  await sendStripeSaleNotification(session);
}

/* ============================================================ */
/* camp_booking                                                 */
/* ============================================================ */

async function handleCampBookingCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const metadata = session.metadata ?? {};
  const bookingIdsRaw =
    typeof metadata.booking_ids === "string" ? metadata.booking_ids : "";
  const bookingIds = bookingIdsRaw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (bookingIds.length === 0) {
    console.error(
      "[stripe/dispatch] camp_booking missing booking_ids in metadata",
    );
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  // Lazy imports keep the dispatch module light — the camp libs pull in
  // the schema, the assigner, and the email layer, none of which are
  // needed for the more common paid_report / subscription paths.
  const { db } = await import("@/lib/db");
  const { campBookings } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const { autoAssignBooking } = await import("@/lib/camps/assigner");
  const { ROOMS_BY_KEY } = await import("@/lib/camps/rooms");
  const { getCamp } = await import("@/lib/camps/camps");
  const {
    notifyCampBookingAdmin,
    sendCampBookingConfirmation,
  } = await import("@/lib/camps/notifications");
  const { subscribeToBeehiiv } = await import("@/lib/integrations/beehiiv");

  for (const bookingId of bookingIds) {
    const rows = await db
      .select()
      .from(campBookings)
      .where(eq(campBookings.id, bookingId))
      .limit(1);
    const booking = rows[0];
    if (!booking) {
      console.error(
        `[stripe/dispatch] camp_booking ${bookingId} not found — skipping`,
      );
      continue;
    }
    // Idempotency: Stripe retries webhooks. If we already settled this
    // booking (paidAt set) skip the side effects entirely.
    if (booking.paidAt) {
      console.log(
        `[stripe/dispatch] camp_booking ${bookingId} already paid — skipping`,
      );
      continue;
    }

    const camp = booking.camp as "road" | "gravel";
    const cfg = getCamp(camp);
    if (!cfg) {
      console.error(
        `[stripe/dispatch] camp_booking ${bookingId} has unknown camp '${camp}'`,
      );
      continue;
    }

    // Run the auto-assigner now that payment is confirmed. A booking past
    // the cap drops to waitlist — the email reflects that, and admin can
    // refund manually if needed.
    const assignment = await autoAssignBooking({
      bookingId: booking.id,
      camp,
      singleRoom: booking.singleRoom,
    });

    const newStatus =
      assignment.status === "waitlist" ? "waitlist" : "confirmed";

    await db
      .update(campBookings)
      .set({
        status: newStatus,
        paidAt: new Date(),
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        updatedAt: new Date(),
      })
      .where(eq(campBookings.id, booking.id));

    const room = assignment.roomKey
      ? ROOMS_BY_KEY.get(assignment.roomKey)
      : null;
    const roomLabel = room
      ? `${room.label} (${assignment.bedKey})`
      : "Waitlist";

    // Fire-and-forget — webhook contract is "always 2xx after sig check".
    notifyCampBookingAdmin({
      camp: cfg,
      booking: {
        name: booking.name,
        email: booking.email,
        phone: booking.phone ?? "",
        singleRoom: booking.singleRoom,
        dietary: booking.dietary ?? "",
        emergencyContactName: booking.emergencyContactName ?? "",
        emergencyContactPhone: booking.emergencyContactPhone ?? "",
        medical: booking.medical ?? "",
        heardFrom: booking.heardFrom ?? "",
      },
      status: assignment.status,
      roomLabel,
    }).catch((err) =>
      console.error("[stripe/dispatch] Camps admin notification failed:", err),
    );

    sendCampBookingConfirmation({
      camp: cfg,
      name: booking.name,
      email: booking.email,
      singleRoom: booking.singleRoom,
      status: assignment.status,
    }).catch((err) =>
      console.error("[stripe/dispatch] Camps confirmation email failed:", err),
    );

    // Promote the lead from "applicant" to "paid" in Beehiiv. Best-effort.
    subscribeToBeehiiv({
      email: booking.email,
      name: booking.name,
      tags: [cfg.beehiivTag, "camp-paid"],
      customFields: {
        camp: cfg.slug,
        single_room: booking.singleRoom ? "yes" : "no",
        camp_status: newStatus,
      },
    }).catch((err) =>
      console.error("[stripe/dispatch] Camps Beehiiv promotion failed:", err),
    );
  }
}

/* ============================================================ */
/* paid_report                                                  */
/* ============================================================ */

async function handlePaidReportCheckoutCompleted(
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> {
  const metadata = session.metadata ?? {};
  const orderId = Number(metadata.order_id);
  const paidReportId = Number(metadata.paid_report_id);
  if (!orderId || !paidReportId) {
    console.error(
      "[stripe/dispatch] paid_report missing order_id/paid_report_id in metadata",
    );
    return;
  }

  const email =
    session.customer_email ?? session.customer_details?.email ?? "";
  if (!email) {
    console.error("[stripe/dispatch] paid_report checkout missing email");
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const { flipped } = await markOrderPaid({
    orderId,
    paymentIntentId,
    receiptUrl: null,
    stripeEventId: eventId,
  });

  if (!flipped) {
    console.log(
      `[stripe/dispatch] paid_report order ${orderId} already paid — skipping`,
    );
    return;
  }

  await markPaymentConfirmed(paidReportId);
  await notifyPaidReportSale({
    email,
    productSlug:
      typeof metadata.product_slug === "string"
        ? metadata.product_slug
        : "paid_report",
    orderId,
    paidReportId,
    amountCents: session.amount_total,
    predictionSlug:
      typeof metadata.prediction_slug === "string"
        ? metadata.prediction_slug
        : null,
  });

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
    productSlug:
      typeof metadata.product_slug === "string"
        ? metadata.product_slug
        : undefined,
    reportId: paidReportId,
    orderId,
  });

  const riderProfileId = Number(metadata.rider_profile_id);
  if (riderProfileId) {
    void refreshLeadScore(riderProfileId).catch((err) =>
      console.error("[stripe/dispatch] refreshLeadScore failed:", err),
    );
  }

  // Async generation — owns the rest of the lifecycle, errors surface
  // via paid_reports.status = failed and admin notification.
  void generateAndDeliverPaidReport(paidReportId).catch((err) => {
    console.error("[stripe/dispatch] generator failed:", err);
  });
}

/* ============================================================ */
/* spotlight                                                    */
/* ============================================================ */

async function handleSpotlightCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const metadata = session.metadata ?? {};
  const { slotType, brandName } = metadata;
  if (!slotType) return;

  const availableSlots = await getSlots({
    inventoryType: slotType as Parameters<typeof getSlots>[0] extends undefined
      ? never
      : NonNullable<Parameters<typeof getSlots>[0]>["inventoryType"],
    status: "available",
  });

  if (availableSlots.length === 0) {
    console.error(
      `[stripe/dispatch] no available ${slotType} slots for spotlight purchase`,
    );
    return;
  }

  const slot = availableSlots[0];
  await updateSlot(slot.id, {
    status: "sold",
    ratePaid: session.amount_total ? session.amount_total / 100 : null,
    campaignId: `SPOTLIGHT-${brandName?.toUpperCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 7)}`,
    notes: `Spotlight purchase via Stripe.\nBrand: ${brandName}\nProduct: ${metadata.productService}\nKey Message: ${metadata.keyMessage}\nShow Notes URL: ${metadata.showNotesUrl}\nWords to Avoid: ${metadata.wordsToAvoid}\nStripe Session: ${session.id}`,
  });

  await notifySpotlightPurchase(
    brandName ?? "Unknown",
    slotType ?? "unknown",
    slot.plannedPublishDate,
    session.amount_total ? session.amount_total / 100 : 0,
  );
}

/* ============================================================ */
/* subscriptions                                                */
/* ============================================================ */

async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  opts: DispatchOptions,
): Promise<void> {
  const customer = await opts.stripe.customers.retrieve(
    subscription.customer as string,
  );
  if (customer.deleted || !customer.email) return;
  if (subscription.trial_end) {
    await upsertOnTrialStart(customer.email, customer.id);
  } else {
    await upsertOnPaid(customer.email, customer.id);
  }
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  opts: DispatchOptions,
): Promise<void> {
  const isSubscriptionInvoice =
    invoice.billing_reason === "subscription_cycle" ||
    invoice.billing_reason === "subscription_create" ||
    invoice.billing_reason === "subscription_update";
  if (!isSubscriptionInvoice) return;

  const customer = await opts.stripe.customers.retrieve(invoice.customer as string);
  if (customer.deleted || !customer.email) return;

  if (
    invoice.billing_reason === "subscription_cycle" ||
    (invoice.billing_reason === "subscription_create" &&
      (invoice.amount_paid ?? 0) > 0)
  ) {
    await upsertOnPaid(customer.email, customer.id);
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  opts: DispatchOptions,
): Promise<void> {
  const customer = await opts.stripe.customers.retrieve(
    subscription.customer as string,
  );
  if (customer.deleted || !customer.email) return;
  await upsertOnChurn(customer.email);
}

/* ============================================================ */
/* charge.refunded                                              */
/* ============================================================ */

async function handlePaidReportRefund(
  charge: Stripe.Charge,
  eventId: string,
): Promise<void> {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id ?? null;
  if (!paymentIntentId) return;

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
