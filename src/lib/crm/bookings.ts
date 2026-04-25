import { db } from "@/lib/db";
import { bookings, contacts } from "@/lib/db/schema";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { addActivity } from "./contacts";

export type Booking = typeof bookings.$inferSelect;

export type BookingStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export const BOOKING_STATUSES: BookingStatus[] = [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
];

export interface BookingRow {
  id: number;
  contactId: number | null;
  ownerSlug: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  location: string | null;
  notes: string | null;
  status: BookingStatus;
  completedAt: string | null;
  createdBySlug: string | null;
  createdAt: string;
  updatedAt: string;
  contactName: string | null;
  contactEmail: string | null;
}

function mapRow(r: {
  id: number;
  contactId: number | null;
  ownerSlug: string;
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  location: string | null;
  notes: string | null;
  status: string;
  completedAt: Date | null;
  createdBySlug: string | null;
  createdAt: Date;
  updatedAt: Date;
  contactName: string | null;
  contactEmail: string | null;
}): BookingRow {
  return {
    id: r.id,
    contactId: r.contactId,
    ownerSlug: r.ownerSlug,
    title: r.title,
    scheduledAt: r.scheduledAt.toISOString(),
    durationMinutes: r.durationMinutes,
    location: r.location,
    notes: r.notes,
    status: (BOOKING_STATUSES as string[]).includes(r.status)
      ? (r.status as BookingStatus)
      : "scheduled",
    completedAt: r.completedAt ? r.completedAt.toISOString() : null,
    createdBySlug: r.createdBySlug,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    contactName: r.contactName,
    contactEmail: r.contactEmail,
  };
}

export interface ListBookingsParams {
  ownerSlug?: string;
  contactId?: number;
  after?: Date;
  before?: Date;
  status?: BookingStatus;
  limit?: number;
}

export async function listBookings(params: ListBookingsParams = {}): Promise<BookingRow[]> {
  const limit = Math.min(params.limit ?? 200, 500);
  const conditions = [];
  if (params.ownerSlug) conditions.push(eq(bookings.ownerSlug, params.ownerSlug));
  if (params.contactId) conditions.push(eq(bookings.contactId, params.contactId));
  if (params.status) conditions.push(eq(bookings.status, params.status));
  if (params.after) conditions.push(gte(bookings.scheduledAt, params.after));
  if (params.before) conditions.push(lte(bookings.scheduledAt, params.before));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const q = db
    .select({
      id: bookings.id,
      contactId: bookings.contactId,
      ownerSlug: bookings.ownerSlug,
      title: bookings.title,
      scheduledAt: bookings.scheduledAt,
      durationMinutes: bookings.durationMinutes,
      location: bookings.location,
      notes: bookings.notes,
      status: bookings.status,
      completedAt: bookings.completedAt,
      createdBySlug: bookings.createdBySlug,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      contactName: contacts.name,
      contactEmail: contacts.email,
    })
    .from(bookings)
    .leftJoin(contacts, eq(bookings.contactId, contacts.id))
    .orderBy(asc(bookings.scheduledAt))
    .limit(limit);

  const rows = whereClause ? await q.where(whereClause) : await q;
  return rows.map(mapRow);
}

export async function getBookingById(id: number): Promise<BookingRow | null> {
  const rows = await db
    .select({
      id: bookings.id,
      contactId: bookings.contactId,
      ownerSlug: bookings.ownerSlug,
      title: bookings.title,
      scheduledAt: bookings.scheduledAt,
      durationMinutes: bookings.durationMinutes,
      location: bookings.location,
      notes: bookings.notes,
      status: bookings.status,
      completedAt: bookings.completedAt,
      createdBySlug: bookings.createdBySlug,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      contactName: contacts.name,
      contactEmail: contacts.email,
    })
    .from(bookings)
    .leftJoin(contacts, eq(bookings.contactId, contacts.id))
    .where(eq(bookings.id, id))
    .limit(1);
  const r = rows[0];
  return r ? mapRow(r) : null;
}

export interface CreateBookingParams {
  contactId?: number | null;
  ownerSlug: string;
  title: string;
  scheduledAt: Date;
  durationMinutes?: number;
  location?: string | null;
  notes?: string | null;
  createdBySlug?: string | null;
  createdByName?: string | null;
}

