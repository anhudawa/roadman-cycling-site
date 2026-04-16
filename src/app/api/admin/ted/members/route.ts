import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tedActiveMembers } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { parseCsv } from "@/lib/text/csv";

export const dynamic = "force-dynamic";

interface UpsertRow {
  memberId: string;
  firstName: string;
  topicTags: string[];
}

// POST /api/admin/ted/members — CSV upsert.
// Body: { csv: string }
// CSV shape: member_id,first_name,topic_tags  (topic_tags comma-separated inside a quoted field)
export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { csv?: string };
  if (!body.csv || typeof body.csv !== "string") {
    return NextResponse.json(
      { error: "Missing csv string" },
      { status: 400 }
    );
  }

  let parsed: UpsertRow[];
  try {
    parsed = parseUpsertRows(body.csv);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }

  let ok = 0;
  const failed: Array<{ memberId: string; error: string }> = [];
  for (const r of parsed) {
    try {
      await db
        .insert(tedActiveMembers)
        .values({
          memberId: r.memberId,
          firstName: r.firstName,
          topicTags: r.topicTags,
          postCount: 1,
        })
        .onConflictDoUpdate({
          target: tedActiveMembers.memberId,
          set: {
            lastSeenAt: new Date(),
            firstName: r.firstName,
            topicTags: r.topicTags,
            postCount: sql`${tedActiveMembers.postCount} + 1`,
          },
        });
      ok += 1;
    } catch (err) {
      failed.push({
        memberId: r.memberId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    upserted: ok,
    failed,
    total: parsed.length,
  });
}

function parseUpsertRows(text: string): UpsertRow[] {
  const { headers, rows } = parseCsv(text);
  if (rows.length === 0) throw new Error("CSV has no data rows");

  const lowered = headers.map((h) => h.toLowerCase().trim());
  const idx = {
    memberId: lowered.indexOf("member_id"),
    firstName: lowered.indexOf("first_name"),
    topicTags: lowered.indexOf("topic_tags"),
  };
  if (idx.memberId < 0 || idx.firstName < 0 || idx.topicTags < 0) {
    throw new Error("CSV must have columns: member_id, first_name, topic_tags");
  }

  const out: UpsertRow[] = [];
  for (const cols of rows) {
    if (cols.length < 3) continue;
    const memberId = cols[idx.memberId]?.trim();
    const firstName = cols[idx.firstName]?.trim();
    const tags = cols[idx.topicTags]
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!memberId || !firstName) continue;
    out.push({ memberId, firstName, topicTags: tags ?? [] });
  }
  return out;
}
