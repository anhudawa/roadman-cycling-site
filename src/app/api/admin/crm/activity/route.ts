import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { listActivityFeed, ALL_ACTIVITY_TYPES } from "@/lib/crm/activity-feed";
import type { ActivityType } from "@/lib/crm/contacts";

export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const sp = url.searchParams;

  const typesParam = sp.getAll("type");
  const validTypes = typesParam.filter((t): t is ActivityType =>
    (ALL_ACTIVITY_TYPES as string[]).includes(t)
  );

  const authorSlug = sp.get("author") || undefined;
  const contactIdRaw = sp.get("contactId");
  const contactId = contactIdRaw ? parseInt(contactIdRaw, 10) : undefined;
  const search = sp.get("search") || undefined;
  const afterRaw = sp.get("after");
  const beforeRaw = sp.get("before");
  const after = afterRaw ? new Date(afterRaw) : undefined;
  const before = beforeRaw ? new Date(beforeRaw) : undefined;

  const limit = Math.min(parseInt(sp.get("limit") || "50", 10) || 50, 200);
  const offset = Math.max(parseInt(sp.get("offset") || "0", 10) || 0, 0);

  try {
    const { rows, total } = await listActivityFeed(
      {
        types: validTypes.length > 0 ? validTypes : undefined,
        authorSlug,
        contactId: Number.isFinite(contactId) ? contactId : undefined,
        search,
        after: after && !isNaN(after.getTime()) ? after : undefined,
        before: before && !isNaN(before.getTime()) ? before : undefined,
      },
      { limit, offset }
    );
    return NextResponse.json({ rows, total, limit, offset });
  } catch (err) {
    console.error("[activity-feed] list failed", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
