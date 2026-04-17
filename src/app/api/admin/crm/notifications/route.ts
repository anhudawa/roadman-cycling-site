import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { countUnread, listNotifications } from "@/lib/crm/notifications";

export async function GET(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const unreadOnly = url.searchParams.get("unread") === "1";
  const countOnly = url.searchParams.get("count") === "1";
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 100) : 20;

  try {
    if (countOnly) {
      const unread = await countUnread(user.slug);
      return NextResponse.json({ unread });
    }
    const [rows, unread] = await Promise.all([
      listNotifications(user.slug, { limit, unreadOnly }),
      countUnread(user.slug),
    ]);
    return NextResponse.json({ notifications: rows, unread });
  } catch (err) {
    console.error("[notifications] list failed", err);
    return NextResponse.json({ notifications: [], unread: 0 });
  }
}
