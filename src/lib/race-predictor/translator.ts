// AI parameter translator: free-text setup description → CdA / Crr / mass / position.
// Uses Claude Haiku 4.5 with prompt caching on the knowledge-base system block.
//
// The big system prompt is reused on every request. With ephemeral prompt
// caching, steady-state cost drops ~10× because the knowledge base is read
// once per ~5 minutes and reused across requests.

import Anthropic from "@anthropic-ai/sdk";
import type { RidingPosition, SurfaceType } from "./types";
import { CDA_BY_POSITION, CRR_BY_SURFACE } from "./constants";

const MODEL = "claude-haiku-4-5-20251001";

export interface TranslatedParams {
  cda: number;
  crr: number;
  bodyMass: number;
  bikeMass: number;
  position: RidingPosition;
  surface: SurfaceType;
  /** 0–1 — model's confidence in the extraction. */
  confidence: number;
  /** Plain-English explanation the user can read & override. */
  reasoning: string;
  /** Anything we couldn't extract — surfaced as user-input prompts. */
  missing: string[];
}

const KNOWLEDGE_BASE = `You are a cycling-equipment extraction assistant. Given a free-text description of a rider's setup, return STRICT JSON with their physical parameters.

## CdA (drag area, m²) by riding position
- TT bars (full aero, time-trial): 0.21
- Aero road, drops (deep aero road bike, in the drops): 0.24
- Aero road, hoods (Tarmac SL, Madone, Aeroad — modern aero road, on the hoods): 0.31
- Endurance, hoods (Roubaix, Domane, Defy — taller stack, on the hoods): 0.34
- Standard road, hoods (older or non-aero geometry, hoods): 0.38
- Climbing position (any bike, hands-up sitting upright): 0.40

## Common bike → typical CdA (rider on hoods unless noted)
- Cervélo S5, Specialized SL8/Tarmac, Canyon Aeroad, Trek Madone, Pinarello F: 0.30–0.32 (aero_hoods)
- Cervélo Caledonia, Specialized Roubaix, Trek Domane, Canyon Endurace: 0.33–0.35 (endurance_hoods)
- Trek Émonda, Specialized Aethos, Cannondale SuperSix EVO, Canyon Ultimate: 0.32–0.34 (between aero and standard depending on rider build)
- TT/triathlon bikes (Cervélo P5, Specialized Shiv, Canyon Speedmax, Argon 18 E-119): 0.20–0.23 (tt_bars)

## Crr (rolling resistance) by tyre + surface
- Continental GP5000 / GP5000 S TR / Vittoria Corsa Pro / Schwalbe Pro One on smooth tarmac: 0.0032
- GP5000 28mm on mixed road: 0.0034
- Conti GP4000, Continental Grand Prix Classic on tarmac: 0.0040
- Cheap training tyres (Specialized Roubaix Pro, Pirelli Cinturato Velo): 0.0050
- Wider gravel tyres (35–40mm) on smooth gravel: 0.0070
- Aggressive gravel tyres on rough gravel: 0.0120
- Cobbles or chip-seal: 0.0050–0.0060

## Surface vocabulary
- "tarmac" / "smooth roads" / "race tyres" → tarmac_smooth
- "average roads" / "mixed conditions" / "training tyres" → tarmac_mixed
- "rough roads" / "chip-seal" / "back roads" → tarmac_rough
- "cobbles" / "pavé" → cobbles
- "gravel" (smooth/rolling) → gravel_smooth
- "rough gravel" / "fire roads" → gravel_rough

## Rider build inference (when explicit weight is missing)
- "lean climber" / "small climber": 60–66 kg
- "average build" / "GC contender": 68–74 kg
- "rouleur" / "powerful rider" / "bigger build": 75–82 kg
- "big" / "heavy" / "Classics rider": 83–90 kg
ONLY infer mass if user gives a description; otherwise return missing: ["bodyMass"].

## Bike mass defaults
- Aero/race road bike: 7.5–8.0 kg
- Endurance road bike: 8.0–8.5 kg
- TT bike: 9.0–9.5 kg
- Gravel bike: 9.0–10.0 kg
- E-bike: 18–22 kg

## Output format (STRICT JSON, no preamble)
Return EXACTLY:
{
  "cda": number,
  "crr": number,
  "bodyMass": number,
  "bikeMass": number,
  "position": "tt_bars" | "aero_drops" | "aero_hoods" | "endurance_hoods" | "standard_hoods" | "climbing",
  "surface": "tarmac_smooth" | "tarmac_mixed" | "tarmac_rough" | "chip_seal" | "gravel_smooth" | "gravel_rough" | "cobbles",
  "confidence": number,        // 0..1
  "reasoning": string,         // 1–2 sentences, plain English, why these values
  "missing": string[]          // names of fields you had to guess (e.g. ["bodyMass"])
}

## Confidence calibration
- All info present + brand match: 0.85–0.95
- Bike + position + tyre clearly stated: 0.75–0.85
- Position inferred from bike: 0.65–0.75
- Mass inferred from build descriptor: 0.55–0.70
- Mostly defaults: 0.40–0.55

NEVER return a value outside the position/surface enums above. NEVER return text outside the JSON. If the user's description is incoherent, default to position=aero_hoods, surface=tarmac_mixed, confidence=0.30, missing=["bodyMass"].`;

