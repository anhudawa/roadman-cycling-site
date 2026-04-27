import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

/**
 * End-to-end verification of the paid-report pipeline.
 *
 * Flow under test:
 *   checkout.session.completed (paid_report) →
 *     markOrderPaid + markPaymentConfirmed →
 *     generateAndDeliverPaidReport (kicked off async).
 *
 * Plus the divergent paths:
 *   - charge.refunded → cascades to paid_report
 *   - non-paid_report checkout (legacy S&C) → admin notification email
 *   - missing metadata → safe no-op (no DB writes)
 *
 * Every external dependency is mocked so the test is hermetic.
 */

const mocks = vi.hoisted(() => ({
  markOrderPaid: vi.fn(),
  markOrderRefunded: vi.fn(),
  markPaymentConfirmed: vi.fn(),
  getPaidReportByOrderId: vi.fn(),
  markPaidReportRefunded: vi.fn(),
  generateAndDeliverPaidReport: vi.fn(),
  refreshLeadScore: vi.fn(),
  logCrmSync: vi.fn(),
  recordPaidReportServerEvent: vi.fn(),
  sendStripeSaleNotification: vi.fn(),
  notifyDeliveryFailed: vi.fn(),
  upsertOnPaid: vi.fn(),
  upsertOnTrialStart: vi.fn(),
  upsertOnChurn: vi.fn(),
  getSlots: vi.fn(),
  updateSlot: vi.fn(),
  notifySpotlightPurchase: vi.fn(),
  dbSelect: vi.fn(),
}));

vi.mock("@/lib/paid-reports/orders", () => ({
  markOrderPaid: mocks.markOrderPaid,
  markOrderRefunded: mocks.markOrderRefunded,
}));
vi.mock("@/lib/paid-reports/reports", () => ({
  markPaymentConfirmed: mocks.markPaymentConfirmed,
  getPaidReportByOrderId: mocks.getPaidReportByOrderId,
  markRefunded: mocks.markPaidReportRefunded,
}));
vi.mock("@/lib/paid-reports/generator", () => ({
  generateAndDeliverPaidReport: mocks.generateAndDeliverPaidReport,
}));
vi.mock("@/lib/paid-reports/lead-score", () => ({
  refreshLeadScore: mocks.refreshLeadScore,
}));
vi.mock("@/lib/paid-reports/crm-sync-log", () => ({
  logCrmSync: mocks.logCrmSync,
}));
vi.mock("@/lib/analytics/paid-report-events", () => ({
  PAID_REPORT_EVENTS: { CHECKOUT_SUCCESS: "paid_report_checkout_success" },
  recordPaidReportServerEvent: mocks.recordPaidReportServerEvent,
}));
vi.mock("@/lib/stripe/notifications", () => ({
  sendStripeSaleNotification: mocks.sendStripeSaleNotification,
  notifyPaidReportDeliveryFailed: mocks.notifyDeliveryFailed,
}));
vi.mock("@/lib/admin/subscribers-store", () => ({
  upsertOnPaid: mocks.upsertOnPaid,
  upsertOnTrialStart: mocks.upsertOnTrialStart,
  upsertOnChurn: mocks.upsertOnChurn,
}));
vi.mock("@/lib/inventory", () => ({
  getSlots: mocks.getSlots,
  updateSlot: mocks.updateSlot,
}));
vi.mock("@/lib/notifications", () => ({
  notifySpotlightPurchase: mocks.notifySpotlightPurchase,
}));
vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => mocks.dbSelect(),
      }),
    }),
  },
}));
vi.mock("@/lib/db/schema", () => ({
  orders: {
    stripePaymentIntentId: "stripe_payment_intent_id_col",
  },
}));

function fakeStripe(): Stripe {
  // Dispatcher only invokes stripe for subscription/customer lookups
  // which we don't exercise in the paid_report tests.
  return {} as unknown as Stripe;
}

function paidReportEvent(): Stripe.Event {
  return {
    id: "evt_paidreport_1",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_paidreport_1",
        customer_email: "rider@example.com",
        payment_intent: "pi_1",
        metadata: {
          type: "paid_report",
          order_id: "42",
          paid_report_id: "99",
          product_slug: "report_plateau",
          rider_profile_id: "7",
        },
      } as unknown as Stripe.Checkout.Session,
    },
  } as unknown as Stripe.Event;
}

