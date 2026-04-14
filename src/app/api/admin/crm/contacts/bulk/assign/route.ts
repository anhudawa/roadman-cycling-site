import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts, contactActivities } from "@/lib/db/schema";
import { requireAuth } from "@/lib/admin/auth";
import type { TeamUser } from "@/lib/admin/auth";

const ALLOWED_OWNERS = ["sarah", "wes", "matthew", "ted"];

export async function POST(request: Request) {
  let user: TeamUser;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { contactIds?: unknown; owner?: unknown }
    | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const rawIds = Array.isArray(body.contactIds) ? body.contactIds : [];
  const contactIds = rawIds
    .map((v) => (typeof v === "number" ? v : parseInt(String(v), 10)))
    .filter((n): n is number => Number.isInteger(n) && n > 0);
  if (contactIds.length === 0) {
    return NextResponse.json({ error: "No contactIds provided" }, { status: 400 });
  }

  const ownerRaw = body.owner;
  let newOwner: string | null;
  if (ownerRaw === null || ownerRaw === "" || ownerRaw === undefined) {
    newOwner = null;
  } else if (typeof ownerRaw === "string" && ALLOWED_OWNERS.includes(ownerRaw)) {
    newOwner = ownerRaw;
  } else {
    return NextResponse.json({ error: "Invalid owner" }, { status: 400 });
  }

  const existing = await db
    .select({ id: contacts.id, owner: contacts.owner })
    .from(contacts)
    .where(inArray(contacts.id, contactIds));

  const now = new Date();
  await db
    .update(contacts)
    .set({ owner: newOwner, updatedAt: now, lastActivityAt: now })
    .where(inArray(contacts.id, contactIds));

  const activityRows = existing.map((c) => ({
    contactId: c.id,
    type: "assigned" as const,
    title: newOwner ? `Owner set to ${newOwner}` : "Owner cleared",
    body: null,
    meta: { previousOwner: c.owner, newOwner } as Record<string, unknown>,
    authorName: user.name,
    authorSlug: user.slug,
  }));

  if (activityRows.length > 0) {
    await db.insert(contactActivities).values(activityRows);
  }

  return NextResponse.json({ count: existing.length });
}
