import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import {
  listBookings,
  createBooking,
  BOOKING_STATUSES,
  type BookingStatus,
} from "@/lib/crm/bookings";
import { getContactById } from "@/lib/crm/contacts";

const ALLOWED_OWNERS = ["sarah", "wes", "matthew", "ted"];

export async function GET(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const ownerSlug = url.searchParams.get("ownerSlug") ?? undefined;
  const contactIdStr = url.searchParams.get("contactId");
  const contactId = contactIdStr ? parseInt(contactIdStr, 10) : undefined;
  const afterStr = url.searchParams.get("after");
  const beforeStr = url.searchParams.get("before");
  const statusRaw = url.searchParams.get("status");
  const limitStr = url.searchParams.get("limit");

  const status =
    statusRaw && (BOOKING_STATUSES as string[]).includes(statusRaw)
      ? (statusRaw as BookingStatus)
      : undefined;

  const rows = await listBookings({
    ownerSlug: ownerSlug || undefined,
    contactId: contactId && !Number.isNaN(contactId) ? contactId : undefined,
    after: afterStr ? new Date(afterStr) : undefined,
    before: beforeStr ? new Date(beforeStr) : undefined,
    status,
    limit: limitStr ? parseInt(limitStr, 10) || undefined : undefined,
  });

  // currentUser used for consistent auth behaviour; not leaked in response
  void user;

  return NextResponse.json({ bookings: rows });
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const scheduledAtRaw = body.scheduledAt;
  if (!scheduledAtRaw) {
    return NextResponse.json({ error: "scheduledAt required" }, { status: 400 });
  }
  const scheduledAt = new Date(scheduledAtRaw);
  if (Number.isNaN(scheduledAt.getTime())) {
    return NextResponse.json({ error: "Invalid scheduledAt" }, { status: 400 });
  }

  let contactId: number | null = null;
  if (body.contactId !== undefined && body.contactId !== null && body.contactId !== "") {
    const parsed =
      typeof body.contactId === "number"
        ? body.contactId
        : parseInt(String(body.contactId), 10);
    if (Number.isNaN(parsed)) {
      return NextResponse.json({ error: "Invalid contactId" }, { status: 400 });
    }
    const existing = await getContactById(parsed);
    if (!existing) return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    contactId = parsed;
  }

  let ownerSlug = user.slug;
  if (body.ownerSlug) {
    if (!ALLOWED_OWNERS.includes(body.ownerSlug)) {
      return NextResponse.json({ error: "Invalid owner" }, { status: 400 });
    }
    ownerSlug = body.ownerSlug;
  }

  let durationMinutes = 30;
  if (body.durationMinutes !== undefined && body.durationMinutes !== null) {
    const n =
      typeof body.durationMinutes === "number"
        ? body.durationMinutes
        : parseInt(String(body.durationMinutes), 10);
    if (!Number.isFinite(n) || n <= 0 || n > 600) {
      return NextResponse.json({ error: "Invalid durationMinutes" }, { status: 400 });
    }
    durationMinutes = n;
  }

  const booking = await createBooking({
    contactId,
    ownerSlug,
    title,
    scheduledAt,
    durationMinutes,
    location: typeof body.location === "string" && body.location.trim() ? body.location.trim() : null,
    notes: typeof body.notes === "string" && body.notes.trim() ? body.notes : null,
    createdBySlug: user.slug,
    createdByName: user.name,
  });

  return NextResponse.json({
    booking: {
      ...booking,
      scheduledAt: booking.scheduledAt.toISOString(),
      completedAt: booking.completedAt ? booking.completedAt.toISOString() : null,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    },
  });
}
