import { NextResponse } from "next/server";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { generateToolReport, type ToolSlug } from "@/lib/tools/reports";
import { upsertContact, addActivity } from "@/lib/crm/contacts";
import { clampString, LIMITS, normaliseEmail } from "@/lib/validation";

/**
 * Unified tool-report endpoint.
 *
 * Every calculator on /tools/* can request a personalised HTML email
 * report via this single route. Flow:
 *   1. Validate email + tool slug + inputs
 *   2. Generate report HTML + subject + Beehiiv tag via the
 *      report generator lib
 *   3. Send email via Resend (from noreply@roadmancycling.com)
 *   4. Upsert Beehiiv subscriber with tool-specific tag
 *   5. Upsert in CRM as a "tool_report" activity
 *
 * All three side-effects are non-fatal — if Resend fails the user
 * still gets added to Beehiiv, etc. The HTTP response is the client's
 * confirmation, which we try very hard to return 200 unless validation
 * fails or the report itself couldn't be generated.
 */

const VALID_TOOLS: ToolSlug[] = [
  "ftp-zones",
  "tyre-pressure",
  "race-weight",
  "energy-availability",
  "fuelling",
  "shock-pressure",
];

const FROM_ADDRESS = "Roadman Cycling <noreply@roadmancycling.com>";

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tool?: string;
      email?: string;
      name?: string;
      inputs?: Record<string, unknown>;
    };

    const { tool, email, name, inputs } = body;

    // Validate
    if (!tool || typeof tool !== "string" || !VALID_TOOLS.includes(tool as ToolSlug)) {
      return NextResponse.json(
        { error: "Invalid tool identifier." },
        { status: 400 },
      );
    }
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

    // Generate the report — tool-specific logic lives in
    // src/lib/tools/reports.ts.
    const report = generateToolReport(tool as ToolSlug, {
      ...inputs,
      name: normalisedName,
    });
    if (!report) {
      return NextResponse.json(
        { error: "Could not generate report from these inputs." },
        { status: 422 },
      );
    }

    // Fire all three side-effects in parallel. All are non-fatal
    // w/r/t the HTTP response — we return success if the user's
    // email is at least accepted by our infra.
    const [emailResult] = await Promise.all([
      sendReportEmail(normalisedEmail, report.subject, report.html),
      subscribeToBeehiiv({
        email: normalisedEmail,
        name: normalisedName,
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
            email: normalisedEmail,
            name: normalisedName,
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
      // Don't error the whole flow — user is still in Beehiiv + CRM.
      // Tell them to check spam; log for our side to investigate.
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
  } catch (err) {
    console.error("[tools/report] Error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
