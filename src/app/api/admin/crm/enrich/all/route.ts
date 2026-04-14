import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { enrichAllContacts } from "@/lib/crm/enrichment";

export const maxDuration = 300;

export async function POST() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await enrichAllContacts();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/enrich/all] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Enrichment failed" },
      { status: 500 }
    );
  }
}
