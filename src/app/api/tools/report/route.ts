import { NextResponse } from "next/server";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { generateToolReport, type ToolSlug as LegacyToolSlug } from "@/lib/tools/reports";
import { upsertContact, addActivity } from "@/lib/crm/contacts";
import { clampString, LIMITS, normaliseEmail } from "@/lib/validation";
import { completeToolResult } from "@/lib/tool-results/pipeline";
import { fuellingTags, ftpZonesTags } from "@/lib/tool-results/tags";
import { getDefinition } from "@/lib/diagnostics/framework/registry";
import type { ToolSlug as SaveableToolSlug } from "@/lib/tool-results/types";

/**
 * Unified tool-report endpoint.
 *
 * Two branches:
 *
 *   a) Saveable tools ("fuelling", "ftp-zones") — route through the
 *      completeToolResult pipeline which persists a `tool_results`
 *      row, upserts the rider profile, fires CRM tags, syncs Beehiiv,
 *      and emails the personalised report. Client gets back a permalink
 *      slug so it can redirect to /results/<tool>/<slug>.
 *
 *   b) Legacy tools (tyre-pressure, race-weight, energy-availability,
 *      shock-pressure) — use the original email-only path. No save.
 */

const LEGACY_TOOLS: LegacyToolSlug[] = [
  "tyre-pressure",
  "race-weight",
  "energy-availability",
  "shock-pressure",
];

const SAVEABLE_CLIENT_TOOLS = ["fuelling", "ftp-zones"] as const;
type SaveableClientTool = (typeof SAVEABLE_CLIENT_TOOLS)[number];

const SAVEABLE_SLUG_MAP: Record<SaveableClientTool, SaveableToolSlug> = {
  fuelling: "fuelling",
  "ftp-zones": "ftp_zones",
};

const FROM_ADDRESS = "Roadman Cycling <noreply@roadmancycling.com>";

function isSaveableClientTool(x: unknown): x is SaveableClientTool {
  return typeof x === "string" && (SAVEABLE_CLIENT_TOOLS as readonly string[]).includes(x);
}

function isLegacyTool(x: unknown): x is LegacyToolSlug {
  return typeof x === "string" && (LEGACY_TOOLS as readonly string[]).includes(x);
}

async function sendReportEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[tools/report] RESEND_API_KEY not set");
    return { success: false, error: "Email service not configured" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[tools/report] Resend error:", res.status, body);
      return { success: false, error: body };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[tools/report] Resend send failed:", msg);
    return { success: false, error: msg };
  }
}

/* ============================================================ */
/* Saveable path — fuelling + ftp-zones                          */
/* ============================================================ */

function buildSaveableSavePayload(
  clientTool: SaveableClientTool,
  inputs: Record<string, unknown>,
  name: string | undefined,
) {
  const slug = SAVEABLE_SLUG_MAP[clientTool];
  const def = getDefinition(slug);

  if (clientTool === "fuelling") {
    const carbsPerHour = Number(inputs.carbsPerHour ?? 0);
    const fluidPerHour = Number(inputs.fluidPerHour ?? 0);
    const sodiumPerHour = Number(inputs.sodiumPerHour ?? 0);
    const weight = Number(inputs.weight ?? 0);
    const gutTraining = (inputs.gutTraining as "none" | "some" | "trained") ?? "some";
    const heatCategory =
      (inputs.heatCategory as "cool" | "mild" | "warm" | "hot") ?? "mild";
    const intensity = String(inputs.sessionType ?? "endurance");

    const primary = def.pickPrimary({}, { carbsPerHour }).primary;
    const answersForSummary = { carbsPerHour, fluidPerHour, sodiumPerHour };
    const summary = def.buildSummary(primary, {}, answersForSummary);

    return {
      riderProfilePatch: {
        firstName: name ?? null,
        currentWeight: weight > 0 ? weight : null,
      },
      save: {
        toolSlug: slug,
        inputs,
        outputs: {
          carbsPerHour,
          fluidPerHour,
          sodiumPerHour,
          totalCarbs: Number(inputs.totalCarbs ?? 0),
          totalFluid: Number(inputs.totalFluid ?? 0),
          glucosePerHour: Number(inputs.glucosePerHour ?? 0),
          fructosePerHour: Number(inputs.fructosePerHour ?? 0),
          strategy: String(inputs.strategy ?? ""),
          feedingInterval: String(inputs.feedingInterval ?? ""),
          startFuellingAt: String(inputs.startFuellingAt ?? ""),
          intensityLabel: String(inputs.intensityLabel ?? ""),
          heatCategory,
          primary,
        },
        summary,
        primaryResult: primary,
        tags: fuellingTags({ intensity, carbsPerHour, gutTraining, heatCategory }),
      },
    };
  }

  // ftp-zones
  const ftp = Number(inputs.ftp ?? 0);
  const weight = Number(inputs.weight ?? 0);
  const wkg = weight > 0 ? Number((ftp / weight).toFixed(2)) : null;
  const primary = def.pickPrimary({}, { wkg: wkg ?? 0 }).primary;
  const summary = def.buildSummary(primary, {}, { ftp, wkg: wkg ?? 0 });

  return {
    riderProfilePatch: {
      firstName: name ?? null,
      currentFtp: ftp > 0 ? ftp : null,
      currentWeight: weight > 0 ? weight : null,
    },
    save: {
      toolSlug: slug,
      inputs,
      outputs: { ftp, wkg, primary },
      summary,
      primaryResult: primary,
      tags: ftpZonesTags({ ftp, wkg }),
    },
  };
}

