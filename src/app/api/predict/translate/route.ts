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

  // The translator is hardened to always return a TranslatedParams — empty
  // input, missing key, AI errors, parse failures all fall through to a
  // sensible default with `reasoning` explaining what happened. We catch
  // here as a defence-in-depth so the user never sees a 5xx and can always
  // proceed with the prediction.
  try {
    const result = await translateRiderInput(description);
    return NextResponse.json({ params: result });
  } catch (err) {
    console.error("[predict/translate] unexpected failure:", err);
    return NextResponse.json({
      params: {
        cda: 0.34,
        crr: 0.0034,
        bodyMass: 75,
        bikeMass: 8,
        position: "endurance_hoods",
        surface: "tarmac_mixed",
        confidence: 0.25,
        reasoning:
          "Translator unavailable — sensible defaults applied. Adjust the form below for a tighter prediction.",
        missing: ["bodyMass", "bikeMass"],
      },
    });
  }
}
