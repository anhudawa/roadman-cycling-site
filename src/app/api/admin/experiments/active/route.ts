import { NextResponse } from "next/server";
import type { ABVariant } from "@/lib/ab/types";

interface ActiveTest {
  id: string;
  pathPrefix: string;
  variantIds: string[];
}

export async function GET() {
  try {
    const { db } = await import("@/lib/db");
    const { abTests } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select({
        id: abTests.id,
        page: abTests.page,
        variants: abTests.variants,
      })
      .from(abTests)
      .where(eq(abTests.status, "running"));

    const tests: ActiveTest[] = rows.map((row) => {
      const variants = (row.variants ?? []) as ABVariant[];
      return {
        id: `exp_${row.id}`,
        pathPrefix: row.page,
        variantIds: variants.map((v) => v.id),
      };
    });

    return NextResponse.json({ tests });
  } catch {
    return NextResponse.json({ tests: [] });
  }
}
