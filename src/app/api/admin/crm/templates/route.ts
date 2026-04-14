import { NextResponse } from "next/server";
import { requireAuth, type TeamUser } from "@/lib/admin/auth";
import { createTemplate, listTemplates } from "@/lib/crm/email";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await listTemplates();
  return NextResponse.json({
    templates: rows.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  let user: TeamUser;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const subject = typeof b.subject === "string" ? b.subject.trim() : "";
  const templateBody = typeof b.body === "string" ? b.body : "";
  const slugInput = typeof b.slug === "string" && b.slug.trim() ? b.slug.trim() : name;
  const slug = slugify(slugInput);

  if (!name || !subject || !templateBody.trim() || !slug) {
    return NextResponse.json(
      { error: "Name, slug, subject and body required" },
      { status: 400 }
    );
  }

  try {
    const created = await createTemplate({
      name,
      slug,
      subject,
      body: templateBody,
      createdBy: user.slug,
    });
    return NextResponse.json({
      template: {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create template";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