async function handleSaveable(
  clientTool: SaveableClientTool,
  email: string,
  name: string | undefined,
  inputs: Record<string, unknown>,
  baseUrl: string,
  sourcePage: string | null,
) {
  const payload = buildSaveableSavePayload(clientTool, inputs, name);

  const outcome = await completeToolResult({
    email,
    riderProfileId: null,
    baseUrl,
    sourcePage,
    profilePatch: payload.riderProfilePatch,
    ...payload.save,
  });

  return NextResponse.json({
    success: true,
    emailSent: outcome.emailSent,
    slug: outcome.result.slug,
    permalink: `/results/${outcome.result.toolSlug.replace("_", "-")}/${outcome.result.slug}`,
    primaryResult: outcome.result.primaryResult,
  });
}

/* ============================================================ */
/* Legacy path — email-only tools                                */
/* ============================================================ */

async function handleLegacy(
  tool: LegacyToolSlug,
  email: string,
  name: string | undefined,
  inputs: Record<string, unknown>,
) {
  const report = generateToolReport(tool, { ...inputs, name });
  if (!report) {
    return NextResponse.json(
      { error: "Could not generate report from these inputs." },
      { status: 422 },
    );
  }

  const [emailResult] = await Promise.all([
    sendReportEmail(email, report.subject, report.html),
    subscribeToBeehiiv({
      email,
      name,
      tags: [report.beehiivTag, `tool-${tool}`],
      customFields: {
        ...report.beehiivFields,
        last_tool: tool,
      },
      utm: {
        source: "site",
        medium: "tool",
        campaign: report.beehiivTag,
      },
    }).catch((err) =>
      console.error("[tools/report] Beehiiv sync failed:", err),
    ),
    (async () => {
      try {
        const contact = await upsertContact({
          email,
          name,
          source: "subscribers",
          customFields: {
            ...report.beehiivFields,
            last_tool: tool,
          },
        });
        await addActivity(contact.id, {
          type: "tag_added",
          title: `Requested ${tool} report`,
          body: `Inputs: ${JSON.stringify(inputs)}`,
          meta: { tool, inputs },
          authorName: "system",
        });
      } catch (err) {
        console.error("[tools/report] CRM sync failed:", err);
      }
    })(),
  ]);

  if (!emailResult.success) {
    return NextResponse.json(
      {
        success: true,
        emailSent: false,
        message:
          "We saved your results — but the email send failed. We'll look into it.",
      },
      { status: 200 },
    );
  }

  return NextResponse.json({ success: true, emailSent: true });
}

/* ============================================================ */
/* Route handler                                                 */
/* ============================================================ */

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tool?: string;
      email?: string;
      name?: string;
      inputs?: Record<string, unknown>;
      sourcePage?: string;
    };

    const { tool, email, name, inputs, sourcePage } = body;

    const normalisedEmail = normaliseEmail(email);
    if (!normalisedEmail) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }
    if (!inputs || typeof inputs !== "object") {
      return NextResponse.json(
        { error: "Missing calculator inputs." },
        { status: 400 },
      );
    }

    const normalisedName = clampString(name, LIMITS.name) ?? undefined;
    const baseUrl = new URL(request.url).origin;
    const safeSourcePage =
      typeof sourcePage === "string" ? clampString(sourcePage, 200) : null;

    if (isSaveableClientTool(tool)) {
      return await handleSaveable(
        tool,
        normalisedEmail,
        normalisedName,
        inputs,
        baseUrl,
        safeSourcePage,
      );
    }

    if (isLegacyTool(tool)) {
      return await handleLegacy(tool, normalisedEmail, normalisedName, inputs);
    }

    return NextResponse.json(
      { error: "Invalid tool identifier." },
      { status: 400 },
    );
  } catch (err) {
    console.error("[tools/report] Error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
