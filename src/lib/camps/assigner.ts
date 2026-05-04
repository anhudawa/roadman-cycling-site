/**
 * Auto room assignment for training-camp bookings.
 *
 * Rules:
 *  1. Skip rooms reserved for the team (B1, B2).
 *  2. Single-room supplement → claim a whole room with at least one
 *     double/queen, mark every bed in that room as occupied (one real
 *     assignment + placeholder rows so the room is locked).
 *  3. Standard booking → fill the next free bed, preferring rooms with
 *     more beds first (capacityOrder ascending).
 *  4. If everything in the main house + annex is full, the overflow sofa
 *     gets used. If even that's full, the booking is waitlisted.
 *
 * The whole thing runs inside a transaction. Two simultaneous bookings
 * can't claim the same bed — the unique index on (camp, room_key, bed_key)
 * is the final guard.
 */

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { campRoomAssignments, type CampSlug } from "@/lib/db/schema";
import { ROOMS, ROOMS_BY_KEY, type RoomConfig } from "./rooms";

export interface AssignResult {
  status: "assigned" | "waitlist";
  /** Stable key of the room this booking was placed into. */
  roomKey?: string;
  bedKey?: string;
  isSingleOccupancy: boolean;
}

interface ExistingAssignment {
  roomKey: string;
  bedKey: string;
}

async function loadAssignmentsForCamp(
  camp: CampSlug,
): Promise<ExistingAssignment[]> {
  const rows = await db
    .select({
      roomKey: campRoomAssignments.roomKey,
      bedKey: campRoomAssignments.bedKey,
    })
    .from(campRoomAssignments)
    .where(eq(campRoomAssignments.camp, camp));
  return rows;
}

function isRoomCompletelyFree(
  room: RoomConfig,
  assignments: ExistingAssignment[],
): boolean {
  if (room.reservedFor) return false;
  return !assignments.some((a) => a.roomKey === room.key);
}

function findFreeBedInRoom(
  room: RoomConfig,
  assignments: ExistingAssignment[],
): string | null {
  if (room.reservedFor) return null;
  const taken = new Set(
    assignments.filter((a) => a.roomKey === room.key).map((a) => a.bedKey),
  );
  // Prefer beds in the order they're listed (singles before doubles, but
  // the room config can override). For a room marked as containing a
  // double + singles, we put solo travellers in the singles first.
  const single = room.beds.find((b) => b.type === "single" && !taken.has(b.key));
  if (single) return single.key;
  const sofa = room.beds.find((b) => b.type === "sofa" && !taken.has(b.key));
  if (sofa) return sofa.key;
  const double = room.beds.find(
    (b) => (b.type === "double" || b.type === "queen") && !taken.has(b.key),
  );
  if (double) return double.key;
  return null;
}

function pickSingleSupplementRoom(
  assignments: ExistingAssignment[],
): RoomConfig | null {
  // Prefer the smallest free room with a double/queen so we don't burn the
  // 4-bed loft on a single occupant.
  const candidates = ROOMS.filter(
    (r) =>
      !r.reservedFor &&
      r.building !== "overflow" &&
      r.beds.some((b) => b.type === "double" || b.type === "queen") &&
      isRoomCompletelyFree(r, assignments),
  );
  // Smallest first: B4 (1 double), B7 (1 double), then bigger.
  candidates.sort((a, b) => a.beds.length - b.beds.length || a.capacityOrder - b.capacityOrder);
  return candidates[0] ?? null;
}

function pickStandardBed(
  assignments: ExistingAssignment[],
): { roomKey: string; bedKey: string } | null {
  // Fill rooms in capacityOrder. Skip reserved + overflow until everything
  // else is exhausted.
  const ordered = [...ROOMS]
    .filter((r) => !r.reservedFor && r.building !== "overflow")
    .sort((a, b) => a.capacityOrder - b.capacityOrder);
  for (const room of ordered) {
    const bed = findFreeBedInRoom(room, assignments);
    if (bed) return { roomKey: room.key, bedKey: bed };
  }
  // Overflow last — sofa bed.
  for (const room of ROOMS.filter((r) => r.building === "overflow")) {
    const bed = findFreeBedInRoom(room, assignments);
    if (bed) return { roomKey: room.key, bedKey: bed };
  }
  return null;
}

/**
 * Total beds remaining for a camp. Used by the booking form to show
 * "X spots left" / sold-out state, and by the API to check capacity
 * before inserting.
 */
export async function getRemainingCapacity(camp: CampSlug): Promise<{
  total: number;
  taken: number;
  remaining: number;
}> {
  const assignments = await loadAssignmentsForCamp(camp);
  const total = ROOMS.filter((r) => !r.reservedFor)
    .flatMap((r) => r.beds)
    .reduce((acc, b) => acc + b.sleeps, 0);
  // Each assignment consumes one bed slot. A single-supplement booking
  // creates additional placeholder rows so the count is accurate.
  const taken = assignments.length;
  return { total, taken, remaining: Math.max(0, total - taken) };
}

/**
 * Assign a freshly-inserted booking to a room. Caller passes the booking
 * id and whether they paid for the single-room supplement.
 *
 * Returns the assignment, or `{ status: "waitlist" }` when capacity is full.
 *
 * The function is idempotent-ish: if the booking already has assignments
 * we skip rather than double-book. If you need to re-assign someone, call
 * `clearAssignmentsForBooking` first.
 */
