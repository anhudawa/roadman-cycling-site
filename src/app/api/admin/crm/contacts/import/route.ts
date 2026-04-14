import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { requireAuth } from "@/lib/admin/auth";
import { addActivity, upsertContact } from "@/lib/crm/contacts";
import type { TeamUser } from "@/lib/admin/auth";

const ALLOWED_OWNERS = ["sarah", "wes", "matthew", "ted"];

interface ImportRow {
  email?: unknown;
  name?: unknown;
  phone?: unknown;
  owner?: unknown;
  tags?: unknown;
}

function asString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : undefined;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let user: TeamUser;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { rows?: ImportRow[] } | null;
  if (!body || !Array.isArray(body.rows)) {
    return NextResponse.json({ error: "rows required" }, { status: 400 });
  }

  let created = 0;
  let updated = 0;
  const errors: Array<{ row: number; reason: string }> = [];

  for (let i = 0; i < body.rows.length; i++) {
    const r = body.rows[i];
    const email = asString(r.email)?.toLowerCase();
    if (!email || !isValidEmail(email)) {
      errors.push({ row: i, reason: "Missing or invalid email" });
      continue;
    }

    const name = asString(r.name);
    const phone = asString(r.phone);
    const ownerRaw = asString(r.owner)?.toLowerCase();
    const owner =
      ownerRaw && ALLOWED_OWNERS.includes(ownerRaw) ? ownerRaw : null;

    const tagsRaw = asString(r.tags);
    const tagList = tagsRaw
      ? tagsRaw
          .split(/[,;|]/)
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0 && t.length <= 40)
      : [];

    try {
      const existingRow = await db
        .select({ id: contacts.id })
        .from(contacts)
        .where(eq(contacts.email, email))
        .limit(1);
      const wasExisting = existingRow.length > 0;

      const contact = await upsertContact({
        email,
        name: name ?? null,
        phone: phone ?? null,
        source: "import",
        ownerHint: owner,
      });

      if (tagList.length > 0) {
        const currentTags = Array.isArray(contact.tags) ? contact.tags : [];
        const mergedTags = Array.from(new Set([...currentTags, ...tagList]));
        if (mergedTags.length !== currentTags.length) {
          await db
            .update(contacts)
            .set({ tags: mergedTags, updatedAt: new Date() })
            .where(eq(contacts.id, contact.id));
        }
      }

      await addActivity(contact.id, {
        type: "note",
        title: "Imported from CSV",
        authorName: user.name,
        authorSlug: user.slug,
      });

      if (wasExisting) updated++;
      else created++;
    } catch (err) {
      errors.push({
        row: i,
        reason: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ created, updated, errors });
}
