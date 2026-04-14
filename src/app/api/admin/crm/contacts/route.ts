import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { listContacts } from "@/lib/crm/contacts";

export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? undefined;
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "10", 10) || 10, 50);

  const { rows, total } = await listContacts({ search, limit, offset: 0 });

  return NextResponse.json({
    total,
    rows: rows.map((c) => ({
      id: c.id,
      email: c.email,
      name: c.name,
    })),
  });
}