const VALID_POSITIONS = Object.keys(CDA_BY_POSITION) as RidingPosition[];
const VALID_SURFACES = Object.keys(CRR_BY_SURFACE) as SurfaceType[];

const DEFAULT: TranslatedParams = {
  cda: 0.34,
  crr: 0.0034,
  bodyMass: 75,
  bikeMass: 8,
  position: "endurance_hoods",
  surface: "tarmac_mixed",
  confidence: 0.3,
  reasoning: "Defaults applied — fill in your specific setup for a tighter prediction.",
  missing: ["bodyMass", "bikeMass"],
};

interface TranslatorClient {
  messages: {
    create: typeof Anthropic.prototype.messages.create;
  };
}

interface TranslateOptions {
  /** Inject a custom client for tests. */
  client?: TranslatorClient;
}

export async function translateRiderInput(
  freeText: string,
  options: TranslateOptions = {},
): Promise<TranslatedParams> {
  if (!freeText || freeText.trim().length === 0) return { ...DEFAULT };
  if (!process.env.ANTHROPIC_API_KEY && !options.client) {
    return { ...DEFAULT, reasoning: "AI translator unavailable — defaults applied." };
  }
  const client: TranslatorClient = options.client ?? (new Anthropic() as unknown as TranslatorClient);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    temperature: 0,
    system: [
      {
        type: "text",
        text: KNOWLEDGE_BASE,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Extract physical parameters from this rider's description:\n\n"""${freeText.trim().slice(0, 1200)}"""\n\nReturn STRICT JSON only.`,
      },
    ],
  });

  const block = response.content?.find((b) => b.type === "text");
  if (!block || block.type !== "text") return { ...DEFAULT };
  const parsed = parseTranslatorJson(block.text);
  return parsed ?? { ...DEFAULT };
}

/** Exported for tests. */
export function parseTranslatorJson(raw: string): TranslatedParams | null {
  const text = raw.trim();
  // Tolerate the model wrapping JSON in fences.
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart < 0 || jsonEnd < 0) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;

  const position = VALID_POSITIONS.includes(obj.position as RidingPosition)
    ? (obj.position as RidingPosition)
    : "endurance_hoods";
  const surface = VALID_SURFACES.includes(obj.surface as SurfaceType)
    ? (obj.surface as SurfaceType)
    : "tarmac_mixed";

  const cda = clampNumber(obj.cda, 0.18, 0.50, CDA_BY_POSITION[position]);
  const crr = clampNumber(obj.crr, 0.002, 0.030, CRR_BY_SURFACE[surface]);
  const bodyMass = clampNumber(obj.bodyMass, 40, 130, 75);
  const bikeMass = clampNumber(obj.bikeMass, 5, 25, 8);
  const confidence = clampNumber(obj.confidence, 0, 1, 0.5);
  const reasoning =
    typeof obj.reasoning === "string"
      ? obj.reasoning.slice(0, 500)
      : "Parameters extracted from your description.";
  const missing = Array.isArray(obj.missing)
    ? (obj.missing as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 8)
    : [];

  return {
    cda,
    crr,
    bodyMass,
    bikeMass,
    position,
    surface,
    confidence,
    reasoning,
    missing,
  };
}

function clampNumber(raw: unknown, min: number, max: number, fallback: number): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
