// Resend-powered email alerts. Replaces the spec's #ted-alerts Slack channel.
// Failures are non-fatal $€” logs to console if Resend isn't configured.

export async function sendTedAlert(opts: {
  subject: string;
  body: string;
  severity?: "warn" | "error";
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TED_ADMIN_ALERT_EMAIL;
  const from = process.env.TED_ALERT_FROM ?? "ted@roadmancycling.com";

  if (!apiKey || !to) {
    console.warn(
      `[ted-alert] skipping $€” RESEND_API_KEY=${!!apiKey} TED_ADMIN_ALERT_EMAIL=${!!to}`
    );
    console.warn(`[ted-alert] ${opts.severity ?? "warn"}: ${opts.subject}\n${opts.body}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: `[ted-${opts.severity ?? "warn"}] ${opts.subject}`,
        text: opts.body,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
        console.error(`[ted-alert] Resend failed: ${res.status} ${text}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[ted-alert] request failed: ${msg}`);
  }
}
