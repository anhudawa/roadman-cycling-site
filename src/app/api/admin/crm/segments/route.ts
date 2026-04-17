import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { createSegment, listSegments, countByFilters, sanitizeFilters } from "@/lib/crm/segments";

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await listSegments();
  const withCounts = await Promise.all(
    rows.map(async (s) => ({ ...s, memberCount: await countByFilters(s.filters) }))
  );
  return NextResponse.json({ segments: withCounts });
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const description = typeof body.description === "string" ? body.description.trim() || null : null;
  const filters = sanitizeFilters(body.filters);

  const segment = await createSegment({
    name,
    description,
    filters,
    createdBySlug: user.slug,
  });

  return NextResponse.json({ segment });
}