describe("dispatchStripeEvent — paid_report pipeline", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.markOrderPaid.mockResolvedValue({ flipped: true, order: null });
    mocks.markPaymentConfirmed.mockResolvedValue({ id: 99 });
    mocks.generateAndDeliverPaidReport.mockResolvedValue(undefined);
    mocks.refreshLeadScore.mockResolvedValue(undefined);
    mocks.logCrmSync.mockResolvedValue(undefined);
    mocks.recordPaidReportServerEvent.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    // Drain microtasks so void-fired generator promises settle before
    // the next test resets mocks.
    await new Promise((r) => setImmediate(r));
  });

  it("processes a paid_report checkout end to end", async () => {
    const { dispatchStripeEvent } = await import("@/lib/stripe/dispatch");
    await dispatchStripeEvent(paidReportEvent(), {
      stripe: fakeStripe(),
      webhookPath: "/api/webhooks/stripe",
    });
    await new Promise((r) => setImmediate(r));

    expect(mocks.markOrderPaid).toHaveBeenCalledWith({
      orderId: 42,
      paymentIntentId: "pi_1",
      receiptUrl: null,
      stripeEventId: "evt_paidreport_1",
    });
    expect(mocks.markPaymentConfirmed).toHaveBeenCalledWith(99);
    expect(mocks.generateAndDeliverPaidReport).toHaveBeenCalledWith(99);
    expect(mocks.refreshLeadScore).toHaveBeenCalledWith(7);
    expect(mocks.logCrmSync).toHaveBeenCalled();
    expect(mocks.recordPaidReportServerEvent).toHaveBeenCalled();
  });

  it("skips downstream work when the order was already paid (replayed webhook)", async () => {
    mocks.markOrderPaid.mockResolvedValueOnce({ flipped: false, order: null });
    const { dispatchStripeEvent } = await import("@/lib/stripe/dispatch");
    await dispatchStripeEvent(paidReportEvent(), {
      stripe: fakeStripe(),
      webhookPath: "/api/webhooks/stripe",
    });
    expect(mocks.markPaymentConfirmed).not.toHaveBeenCalled();
    expect(mocks.generateAndDeliverPaidReport).not.toHaveBeenCalled();
  });

  it("safe no-op when paid_report metadata is missing IDs", async () => {
    const event = paidReportEvent();
    (event.data.object as Stripe.Checkout.Session).metadata = {
      type: "paid_report",
    };
    const { dispatchStripeEvent } = await import("@/lib/stripe/dispatch");
    await dispatchStripeEvent(event, {
      stripe: fakeStripe(),
      webhookPath: "/api/webhooks/stripe",
    });
    expect(mocks.markOrderPaid).not.toHaveBeenCalled();
    expect(mocks.generateAndDeliverPaidReport).not.toHaveBeenCalled();
  });

  it("dispatches non-paid_report (legacy S&C) checkouts to the admin notifier", async () => {
    mocks.sendStripeSaleNotification.mockResolvedValue(undefined);
    const event: Stripe.Event = {
      id: "evt_legacy_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_legacy_1",
          customer_details: { email: "x@y.co", name: "X" },
          amount_total: 4999,
          metadata: {},
        } as unknown as Stripe.Checkout.Session,
      },
    } as unknown as Stripe.Event;
    const { dispatchStripeEvent } = await import("@/lib/stripe/dispatch");
    await dispatchStripeEvent(event, {
      stripe: fakeStripe(),
      webhookPath: "/api/stripe-webhook",
    });
    expect(mocks.sendStripeSaleNotification).toHaveBeenCalledOnce();
    expect(mocks.markOrderPaid).not.toHaveBeenCalled();
  });

  it("cascades a refund to the paid_report row", async () => {
    mocks.dbSelect.mockResolvedValueOnce([
      { id: 42, email: "rider@example.com" },
    ]);
    mocks.getPaidReportByOrderId.mockResolvedValueOnce({ id: 99 });
    const event: Stripe.Event = {
      id: "evt_refund_1",
      type: "charge.refunded",
      data: {
        object: { payment_intent: "pi_1" } as unknown as Stripe.Charge,
      },
    } as unknown as Stripe.Event;
    const { dispatchStripeEvent } = await import("@/lib/stripe/dispatch");
    await dispatchStripeEvent(event, {
      stripe: fakeStripe(),
      webhookPath: "/api/webhooks/stripe",
    });
    expect(mocks.markOrderRefunded).toHaveBeenCalledWith(42, "evt_refund_1");
    expect(mocks.markPaidReportRefunded).toHaveBeenCalledWith(99);
  });

  it("acknowledges unhandled event types without throwing", async () => {
    const event: Stripe.Event = {
      id: "evt_unhandled",
      type: "payment_intent.created",
      data: { object: {} as unknown as Stripe.PaymentIntent },
    } as unknown as Stripe.Event;
    const { dispatchStripeEvent } = await import("@/lib/stripe/dispatch");
    await expect(
      dispatchStripeEvent(event, {
        stripe: fakeStripe(),
        webhookPath: "/api/webhooks/stripe",
      }),
    ).resolves.toBeUndefined();
    expect(mocks.markOrderPaid).not.toHaveBeenCalled();
  });
});
