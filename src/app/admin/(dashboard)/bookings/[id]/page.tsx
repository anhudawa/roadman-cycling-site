import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/admin/auth";
import { getBookingById } from "@/lib/crm/bookings";
import { BookingEditor } from "../_components/BookingEditor";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) notFound();

  const booking = await getBookingById(id);
  if (!booking) notFound();

  return (
    <BookingEditor
      booking={booking}
      currentUser={{ slug: user.slug, name: user.name, role: user.role }}
    />
  );
}