export async function createBooking(params: CreateBookingParams): Promise<Booking> {
  const inserted = await db
    .insert(bookings)
    .values({
      contactId: params.contactId ?? null,
      ownerSlug: params.ownerSlug,
      title: params.title,
      scheduledAt: params.scheduledAt,
      durationMinutes: params.durationMinutes ?? 30,
      location: params.location ?? null,
      notes: params.notes ?? null,
      createdBySlug: params.createdBySlug ?? null,
    })
    .returning();
  const booking = inserted[0];

  if (booking.contactId) {
    try {
      await addActivity(booking.contactId, {
        type: "booking_scheduled",
        title: `Booking scheduled: ${booking.title}`,
        body: `${booking.scheduledAt.toISOString()}${booking.location ? ` · ${booking.location}` : ""}`,
        meta: {
          bookingId: booking.id,
          scheduledAt: booking.scheduledAt.toISOString(),
          durationMinutes: booking.durationMinutes,
          ownerSlug: booking.ownerSlug,
        },
        authorName: params.createdByName ?? null,
        authorSlug: params.createdBySlug ?? null,
      });
    } catch (err) {
      console.error("[bookings] activity (booking_scheduled) failed", err);
    }
  }

  return booking;
}

export interface UpdateBookingPatch {
  contactId?: number | null;
  ownerSlug?: string;
  title?: string;
  scheduledAt?: Date;
  durationMinutes?: number;
  location?: string | null;
  notes?: string | null;
  status?: BookingStatus;
}

export interface UpdateBookingContext {
  authorSlug?: string | null;
  authorName?: string | null;
}

export async function updateBooking(
  id: number,
  patch: UpdateBookingPatch,
  ctx: UpdateBookingContext = {}
): Promise<Booking | null> {
  const existingRows = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  const existing = existingRows[0];
  if (!existing) return null;

  const updates: Partial<typeof bookings.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (patch.contactId !== undefined) updates.contactId = patch.contactId;
  if (patch.ownerSlug !== undefined) updates.ownerSlug = patch.ownerSlug;
  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.scheduledAt !== undefined) updates.scheduledAt = patch.scheduledAt;
  if (patch.durationMinutes !== undefined) updates.durationMinutes = patch.durationMinutes;
  if (patch.location !== undefined) updates.location = patch.location;
  if (patch.notes !== undefined) updates.notes = patch.notes;

  let statusChanged: BookingStatus | null = null;
  if (patch.status !== undefined && patch.status !== existing.status) {
    updates.status = patch.status;
    statusChanged = patch.status;
    if (patch.status === "completed" && !existing.completedAt) {
      updates.completedAt = new Date();
    } else if (patch.status !== "completed") {
      updates.completedAt = null;
    }
  }

  const updated = await db
    .update(bookings)
    .set(updates)
    .where(eq(bookings.id, id))
    .returning();
  const booking = updated[0];

  if (statusChanged && booking.contactId) {
    try {
      if (statusChanged === "completed") {
        await addActivity(booking.contactId, {
          type: "booking_completed",
          title: `Booking completed: ${booking.title}`,
          meta: { bookingId: booking.id },
          authorName: ctx.authorName ?? null,
          authorSlug: ctx.authorSlug ?? null,
        });
      } else if (statusChanged === "cancelled" || statusChanged === "no_show") {
        await addActivity(booking.contactId, {
          type: "booking_cancelled",
          title: `Booking ${statusChanged === "no_show" ? "no-show" : "cancelled"}: ${booking.title}`,
          meta: { bookingId: booking.id, status: statusChanged },
          authorName: ctx.authorName ?? null,
          authorSlug: ctx.authorSlug ?? null,
        });
      }
    } catch (err) {
      console.error("[bookings] activity log failed", err);
    }
  }

  return booking;
}

export async function deleteBooking(
  id: number,
  user: { slug: string; role?: string | null }
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const rows = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  const existing = rows[0];
  if (!existing) return { ok: false, status: 404, error: "Not found" };
  const isAdmin = user.role === "admin";
  if (!isAdmin && existing.ownerSlug !== user.slug) {
    return { ok: false, status: 403, error: "Forbidden" };
  }
  await db.delete(bookings).where(eq(bookings.id, id));
  return { ok: true };
}

export async function getUpcomingForUser(
  slug: string,
  opts: { hours?: number } = {}
): Promise<BookingRow[]> {
  const hours = opts.hours ?? 168;
  const now = new Date();
  const end = new Date(now.getTime() + hours * 3_600_000);
  return listBookings({
    ownerSlug: slug,
    status: "scheduled",
    after: now,
    before: end,
    limit: 100,
  });
}

export async function getTodayForUser(slug: string): Promise<BookingRow[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return listBookings({
    ownerSlug: slug,
    after: start,
    before: end,
    limit: 100,
  });
}

export async function countTodayForUser(slug: string): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(
      and(
        eq(bookings.ownerSlug, slug),
        eq(bookings.status, "scheduled"),
        gte(bookings.scheduledAt, start),
        lte(bookings.scheduledAt, end)
      )
    );
  return result[0]?.count ?? 0;
}
