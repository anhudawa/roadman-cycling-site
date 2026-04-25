import { generateToolReport, type ToolSlug as ReportToolSlug } from "@/lib/tools/reports";
import type { ToolResult, ToolSlug } from "./types";

/**
 * Email a tool_result to the rider. Reuses the dark-themed email
 * wrapper in src/lib/tools/reports.ts but appends the public result
 * URL and a one-click Ask Roadman hand-off so the email becomes a
 * portable "your results" mini-page.
 *
 * Non-fatal by convention $€” the caller logs and moves on if this
 * rejects; the tool_result row is already persisted so the rider can
 * reach it via the history page.
 */

const REPORT_SLUG_BY_TOOL: Record<ToolSlug, ReportToolSlug | null> = {
  plateau: null, // plateau has its own transactional confirmation email
  fuelling: "fuelling",
  ftp_zones: "ftp-zones",
};

const FROM_ADDRESS = "Roadman Cycling <noreply@roadmancycling.com>";

export interface EmailToolResultInput {
  result: ToolResult;
  firstName?: string | null;
  baseUrl: string;
}

export async function emailToolResult(
  input: EmailToolResultInput,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[tool-results/email] RESEND_API_KEY not set");
    return { sent: false, error: "Email service not configured" };
  }

  const reportSlug = REPORT_SLUG_BY_TOOL[input.result.toolSlug];
  if (!reportSlug) return { sent: false, error: "No email for this tool" };

  const report = generateToolReport(reportSlug, {
    ...input.result.inputs,
    ...input.result.outputs,
    name: input.firstName ?? undefined,
  });
  if (!report) return { sent: false, error: "Report generator returned null" };

  const resultUrl = `${input.baseUrl}/results/${input.result.toolSlug.replace("_", "-")}/${input.result.slug}`;
  const askUrl = `${input.baseUrl}/ask?seed_tool=${input.result.toolSlug}&seed_result=${input.result.slug}`;

  const html = report.html.replace(
    "</body>",
    `<div style="max-width:640px;margin:0 auto;padding:0 16px 24px;color:#9ca3af;font-size:13px;line-height:1.6;">
      <p style="margin:16px 0 8px;">Permalink: <a href="${resultUrl}" style="color:#F16363;">${resultUrl}</a></p>
      <p style="margin:0 0 8px;">Want Ask Roadman to interpret this result? <a href="${askUrl}" style="color:#F16363;">Open it in the chat</a>.</p>
    </div></body>`,
  );

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [input.result.email],
        subject: report.subject,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[tool-results/email] Resend error:", res.status, body);
      return { sent: false, error: body };
    }
    return { sent: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[tool-results/email] send failed:", msg);
    return { sent: false, error: msg };
  }
}
