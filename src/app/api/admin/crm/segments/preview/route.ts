import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { evaluateFilters, sanitizeFilters } from "@/lib/crm/segments";

export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const filters = sanitizeFilters(body.filters);
  const { count, preview } = await evaluateFilters(filters, { previewLimit: 20 });

  return NextResponse.json({
    count,
    preview: preview.map((c) => ({
      id: c.id,
      email: c.email,
      name: c.name,
      lifecycleStage: c.lifecycleStage,
      tags: c.tags,
    })),
  });
}
