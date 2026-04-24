/**
 * Resend delivery wrapper for paid reports.
 *
 * A single helper that every delivery code-path (initial send, admin
 * resend, token-expiry re-issue) uses, so the "from" + subject line +
 * Reply-To stay consistent.
 *
 * Non-fatal errors bubble up — the generator logs + marks the report as
 * failed; we don't swallow errors here.
 */

const FROM_ADDRESS = "Roadman Cycling <noreply@roadmancycling.com>";
const REPLY_TO = "anthony@roadmancycling.com";

export interface SendReportEmailInput {
  to: string;
  subject: string;
  html: string;
  pdf?: {
    filename: string;
    contentBase64: string;
  };
}

export async function sendReportEmail(
  input: SendReportEmailInput,
): Promise<{ id: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const body: Record<string, unknown> = {
    from: FROM_ADDRESS,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    reply_to: REPLY_TO,
  };
  if (input.pdf) {
    body.attachments = [
      {
        filename: input.pdf.filename,
        content: input.pdf.contentBase64,
      },
    ];
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Resend send failed (${res.status}): ${txt}`);
  }
  const json = (await res.json().catch(() => null)) as { id?: string } | null;
  return { id: json?.id ?? null };
}
