"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  campBookings,
  type CampBookingStatus,
  type CampSlug,
} from "@/lib/db/schema";
import {
  autoAssignBooking,
  clearAssignmentsForBooking,
  manuallyAssign,
} from "@/lib/camps/assigner";
import { requireAuth } from "@/lib/admin/auth";

export async function reassignBooking(formData: FormData) {
  const user = await requireAuth();
  const bookingId = Number(formData.get("bookingId"));
  const camp = String(formData.get("camp")) as CampSlug;
  const roomKey = String(formData.get("roomKey"));
  const bedKey = String(formData.get("bedKey"));
  const isSingle = formData.get("singleRoom") === "true";
  if (!bookingId || !camp || !roomKey || !bedKey) {
    throw new Error("Missing required fields");
  }
  await manuallyAssign({
    bookingId,
    camp,
    roomKey,
    bedKey,
    isSingleOccupancy: isSingle,
    assignedBy: user.slug,
  });
  revalidatePath("/admin/camps");
}

export async function reAutoAssignBooking(formData: FormData) {
  await requireAuth();
  const bookingId = Number(formData.get("bookingId"));
  const camp = String(formData.get("camp")) as CampSlug;
  const singleRoom = formData.get("singleRoom") === "true";
  if (!bookingId || !camp) {
    throw new Error("Missing required fields");
  }
  await clearAssignmentsForBooking(bookingId);
  await autoAssignBooking({ bookingId, camp, singleRoom });
  revalidatePath("/admin/camps");
}

export async function setBookingStatus(formData: FormData) {
  await requireAuth();
  const bookingId = Number(formData.get("bookingId"));
  const status = String(formData.get("status")) as CampBookingStatus;
  if (!bookingId || !status) throw new Error("Missing required fields");
  await db
    .update(campBookings)
    .set({ status, updatedAt: new Date() })
    .where(eq(campBookings.id, bookingId));
  // Cancelled bookings free up their bed.
  if (status === "cancelled") {
    await clearAssignmentsForBooking(bookingId);
  }
  revalidatePath("/admin/camps");
}
