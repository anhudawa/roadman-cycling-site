import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { campBookings, type CampSlug } from "@/lib/db/schema";
import { CAMPS, getCamp, type CampConfig } from "@/lib/camps/camps";
import { getRemainingCapacity } from "@/lib/camps/assigner";
import { upsertContact, addActivity } from "@/lib/crm/contacts";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { EMAIL_REGEX } from "@/lib/validation";

const STR = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

type CampSelection = "road" | "gravel" | "both";

function isCampSelection(v: string): v is CampSelection {
  return v === "road" || v === "gravel" || v === "both";
}

interface BookingInput {
  name: string;
  email: string;
  phone: string;
  singleRoom: boolean;
  dietary: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medical: string;
  heardFrom: string;
}

/**
 * POST /api/camps/book
 *
 * Captures the booking, then redirects the rider to Stripe Checkout. Bed
 * assignment + confirmation email + admin notification all happen in the
 * webhook handler once payment is confirmed (see `/lib/stripe/dispatch.ts`).
 *
 * Until the webhook fires, the booking row sits at status='pending' with
 * no associated bed in `camp_room_assignments`. If the rider abandons
 * checkout, no bed is held and the row stays pending — admin can clean up
 * via /admin/camps.
 *
 * `camp: "both"` is supported via a single Stripe Checkout session with
 * multiple line items, with one camp_bookings row created per camp. The
 * webhook iterates `metadata.booking_ids` and processes each.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const campRaw = STR(body.camp, 20).toLowerCase();
    if (!isCampSelection(campRaw)) {
      return NextResponse.json(
        { error: "Pick which camp you're booking — Road, Gravel, or Both." },
        { status: 400 },
      );
    }
    const selection: CampSelection = campRaw;
    const slugs: CampSlug[] =
      selection === "both" ? ["road", "gravel"] : [selection];

    const input: BookingInput = {
      name: STR(body.name, 200),
      email: STR(body.email, 200).toLowerCase(),
      phone: STR(body.phone, 50),
      singleRoom: Boolean(body.singleRoom),
      dietary: STR(body.dietary, 1000),
      emergencyContactName: STR(body.emergencyContactName, 200),
      emergencyContactPhone: STR(body.emergencyContactPhone, 50),
      medical: STR(body.medical, 1000),
      heardFrom: STR(body.heardFrom, 500),
    };

    if (!input.name || !input.email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 },
      );
    }
    if (!EMAIL_REGEX.test(input.email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }
    if (!input.emergencyContactName || !input.emergencyContactPhone) {
      return NextResponse.json(
        { error: "Emergency contact name and phone are required." },
        { status: 400 },
      );
    }

    // Capacity short-circuit. The webhook re-runs the assigner under the
    // unique-bed index so a race after this point still settles correctly,
    // but the early check lets us return SOLD OUT cleanly when the camp is
    // obviously full at submit time.
    for (const slug of slugs) {
      const cap = await getRemainingCapacity(slug);
      if (cap.remaining <= 0) {
        const cfg = getCamp(slug)!;
        return NextResponse.json(
          {
            error: "soldOut",
            message: `${cfg.name} is fully booked. Drop us a line and we'll add you to the waitlist.`,
          },
          { status: 409 },
        );
      }
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("[camps/book] STRIPE_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Payment is unavailable right now — please try again shortly." },
        { status: 500 },
      );
    }

    // Upsert one booking row per selected camp. Idempotent on (email, camp)
    // so a rider clicking "Reserve my spot" twice doesn't duplicate rows;
    // we just refresh the form data and retarget the same row at a fresh
    // checkout session.
    const bookingIds: number[] = [];
    for (const slug of slugs) {
      const inserted = await db
        .insert(campBookings)
        .values({
          camp: slug,
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          singleRoom: input.singleRoom,
          dietary: input.dietary || null,
          emergencyContactName: input.emergencyContactName || null,
          emergencyContactPhone: input.emergencyContactPhone || null,
          medical: input.medical || null,
          heardFrom: input.heardFrom || null,
          status: "pending",
        })
        .onConflictDoUpdate({
          target: [campBookings.email, campBookings.camp],
          set: {
            name: input.name,
            phone: input.phone || null,
            singleRoom: input.singleRoom,
            dietary: input.dietary || null,
            emergencyContactName: input.emergencyContactName || null,
            emergencyContactPhone: input.emergencyContactPhone || null,
            medical: input.medical || null,
            heardFrom: input.heardFrom || null,
            updatedAt: new Date(),
          },
        })
        .returning();

      let bookingId = inserted[0]?.id;
      if (!bookingId) {
        const existing = await db
          .select()
          .from(campBookings)
          .where(
            and(
              eq(campBookings.camp, slug),
              eq(campBookings.email, input.email),
            ),
          )
          .limit(1);
        bookingId = existing[0]?.id;
      }
      if (!bookingId) {
        return NextResponse.json(
          { error: "Failed to record booking" },
          { status: 500 },
        );
      }
      bookingIds.push(bookingId);
    }

    // Lead capture — fire-and-forget. We do this *before* payment so the
    // CRM sees abandoned bookings too; the "paid" tag gets added later by
    // the webhook.
    const beehiivTags = slugs.map((s) => CAMPS[s].beehiivTag);
    subscribeToBeehiiv({
      email: input.email,
      name: input.name,
      tags: [...beehiivTags, "camp-applicant"],
      customFields: {
        camp: selection,
        single_room: input.singleRoom ? "yes" : "no",
        camp_status: "pending_payment",
      },
      utm: {
        source: "site",
        medium: "training-camp-booking",
        campaign: beehiivTags[0],
      },
    }).catch((err) =>
      console.error("[Camps Book] Beehiiv sync failed:", err),
    );

    try {
      const contact = await upsertContact({
        email: input.email,
        name: input.name,
        phone: input.phone || null,
        source: "manual",
        customFields: {
          camp: selection,
          single_room: input.singleRoom,
          camp_status: "pending_payment",
          dietary: input.dietary,
          medical: input.medical,
          emergency_contact: `${input.emergencyContactName} (${input.emergencyContactPhone})`,
          heard_from: input.heardFrom,
        },
      });
      await addActivity(contact.id, {
        type: "note",
        title: `Camp checkout started: ${slugs
          .map((s) => CAMPS[s].shortName)
          .join(" + ")}`,
        body: buildCrmActivityBody(slugs, input),
        meta: {
          camp: selection,
          status: "pending_payment",
          booking_ids: bookingIds,
        },
        authorName: "system",
      });
    } catch (crmErr) {
      console.error("[Camps Book] CRM sync failed:", crmErr);
    }

    // Build Stripe line items: one per camp, plus a separate single-room
    // supplement line per camp when applicable. Using two lines (rather
    // than rolling the supplement into the camp price) keeps the receipt
    // legible — the rider sees exactly what they paid for.
    const stripe = new Stripe(stripeKey);
    type CreateParams = NonNullable<
      Parameters<typeof stripe.checkout.sessions.create>[0]
    >;
    const lineItems: NonNullable<CreateParams["line_items"]> = [];
    for (const slug of slugs) {
      const cfg = CAMPS[slug];
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: cfg.pricePerPerson * 100,
          product_data: {
            name: cfg.name,
            description: `${cfg.durationLabel} · ${cfg.startDate} → ${cfg.endDate}`,
          },
        },
      });
      if (input.singleRoom) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: cfg.singleSupplement * 100,
            product_data: {
              name: `${cfg.shortName} — single-room supplement`,
            },
          },
        });
      }
    }
    const baseUrl = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: input.email,
      line_items: lineItems,
      // No-refunds policy is communicated up-front in the form copy and the
      // confirmation email — Stripe doesn't enforce it, but with refunds
      // disabled at the dashboard level there's nothing to undo here.
      metadata: {
        type: "camp_booking",
        booking_ids: bookingIds.join(","),
        camps: slugs.join(","),
        camp_selection: selection,
        single_room: input.singleRoom ? "yes" : "no",
        rider_name: input.name,
      },
      success_url: `${baseUrl}/training-camps/booking-confirmed?camp=${selection}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${
        selection === "both" ? "/training-camps" : CAMPS[slugs[0]].href
      }?cancelled=1`,
    });

    if (!session.id || !session.url) {
      console.error("[Camps Book] Stripe returned no session URL", session.id);
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 502 },
      );
    }

    // Backfill the session id on every booking row so the webhook can
    // reconcile if the metadata is somehow lost (very rare; defensive).
    for (const bookingId of bookingIds) {
      await db
        .update(campBookings)
        .set({ stripeSessionId: session.id, updatedAt: new Date() })
        .where(eq(campBookings.id, bookingId));
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      bookingIds,
      camp: selection,
    });
  } catch (err) {
    console.error("[Camps Book] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong on our end. Try again in a moment." },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Light capacity probe used by the booking form to decide whether to
  // render the SOLD OUT state. Not authenticated — counts only, no PII.
  try {
    const slugs = Object.keys(CAMPS) as CampSlug[];
    const result: Record<string, { total: number; taken: number; remaining: number }> = {};
    for (const slug of slugs) {
      result[slug] = await getRemainingCapacity(slug);
    }
    return NextResponse.json({ capacity: result });
  } catch (err) {
    console.error("[Camps Book] capacity probe failed:", err);
    return NextResponse.json({ capacity: null }, { status: 500 });
  }
}

function buildCrmActivityBody(slugs: CampSlug[], input: BookingInput): string {
  const lines: string[] = [];
  for (const slug of slugs) {
    const cfg: CampConfig = CAMPS[slug];
    const total =
      cfg.pricePerPerson + (input.singleRoom ? cfg.singleSupplement : 0);
    lines.push(`${cfg.name} · ${cfg.startDate} → ${cfg.endDate} · €${total}`);
  }
  lines.push(`Single room: ${input.singleRoom ? "yes" : "no"}`);
  lines.push(`Dietary: ${input.dietary || "—"}`);
  lines.push(`Medical: ${input.medical || "—"}`);
  lines.push(
    `Emergency: ${input.emergencyContactName} (${input.emergencyContactPhone})`,
  );
  lines.push(`Heard from: ${input.heardFrom || "—"}`);
  return lines.join("\n");
}
