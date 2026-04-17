import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import {
  getBookingById,
  updateBooking,
  deleteBooking,
  BOOKING_STATUSES,
  type BookingStatus,
} from "@/lib/crm/bookings";
import { getContactById } from "@/lib/crm/contacts";

const ALLOWED_OWNERS = ["sarah", "wes", "matthew", "ted"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const booking = await getBookingById(id);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ booking });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const patch: Parameters<typeof updateBooking>[1] = {};

  if (Object.prototype.hasOwnProperty.call(body, "title") && typeof body.title === "string") {
    const t = body.title.trim();
    if (!t) return NextResponse.json({ error: "Title required" }, { status: 400 });
    patch.title = t;
  }
  if (Object.prototype.hasOwnProperty.call(body, "scheduledAt")) {
    const d = new Date(body.scheduledAt);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid scheduledAt" }, { status: 400 });
    }
    patch.scheduledAt = d;
  }
  if (Object.prototype.hasOwnProperty.call(body, "durationMinutes")) {
    const n =
      typeof body.durationMinutes === "number"
        ? body.durationMinutes
        : parseInt(String(body.durationMinutes), 10);
    if (!Number.isFinite(n) || n <= 0 || n > 600) {
      return NextResponse.json({ error: "Invalid durationMinutes" }, { status: 400 });
    }
    patch.durationMinutes = n;
  }
  if (Object.prototype.hasOwnProperty.call(body, "location")) {
    patch.location = body.location === null || body.location === "" ? null : String(body.location);
  }
  if (Object.prototype.hasOwnProperty.call(body, "notes")) {
    patch.notes = body.notes === null || body.notes === "" ? null : String(body.notes);
  }
  if (Object.prototype.hasOwnProperty.call(body, "ownerSlug")) {
    if (!ALLOWED_OWNERS.includes(body.ownerSlug)) {
      return NextResponse.json({ error: "Invalid owner" }, { status: 400 });
    }
    patch.ownerSlug = body.ownerSlug;
  }
  if (Object.prototype.hasOwnProperty.call(body, "contactId")) {
    if (body.contactId === null || body.contactId === "") {
      patch.contactId = null;
    } else {
      const parsed =
        typeof body.contactId === "number"
          ? body.contactId
          : parseInt(String(body.contactId), 10);
      if (Number.isNaN(parsed)) {
        return NextResponse.json({ error: "Invalid contactId" }, { status: 400 });
      }
      const c = await getContactById(parsed);
      if (!c) return NextResponse.json({ error: "Contact not found" }, { status: 404 });
      patch.contactId = parsed;
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    if (!(BOOKING_STATUSES as string[]).includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status as BookingStatus;
  }

  const updated = await updateBooking(id, patch, {
    authorSlug: user.slug,
    authorName: user.name,
  });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fresh = await getBookingById(id);
  return NextResponse.json({ booking: fresh });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const result = await deleteBooking(id, { slug: user.slug, role: user.role });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
