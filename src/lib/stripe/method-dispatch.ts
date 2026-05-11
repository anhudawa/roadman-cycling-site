/**
 * Stripe webhook handler for `metadata.type === "method_course"` checkouts.
 *
 * Wired in from the unified dispatcher. On merge into `main`, add this
 * branch inside `handleCheckoutCompleted` in `src/lib/stripe/dispatch.ts`:
 *
 *   if (metadata.type === "method_course") {
 *     const { handleMethodCourseCheckoutCompleted } = await import("./method-dispatch");
 *     await handleMethodCourseCheckoutCompleted(session, eventId);
 *     return;
 *   }
 *
 * Lazy-import the heavy bits (db, email) so the dispatcher itself stays
 * cheap to load for the more common paid-report and subscription paths.
 */

import type Stripe from "stripe";

export async function handleMethodCourseCheckoutCompleted(
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> {
  // Defensive: card-only Checkout always returns "paid" on completion, but
  // metadata-driven payment methods can complete with `unpaid` (async
  // confirmation pending). Don't grant access until Stripe says paid.
  if (session.payment_status && session.payment_status !== "paid") {
    console.log(
      `[stripe/method] session ${session.id} completed with payment_status=${session.payment_status} — skipping until paid`,
    );
    return;
  }

  const metadata = session.metadata ?? {};
  const enrollmentIdRaw =
    typeof metadata.enrollment_id === "string" ? metadata.enrollment_id : "";
  const enrollmentId = Number(enrollmentIdRaw);
  if (!Number.isFinite(enrollmentId) || enrollmentId <= 0) {
    console.error(
      `[stripe/method] session ${session.id} missing or invalid enrollment_id in metadata`,
    );
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const amountCents =
    typeof session.amount_total === "number" ? session.amount_total : null;
  const currency = (session.currency ?? "usd").toLowerCase();

  const { markEnrollmentPaid, getEnrollmentById } = await import("@/lib/method/enrollments");
  const { mintLoginToken } = await import("@/lib/method/auth");
  const { sendMethodWelcomeEmail } = await import("@/lib/method/email");

  let result: Awaited<ReturnType<typeof markEnrollmentPaid>>;
  try {
    result = await markEnrollmentPaid({
      enrollmentId,
      stripeEventId: eventId,
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      amountCents,
      currency,
    });
  } catch (err) {
    console.error(
      `[stripe/method] markEnrollmentPaid failed for enrollment ${enrollmentId}:`,
      err,
    );
    return;
  }

  if (result.wasAlreadyPaid) {
    console.log(
      `[stripe/method] enrollment ${enrollmentId} already paid — skipping welcome email`,
    );
    return;
  }

  const enrollment = result.enrollment;

  // Mint a magic-link token + send the welcome email.
  // Fire-and-forget pattern — webhook contract is "always 2xx after
  // signature verification". An email failure logs loudly but doesn't
  // poison the webhook with a retry storm.
  try {
    const { rawToken } = await mintLoginToken(enrollment.id);
    await sendMethodWelcomeEmail({
      to: enrollment.email,
      name: enrollment.name,
      rawToken,
    });
  } catch (err) {
    console.error(
      `[stripe/method] welcome email failed for enrollment ${enrollment.id}:`,
      err,
    );
  }

  // Best-effort lead promotion in Beehiiv. The integration helper already
  // exists at @/lib/integrations/beehiiv (see camps booking).
  try {
    const { subscribeToBeehiiv } = await import("@/lib/integrations/beehiiv");
    await subscribeToBeehiiv({
      email: enrollment.email,
      name: enrollment.name ?? "",
      tags: ["method-paid"],
      customFields: {
        method_status: "active",
        method_paid_at: enrollment.paidAt?.toISOString() ?? new Date().toISOString(),
      },
      utm: {
        source: "site",
        medium: "method-checkout",
        campaign: "method",
      },
    });
  } catch (err) {
    console.error(
      `[stripe/method] beehiiv promote failed for enrollment ${enrollment.id}:`,
      err,
    );
  }

  // Admin notification ping — reuses the existing notification primitive.
  // (Phase 1 keeps it best-effort; a dedicated `notifyMethodSale` helper
  // is a follow-up if Anthony wants a richer admin email.)
  try {
    const { sendStripeSaleNotification } = await import("./notifications");
    await sendStripeSaleNotification(session);
  } catch (err) {
    console.error(
      `[stripe/method] admin notification failed for enrollment ${enrollment.id}:`,
      err,
    );
  }

  // Belt-and-braces: re-fetch the enrollment for any caller that wants to
  // observe final state in tests. Webhook ignores the return value.
  await getEnrollmentById(enrollment.id);
}
