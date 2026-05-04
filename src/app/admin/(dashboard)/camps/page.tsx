import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { campBookings, campRoomAssignments, type CampSlug } from "@/lib/db/schema";
import { requireAuth } from "@/lib/admin/auth";
import { CAMPS, formatCampDates, type CampConfig } from "@/lib/camps/camps";
import { ROOMS } from "@/lib/camps/rooms";
import { getRemainingCapacity } from "@/lib/camps/assigner";
import { CampsDashboard, type CampBookingRow } from "./_components/CampsDashboard";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function pickCamp(value: string | undefined): CampSlug {
  if (value === "gravel") return "gravel";
  return "road";
}

async function buildBookingRows(camp: CampSlug): Promise<CampBookingRow[]> {
  const rows = await db
    .select()
    .from(campBookings)
    .where(eq(campBookings.camp, camp))
    .orderBy(desc(campBookings.createdAt));

  if (rows.length === 0) return [];

  // Pull all assignments for this camp in one query, then map them onto
  // bookings client-side.
  const allAssignments = await db
    .select()
    .from(campRoomAssignments)
    .where(eq(campRoomAssignments.camp, camp));

  // For each booking, find its "primary" assignment row — the one whose
  // bedKey isn't a placeholder for a single-supplement lock. The first
  // inserted row is always the primary, so we pick the lowest id.
  const primaryByBooking = new Map<number, typeof allAssignments[number]>();
  for (const a of allAssignments) {
    const existing = primaryByBooking.get(a.bookingId);
    if (!existing || a.id < existing.id) primaryByBooking.set(a.bookingId, a);
  }

  return rows.map((r) => {
    const a = primaryByBooking.get(r.id);
    return {
      id: r.id,
      camp: r.camp as CampSlug,
      name: r.name,
      email: r.email,
      phone: r.phone,
      singleRoom: r.singleRoom,
      dietary: r.dietary,
      emergencyContactName: r.emergencyContactName,
      emergencyContactPhone: r.emergencyContactPhone,
      medical: r.medical,
      heardFrom: r.heardFrom,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      roomKey: a?.roomKey ?? null,
      bedKey: a?.bedKey ?? null,
      isSingleOccupancy: a?.isSingleOccupancy ?? false,
    };
  });
}

export default async function AdminCampsPage({ searchParams }: PageProps) {
  await requireAuth();
  const sp = await searchParams;
  const campParam = Array.isArray(sp.camp) ? sp.camp[0] : sp.camp;
  const camp: CampSlug = pickCamp(campParam);
  const config: CampConfig = CAMPS[camp];
  const otherSlug: CampSlug = camp === "road" ? "gravel" : "road";
  const otherConfig = CAMPS[otherSlug];

  const [bookings, capacity, otherCapacity] = await Promise.all([
    buildBookingRows(camp),
    getRemainingCapacity(camp),
    getRemainingCapacity(otherSlug),
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl sm:text-3xl text-off-white tracking-wider uppercase leading-none">
          Training Camps
        </h1>
        <p className="text-foreground-muted text-sm mt-1.5">
          Bookings, capacity, and auto-assigned rooms for Girona 2026.
        </p>
      </div>

      <CampsDashboard
        campSlug={camp}
        campLabel={config.shortName}
        campDates={formatCampDates(config)}
        rooms={ROOMS}
        bookings={bookings}
        capacity={capacity}
        otherCampSlug={otherSlug}
        otherCampLabel={otherConfig.shortName}
        otherCapacity={otherCapacity}
      />
    </div>
  );
}
