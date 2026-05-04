import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { campBookings, type CampSlug } from "@/lib/db/schema";
import { CAMPS, getCamp } from "@/lib/camps/camps";
import {
  autoAssignBooking,
  getRemainingCapacity,
} from "@/lib/camps/assigner";
import { ROOMS_BY_KEY } from "@/lib/camps/rooms";
import {
  notifyCampBookingAdmin,
  sendCampBookingConfirmation,
} from "@/lib/camps/notifications";
import { upsertContact, addActivity } from "@/lib/crm/contacts";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { EMAIL_REGEX } from "@/lib/validation";

const STR = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const camp = STR(body.camp, 20).toLowerCase() as CampSlug;
    const campConfig = getCamp(camp);
    if (!campConfig) {
      return NextResponse.json(
        { error: "Pick which camp you're booking — Road or Gravel." },
        { status: 400 },
      );
    }

    const name = STR(body.name, 200);
    const email = STR(body.email, 200).toLowerCase();
    const phone = STR(body.phone, 50);
    const singleRoom = Boolean(body.singleRoom);
    const dietary = STR(body.dietary, 1000);
    const emergencyContactName = STR(body.emergencyContactName, 200);
    const emergencyContactPhone = STR(body.emergencyContactPhone, 50);
    const medical = STR(body.medical, 1000);
    const heardFrom = STR(body.heardFrom, 500);

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 },
      );
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }
    if (!emergencyContactName || !emergencyContactPhone) {
      return NextResponse.json(
        { error: "Emergency contact name and phone are required." },
        { status: 400 },
      );
    }

    // Capacity check before we touch the DB. We re-check inside the
    // assigner under the unique-index guard, but this short-circuits the
    // common case so the API can return 409 SOLD OUT cleanly.
    const cap = await getRemainingCapacity(camp);
    if (cap.remaining <= 0) {
      return NextResponse.json(
        {
          error: "soldOut",
          message: `${campConfig.name} is fully booked. Drop us a line and we'll add you to the waitlist.`,
        },
        { status: 409 },
      );
    }

    // Idempotent insert. The unique (email, camp) index means re-submitting
    // the form updates the existing booking rather than duplicating it.
    const inserted = await db
      .insert(campBookings)
      .values({
        camp,
        name,
        email,
        phone: phone || null,
        singleRoom,
        dietary: dietary || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        medical: medical || null,
        heardFrom: heardFrom || null,
        status: "pending",
      })
      .onConflictDoUpdate({
        target: [campBookings.email, campBookings.camp],
        set: {
          name,
          phone: phone || null,
          singleRoom,
          dietary: dietary || null,
          emergencyContactName: emergencyContactName || null,
          emergencyContactPhone: emergencyContactPhone || null,
          medical: medical || null,
          heardFrom: heardFrom || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    let bookingId = inserted[0]?.id;
    if (!bookingId) {
      // Fall back to a lookup — onConflictDoUpdate doesn't always return
      // the row across PG versions when the row already existed.
      const existing = await db
        .select()
        .from(campBookings)
        .where(and(eq(campBookings.camp, camp), eq(campBookings.email, email)))
        .limit(1);
      bookingId = existing[0]?.id;
    }
    if (!bookingId) {
      return NextResponse.json(
        { error: "Failed to record booking" },
        { status: 500 },
      );
    }

    const assignment = await autoAssignBooking({
      bookingId,
      camp,
      singleRoom,
    });

    // If the auto-assigner couldn't find a bed, mark the booking as a
    // waitlist row so the admin and email reflect that state.
    if (assignment.status === "waitlist") {
      await db
        .update(campBookings)
        .set({ status: "waitlist", updatedAt: new Date() })
        .where(eq(campBookings.id, bookingId));
    }

    const room = assignment.roomKey ? ROOMS_BY_KEY.get(assignment.roomKey) : null;
    const roomLabel = room ? `${room.label} (${assignment.bedKey})` : "Waitlist";

    // Beehiiv tag — "camp-road-2026" or "camp-gravel-2026". Non-fatal.
    subscribeToBeehiiv({
      email,
      name,
      tags: [campConfig.beehiivTag, "camp-applicant"],
      customFields: {
        camp: campConfig.slug,
        single_room: singleRoom ? "yes" : "no",
        camp_status: assignment.status,
      },
      utm: {
        source: "site",
        medium: "training-camp-booking",
        campaign: campConfig.beehiivTag,
      },
    }).catch((err) =>
      console.error("[Camps Book] Beehiiv sync failed:", err),
    );

    // CRM upsert + activity. Non-fatal.
    try {
      const contact = await upsertContact({
        email,
        name,
        phone: phone || null,
        source: "manual",
        customFields: {
          camp: campConfig.slug,
          single_room: singleRoom,
          camp_status: assignment.status,
          camp_room: assignment.roomKey ?? null,
          camp_bed: assignment.bedKey ?? null,
          dietary,
          medical,
          emergency_contact: `${emergencyContactName} (${emergencyContactPhone})`,
          heard_from: heardFrom,
        },
      });
      await addActivity(contact.id, {
        type: "note",
        title:
          assignment.status === "waitlist"
            ? `Camp waitlist: ${campConfig.shortName}`
            : `Camp booked: ${campConfig.shortName}`,
        body: `Camp: ${campConfig.name}\nDates: ${campConfig.startDate} → ${campConfig.endDate}\nSingle room: ${singleRoom ? "yes" : "no"}\nRoom: ${roomLabel}\nDietary: ${dietary || "—"}\nMedical: ${medical || "—"}\nEmergency: ${emergencyContactName} (${emergencyContactPhone})\nHeard from: ${heardFrom || "—"}`,
        meta: {
          camp: campConfig.slug,
          status: assignment.status,
          room_key: assignment.roomKey ?? null,
          bed_key: assignment.bedKey ?? null,
        },
        authorName: "system",
      });
    } catch (crmErr) {
      console.error("[Camps Book] CRM sync failed:", crmErr);
    }

    // Admin notification + applicant confirmation. Fire and forget.
    notifyCampBookingAdmin({
      camp: campConfig,
      booking: {
        name,
        email,
        phone,
        singleRoom,
        dietary,
        emergencyContactName,
        emergencyContactPhone,
        medical,
        heardFrom,
      },
      status: assignment.status,
      roomLabel,
    }).catch((err) =>
      console.error("[Camps Book] Admin notification failed:", err),
    );

    sendCampBookingConfirmation({
      camp: campConfig,
      name,
      email,
      singleRoom,
      status: assignment.status,
    }).catch((err) =>
      console.error("[Camps Book] Applicant confirmation failed:", err),
    );

    return NextResponse.json({
      success: true,
      bookingId,
      camp: campConfig.slug,
      status: assignment.status,
      room: assignment.roomKey ?? null,
      bed: assignment.bedKey ?? null,
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
