import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { RECOMMENDATION_CATALOG_HEADERS } from "@/lib/recommends/catalog-csv";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();
  return new NextResponse(`${RECOMMENDATION_CATALOG_HEADERS.join(",")}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="roadman-recommends-template.csv"',
      "Cache-Control": "no-store",
    },
  });
}
