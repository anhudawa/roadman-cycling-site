import { NextResponse } from "next/server";
import { z } from "zod";
import { completeToolResult } from "@/lib/tool-results/pipeline";
import {
  fuellingTags,
  ftpZonesTags,
  type FuellingTagInput,
  type FtpZonesTagInput,
} from "@/lib/tool-results/tags";
import { clampString, LIMITS, normaliseEmail } from "@/lib/validation";

/**
 * Unified save endpoint for Phase 2 tool completions (fuelling, ftp_zones).
 *
 * Flow:
 *   1. Validate email + tool + payload
 *   2. Build tool-specific summary/primaryResult/tags
 *   3. Hand off to completeToolResult — one pipeline handles rider
 *      profile upsert, tool_result row, CRM activity, Beehiiv sync,
 *      transactional email with permalink + Ask Roadman handoff link.
 *
 * The route is thin on purpose — all orchestration is in the pipeline
 * so the plateau flow and future tools can share it.
 *
 * Body shape:
 *   {
 *     tool: 'fuelling' | 'ftp_zones',
 *     email, firstName?,
 *     inputs, outputs,
 *     profilePatch?, utm?, consent: boolean
 *   }
 */

const FuellingSchema = z.object({
  tool: z.literal("fuelling"),
  email: z.string(),
  firstName: z.string().optional().nullable(),
  consent: z.boolean().default(false),
  inputs: z.object({
    durationMinutes: z.number().int().positive(),
    sessionType: z.enum([
      "recovery",
      "endurance",
      "tempo",
      "sweetspot",
      "threshold",
      "vo2",
      "race",
      "intervals",
    ]),
    watts: z.number().int().positive(),
    weightKg: z.number().positive(),
    gutTraining: z.enum(["none", "some", "trained"]),
  }),
  outputs: z.object({
    carbsPerHour: z.number().nonnegative(),
    totalCarbs: z.number().nonnegative(),
    fluidPerHour: z.number().nonnegative(),
    totalFluid: z.number().nonnegative(),
    sodiumPerHour: z.number().nonnegative(),
    glucosePerHour: z.number().nonnegative(),
    fructosePerHour: z.number().nonnegative(),
    feedingInterval: z.number().nonnegative(),
    startFuellingAt: z.number().nonnegative(),
    dualSource: z.boolean(),
    heatCategory: z.enum(["cool", "mild", "warm", "hot"]),
    weatherNote: z.string().nullable().optional(),
    intensityLabel: z.string(),
    strategy: z.array(z.string()),
  }),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
    })
    .optional(),
});

const FtpZonesSchema = z.object({
  tool: z.literal("ftp_zones"),
  email: z.string(),
  firstName: z.string().optional().nullable(),
  consent: z.boolean().default(false),
  inputs: z.object({
    ftp: z.number().int().positive(),
    weightKg: z.number().positive().nullable().optional(),
    maxHr: z.number().int().positive().nullable().optional(),
  }),
  outputs: z.object({
    wkg: z.number().positive().nullable().optional(),
    zones: z.array(
      z.object({
        zone: z.string(),
        label: z.string(),
        lower: z.number(),
        upper: z.number(),
      }),
    ),
  }),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
    })
    .optional(),
});

const BodySchema = z.discriminatedUnion("tool", [FuellingSchema, FtpZonesSchema]);

function originFromRequest(req: Request): string {
  const fwdHost = req.headers.get("x-forwarded-host");
  const fwdProto = req.headers.get("x-forwarded-proto") ?? "https";
  if (fwdHost) return `${fwdProto}://${fwdHost}`;
  try {
    const u = new URL(req.url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "https://roadmancycling.com";
  }
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const email = normaliseEmail(data.email);
  if (!email) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (!data.consent) {
    return NextResponse.json(
      { error: "Consent is required to save and email your result." },
      { status: 400 },
    );
  }
  const firstName = clampString(data.firstName, LIMITS.name);

  try {
    if (data.tool === "fuelling") {
      const tagInput: FuellingTagInput = {
        intensity: data.inputs.sessionType,
        carbsPerHour: data.outputs.carbsPerHour,
        gutTraining: data.inputs.gutTraining,
        heatCategory: data.outputs.heatCategory,
      };
      const tags = fuellingTags(tagInput);
      const summary = `${data.outputs.carbsPerHour}g carbs/hr · ${data.outputs.fluidPerHour}ml fluid/hr · ${data.outputs.sodiumPerHour}mg sodium/hr for a ${data.inputs.durationMinutes}-min ${data.outputs.intensityLabel} session at ${data.inputs.watts}W.`;

      const outcome = await completeToolResult({
        email,
        toolSlug: "fuelling",
        inputs: data.inputs,
        outputs: data.outputs,
        summary,
        primaryResult: `${data.outputs.carbsPerHour}g/hr`,
        tags,
        utm: data.utm,
        sourcePage: "/tools/fuelling",
        profilePatch: {
          firstName: firstName ?? undefined,
          weeklyTrainingHours: undefined,
          biggestLimiter: "fuelling",
          consentSaveProfile: true,
          consentEmailFollowup: true,
        },
        baseUrl: originFromRequest(request),
      });
      return NextResponse.json({
        success: true,
        slug: outcome.result.slug,
        emailSent: outcome.emailSent,
      });
    }

    // ftp_zones
    const tagInput: FtpZonesTagInput = {
      ftp: data.inputs.ftp,
      wkg: data.outputs.wkg ?? null,
    };
    const tags = ftpZonesTags(tagInput);
    const summary = data.outputs.wkg
      ? `FTP ${data.inputs.ftp}W (${data.outputs.wkg.toFixed(2)} W/kg) — personalised power zones.`
      : `FTP ${data.inputs.ftp}W — personalised power zones.`;

    const outcome = await completeToolResult({
      email,
      toolSlug: "ftp_zones",
      inputs: data.inputs,
      outputs: data.outputs,
      summary,
      primaryResult: `${data.inputs.ftp}W`,
      tags,
      utm: data.utm,
      sourcePage: "/tools/ftp-zones",
      profilePatch: {
        firstName: firstName ?? undefined,
        currentFtp: data.inputs.ftp,
        consentSaveProfile: true,
        consentEmailFollowup: true,
      },
      baseUrl: originFromRequest(request),
    });
    return NextResponse.json({
      success: true,
      slug: outcome.result.slug,
      emailSent: outcome.emailSent,
    });
  } catch (err) {
    console.error("[tools/save] error", err);
    return NextResponse.json(
      { error: "Couldn't save your result. Try again in a moment." },
      { status: 500 },
    );
  }
}
