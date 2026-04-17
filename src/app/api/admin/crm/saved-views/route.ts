import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { createSavedView, listSavedViews } from "@/lib/crm/saved-views";

export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const entity = url.searchParams.get("entity") || "contacts";
  const views = await listSavedViews(entity);
  return NextResponse.json({ views });
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const entity = typeof body.entity === "string" ? body.entity.trim() : "";
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  if (!entity) return NextResponse.json({ error: "Entity required" }, { status: 400 });

  const filters =
    body.filters && typeof body.filters === "object" && !Array.isArray(body.filters)
      ? (body.filters as Record<string, unknown>)
      : {};

  const view = await createSavedView({
    name,
    entity,
    filters,
    createdBySlug: user.slug,
  });
  return NextResponse.json({ view });
}
