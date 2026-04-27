import { NextResponse } from "next/server";
import { clampString, LIMITS } from "@/lib/validation";
import { translateRiderInput } from "@/lib/race-predictor/translator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TranslateBody {
  description?: string;
}

/**
 * POST /api/predict/translate
 * Body: { description: string }
 *
 * Free-text → CdA / Crr / mass / position via Haiku 4.5 with prompt caching.
 * Returns the parameters plus reasoning + confidence so the UI can present
 * them as editable defaults rather than hidden magic.
 */
export async function POST(request: Request) {
  let body: TranslateBody;
  try {
    body = (await request.json()) as TranslateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const description = clampString(body.description, LIMITS.shortText);
  if (!description) {
    return NextResponse.json(
      { error: "Describe your bike, position, tyres, and weight." },
      { status: 400 },
    );
  }

  try {
    const result = await translateRiderInput(description);
    return NextResponse.json({ params: result });
  } catch (err) {
    console.error("[predict/translate] failed:", err);
    return NextResponse.json(
      { error: "Could not translate that — try simpler wording or fill in the form manually." },
      { status: 502 },
    );
  }
}
