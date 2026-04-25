/**
 * Transactional email that ships the /results magic-link to a rider.
 * Signed token is embedded in the URL; the server-side verifier gates
 * the history page, so the email is the only surface that learns which
 * address owns which token.
 *
 * The email is intentionally minimal $€” one paragraph, one button, one
 * expiry line. This is a utility email, not a marketing send.
 */

const FROM_ADDRESS = "Roadman Cycling <noreply@roadmancycling.com>";

export interface SendHistoryLinkInput {
  email: string;
  link: string;
  expiresAt: Date;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function daysUntil(date: Date): number {
  return Math.max(1, Math.round((date.getTime() - Date.now()) / 86_400_000));
}

export async function sendHistoryLinkEmail(
  input: SendHistoryLinkInput,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[history-email] RESEND_API_KEY not set");
    return { sent: false, error: "Email service not configured" };
  }

  const safeLink = escapeHtml(input.link);
  const days = daysUntil(input.expiresAt);

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#0F0F14;color:#EDEDED;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <p style="color:#F16363;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 16px;">Roadman Cycling</p>
      <h1 style="font-size:24px;line-height:1.15;margin:0 0 12px;">Your saved results</h1>
      <p style="color:#C7C7C7;font-size:15px;line-height:1.55;margin:0 0 24px;">
        Click the link below to open every plateau diagnostic, fuelling plan
        and FTP zone table you've saved under this email.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${safeLink}"
           style="display:inline-block;background:#F16363;color:#fff;text-decoration:none;padding:14px 22px;border-radius:8px;font-weight:600;font-size:15px;letter-spacing:0.02em;">
          Open my results $†’
        </a>
      </p>
      <p style="color:#8A8A8A;font-size:12px;line-height:1.5;margin:0 0 8px;">
        This link is good for ${days} day${days === 1 ? "" : "s"} and is tied to
        this email address. If you didn't request it, you can ignore this
        message.
      </p>
      <p style="color:#8A8A8A;font-size:12px;line-height:1.5;margin:0;">
        roadmancycling.com
      </p>
    </div>
  </body>
</html>`;

  const text =
    `Open your saved results: ${input.link}\n\n` +
    `This link is good for ${days} day${days === 1 ? "" : "s"} and is tied to this email address. If you didn't request it, you can ignore this message.`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [input.email],
        subject: "Your Roadman saved results",
        html,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[history-email] Resend error:", res.status, body);
      return { sent: false, error: body };
    }
    return { sent: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[history-email] send failed:", msg);
    return { sent: false, error: msg };
  }
}
