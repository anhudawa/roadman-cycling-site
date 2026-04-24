import { db } from "@/lib/db";
import { roadmanEvents } from "@/lib/db/schema";
import { and, eq, gte, ilike } from "drizzle-orm";

export async function listUpcomingEvents(limit = 10, location?: string) {
  const now = new Date();

  const conditions = [
    eq(roadmanEvents.isActive, true),
    gte(roadmanEvents.startsAt, now),
    ...(location
      ? [ilike(roadmanEvents.location, `%${location}%`)]
      : []),
  ];

  const rows = await db
    .select()
    .from(roadmanEvents)
    .where(and(...conditions))
    .orderBy(roadmanEvents.startsAt)
    .limit(limit);

  return rows.map((e) => ({
    event_id: e.id,
    name: e.name,
    type: e.type,
    starts_at: e.startsAt.toISOString(),
    location: e.location,
    description: e.description,
    is_members_only: e.isMembersOnly,
    url: e.url,
  }));
}
