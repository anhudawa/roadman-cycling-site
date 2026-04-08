import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateSlot, getSlots } from "@/lib/inventory";
import { notifySpotlightPurchase } from "@/lib/notifications";

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
      await handleCheckoutCompleted(session);
      break;
    }
    default:
      // Unhandled event type — log and acknowledge
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata || metadata.type !== "spotlight") {
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
