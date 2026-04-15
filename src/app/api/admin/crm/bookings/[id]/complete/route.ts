import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { getBookingById, updateBooking } from "@/lib/crm/bookings";

export async function POST(
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

  const updated = await updateBooking(
    id,
    { status: "completed" },
    { authorSlug: user.slug, authorName: user.name }
  );
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fresh = await getBookingById(id);
  return NextResponse.json({ booking: fresh });
}
