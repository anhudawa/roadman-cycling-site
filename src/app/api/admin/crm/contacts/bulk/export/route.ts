import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { requireAuth } from "@/lib/admin/auth";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "string" ? value : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatDate(d: Date | null): string {
  return d ? d.toISOString() : "";
}

export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const idsParam = url.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n > 0);

  if (ids.length === 0) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  const rows = await db.select().from(contacts).where(inArray(contacts.id, ids));

  const header = [
    "email",
    "name",
    "phone",
    "owner",
    "lifecycle_stage",
    "tags",
    "source",
    "first_seen_at",
    "last_activity_at",
    "custom_fields",
  ];

  const lines = [header.join(",")];
  for (const c of rows) {
    const tagList = Array.isArray(c.tags) ? c.tags.join(",") : "";
    const custom = c.customFields ? JSON.stringify(c.customFields) : "";
    const cols = [
      c.email,
      c.name ?? "",
      c.phone ?? "",
      c.owner ?? "",
      c.lifecycleStage,
      tagList,
      c.source ?? "",
      formatDate(c.firstSeenAt),
      formatDate(c.lastActivityAt),
      custom,
    ].map(escapeCsv);
    lines.push(cols.join(","));
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const filename = `contacts-${yyyy}${mm}${dd}.csv`;

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
