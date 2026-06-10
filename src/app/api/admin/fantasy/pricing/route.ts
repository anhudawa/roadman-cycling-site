import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyProTeams, fantasyRiders } from "@/lib/db/schema";
import { audit } from "@/lib/fantasy/queries";
import { PRICE_MAX, PRICE_MIN } from "@/lib/fantasy/admin";
import { requireAdminJson } from "../_lib/guard";

const COLUMNS = ["name", "pcs_id", "team", "class", "price", "country"] as const;

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // RFC 4180 — wrap in double quotes, double any internal quotes.
  return `"${s.replace(/"/g, '""')}"`;
}

/** Minimal RFC 4180 parser — quoted fields, doubled quotes, CRLF lines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/** Full pricing sheet as CSV (name,pcs_id,team,class,price,country). */
export async function GET() {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const riders = await db
    .select({
      name: fantasyRiders.name,
      pcsId: fantasyRiders.pcsId,
      team: fantasyProTeams.name,
      riderClass: fantasyRiders.riderClass,
      price: fantasyRiders.price,
      countryCode: fantasyRiders.countryCode,
    })
    .from(fantasyRiders)
    .innerJoin(fantasyProTeams, eq(fantasyProTeams.id, fantasyRiders.proTeamId))
    .orderBy(sql`${fantasyRiders.price} DESC`, asc(fantasyRiders.name));

  const lines: string[] = [COLUMNS.join(",")];
  for (const r of riders) {
    lines.push(
      [r.name, r.pcsId ?? "", r.team, r.riderClass, r.price, r.countryCode ?? ""]
        .map(csvEscape)
        .join(","),
    );
  }

  const filename = `fantasy-pricing-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Price import — same columns as the export. Only `price` is updated;
 * rows are matched by pcs_id first, then exact name. Anything that
 * doesn't match is reported back rather than silently skipped.
 */
export async function POST(request: Request) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const text = await request.text();
  if (!text.trim()) return NextResponse.json({ error: "Empty CSV body" }, { status: 400 });

  const rows = parseCsv(text);
  if (rows.length < 2) {
    return NextResponse.json({ error: "CSV needs a header row plus data rows" }, { status: 400 });
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col: Record<string, number> = {};
  for (const name of COLUMNS) col[name] = header.indexOf(name);
  if (col.name === -1 || col.price === -1) {
    return NextResponse.json(
      { error: `CSV header must include the columns ${COLUMNS.join(",")}` },
      { status: 400 },
    );
  }

  const riders = await db
    .select({
      id: fantasyRiders.id,
      name: fantasyRiders.name,
      pcsId: fantasyRiders.pcsId,
      price: fantasyRiders.price,
    })
    .from(fantasyRiders);
  const byPcsId = new Map(riders.filter((r) => r.pcsId).map((r) => [r.pcsId as string, r]));
  const byName = new Map(riders.map((r) => [r.name.toLowerCase(), r]));

  let updated = 0;
  const unmatched: string[] = [];
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = (row[col.name] ?? "").trim();
    const pcsId = col.pcs_id !== -1 ? (row[col.pcs_id] ?? "").trim() : "";
    const priceRaw = (row[col.price] ?? "").trim();
    const price = Number(priceRaw);
    if (
      !Number.isInteger(price) ||
      price < PRICE_MIN ||
      price > PRICE_MAX
    ) {
      errors.push(`Row ${i + 1} (${name || pcsId || "?"}): price "${priceRaw}" must be ${PRICE_MIN}–${PRICE_MAX}`);
      continue;
    }
    const rider = (pcsId && byPcsId.get(pcsId)) || byName.get(name.toLowerCase());
    if (!rider) {
      unmatched.push(name || pcsId || `row ${i + 1}`);
      continue;
    }
    if (rider.price !== price) {
      await db
        .update(fantasyRiders)
        .set({ price, updatedAt: new Date() })
        .where(eq(fantasyRiders.id, rider.id));
      updated++;
    }
  }

  await audit(gate.user.email, "riders.import_prices", "rider", null, {
    rows: rows.length - 1,
    updated,
    unmatched: unmatched.length,
    errors: errors.length,
  });

  return NextResponse.json({ ok: true, updated, unmatched, errors });
}