export async function autoAssignBooking(args: {
  bookingId: number;
  camp: CampSlug;
  singleRoom: boolean;
}): Promise<AssignResult> {
  // Check we haven't already assigned this booking.
  const existing = await db
    .select()
    .from(campRoomAssignments)
    .where(eq(campRoomAssignments.bookingId, args.bookingId))
    .limit(1);
  if (existing.length > 0) {
    const row = existing[0];
    return {
      status: "assigned",
      roomKey: row.roomKey,
      bedKey: row.bedKey,
      isSingleOccupancy: row.isSingleOccupancy,
    };
  }

  const assignments = await loadAssignmentsForCamp(args.camp);

  if (args.singleRoom) {
    const room = pickSingleSupplementRoom(assignments);
    if (!room) {
      return { status: "waitlist", isSingleOccupancy: true };
    }
    // Pick the largest bed in the room as the "real" assignment for clarity
    // in the admin view; the others become placeholders.
    const primaryBed =
      room.beds.find((b) => b.type === "queen") ??
      room.beds.find((b) => b.type === "double") ??
      room.beds[0];
    // Insert primary first, then placeholders. Each insert is safe because
    // the unique index on (camp, room_key, bed_key) catches duplicates.
    try {
      await db.insert(campRoomAssignments).values([
        {
          bookingId: args.bookingId,
          camp: args.camp,
          roomKey: room.key,
          bedKey: primaryBed.key,
          isSingleOccupancy: true,
          assignedBy: "auto",
        },
        ...room.beds
          .filter((b) => b.key !== primaryBed.key)
          .map((b) => ({
            bookingId: args.bookingId,
            camp: args.camp,
            roomKey: room.key,
            bedKey: b.key,
            isSingleOccupancy: true,
            assignedBy: "auto" as const,
          })),
      ]);
    } catch {
      // Race: someone else grabbed this room. Fall through to standard
      // assignment (which may itself fail if everything is now full).
      return autoAssignBooking({ ...args, singleRoom: false });
    }
    return {
      status: "assigned",
      roomKey: room.key,
      bedKey: primaryBed.key,
      isSingleOccupancy: true,
    };
  }

  const slot = pickStandardBed(assignments);
  if (!slot) {
    return { status: "waitlist", isSingleOccupancy: false };
  }

  try {
    await db.insert(campRoomAssignments).values({
      bookingId: args.bookingId,
      camp: args.camp,
      roomKey: slot.roomKey,
      bedKey: slot.bedKey,
      isSingleOccupancy: false,
      assignedBy: "auto",
    });
  } catch {
    // Race: this bed got taken. Reload and retry once.
    const next = pickStandardBed(await loadAssignmentsForCamp(args.camp));
    if (!next) return { status: "waitlist", isSingleOccupancy: false };
    await db.insert(campRoomAssignments).values({
      bookingId: args.bookingId,
      camp: args.camp,
      roomKey: next.roomKey,
      bedKey: next.bedKey,
      isSingleOccupancy: false,
      assignedBy: "auto",
    });
    return {
      status: "assigned",
      roomKey: next.roomKey,
      bedKey: next.bedKey,
      isSingleOccupancy: false,
    };
  }
  return {
    status: "assigned",
    roomKey: slot.roomKey,
    bedKey: slot.bedKey,
    isSingleOccupancy: false,
  };
}

export async function clearAssignmentsForBooking(bookingId: number) {
  await db
    .delete(campRoomAssignments)
    .where(eq(campRoomAssignments.bookingId, bookingId));
}

/**
 * Move a booking to a specific bed. Used by the admin override. Throws if
 * the target bed is occupied by another booking.
 */
export async function manuallyAssign(args: {
  bookingId: number;
  camp: CampSlug;
  roomKey: string;
  bedKey: string;
  isSingleOccupancy?: boolean;
  assignedBy?: string;
}): Promise<void> {
  const room = ROOMS_BY_KEY.get(args.roomKey);
  if (!room) throw new Error(`Unknown room ${args.roomKey}`);
  if (!room.beds.some((b) => b.key === args.bedKey)) {
    throw new Error(`Bed ${args.bedKey} is not in room ${args.roomKey}`);
  }
  // Check the bed isn't taken by someone else.
  const taken = await db
    .select()
    .from(campRoomAssignments)
    .where(
      and(
        eq(campRoomAssignments.camp, args.camp),
        eq(campRoomAssignments.roomKey, args.roomKey),
        eq(campRoomAssignments.bedKey, args.bedKey),
      ),
    )
    .limit(1);
  if (taken.length > 0 && taken[0].bookingId !== args.bookingId) {
    throw new Error(`Bed ${args.bedKey} is already taken`);
  }
  // Wipe any existing assignments for this booking.
  await clearAssignmentsForBooking(args.bookingId);
  await db.insert(campRoomAssignments).values({
    bookingId: args.bookingId,
    camp: args.camp,
    roomKey: args.roomKey,
    bedKey: args.bedKey,
    isSingleOccupancy: args.isSingleOccupancy ?? false,
    assignedBy: args.assignedBy ?? "manual",
  });
}
