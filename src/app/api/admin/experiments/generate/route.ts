import { NextRequest, NextResponse } from "next/server";
import { generateVariants } from "@/lib/ab/variant-generator";
import { getCurrentUser } from "@/lib/admin/auth";

export async function POST(req: NextRequest) {
  // Auth check — verify the session cookie, don't trust mere presence.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { page, currentContent, elementType } = await req.json();

    if (!page || !currentContent || !elementType) {
      return NextResponse.json(
        { error: "Missing required fields: page, currentContent, elementType" },
        { status: 400 }
      );
    }

    const variants = await generateVariants(page, currentContent, elementType);

    return NextResponse.json({ ok: true, variants });
  } catch (err) {
    console.error("[Generate Variants] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate variants" },
      { status: 500 }
    );
  }
}
