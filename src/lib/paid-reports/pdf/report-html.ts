import type { ReportContent, RenderedSection } from "./content";

/**
 * Brand-consistent HTML version of the paid report, used by:
 *   · the tokenised /reports/[product]/view/[token] web view
 *   · the inline body of the delivery email (strip to a digest)
 *
 * Keeps the same narrative + section order as the PDF so the rider
 * sees a consistent experience whether they open the PDF or the link.
 * Written as string concatenation (no React) so it can be cached and
 * the delivery path stays dependency-free.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderSection(section: RenderedSection): string {
  const eyebrow = sectionEyebrowFor(section.kind);
  const paragraphs = section.paragraphs
    .map((p) => `<p style="margin:0 0 10px;color:#545559;line-height:1.6;">${escapeHtml(p)}</p>`)
    .join("");
  const bullets =
    section.bullets && section.bullets.length > 0
      ? `<ul style="margin:8px 0 0;padding-left:20px;color:#545559;line-height:1.6;">${section.bullets
          .map(
            (b) =>
              `<li style="margin:6px 0;"><span style="color:#F16363;margin-right:4px;">▸</span>${escapeHtml(b)}</li>`,
          )
          .join("")}</ul>`
      : "";
  return `
    <section style="margin:0 0 32px;padding:0;">
      ${eyebrow ? `<p style="margin:0 0 4px;color:#F16363;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">${escapeHtml(eyebrow)}</p>` : ""}
      <h2 style="margin:0 0 12px;color:#210140;font-size:22px;font-weight:800;text-transform:uppercase;line-height:1.15;">${escapeHtml(section.title)}</h2>
      ${paragraphs}
      ${bullets}
    </section>
  `;
}

function sectionEyebrowFor(kind: string): string | undefined {
  const map: Record<string, string> = {
    summary: "The short answer",
    primary_limiter: "Your primary limiter",
    secondary_limiter: "Queue up next",
    next_12_weeks: "The plan",
    week_by_week: "Your week",
    fuelling_plan: "Fuelling",
    zones_plan: "Zones",
    recovery_plan: "Recovery",
    risk_addendum: "Watch-outs",
    ask_roadman: "Keep going",
    community_invite: "The room",
    disclaimer: "Important",
  };
  return map[kind];
}

export function renderReportHtml(content: ReportContent, opts?: { pdfHref?: string | null; viewHref?: string | null }): string {
  const cover = content.sections.find((s) => s.kind === "cover");
  const body = content.sections.filter((s) => s.kind !== "cover");

  const greeting = content.riderFirstName
    ? `For ${escapeHtml(content.riderFirstName)}`
    : "Your personalised report";

  const dateLabel = content.generatedAt.toISOString().slice(0, 10);

  const pdfCta = opts?.pdfHref
    ? `<a href="${opts.pdfHref}" style="display:inline-block;padding:12px 20px;background:#F16363;color:#FAFAFA;text-decoration:none;border-radius:6px;font-weight:700;letter-spacing:1px;text-transform:uppercase;font-size:12px;">Download the PDF</a>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="robots" content="noindex,nofollow"/>
  <title>${escapeHtml(content.productName)} · Roadman Cycling</title>
</head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#252526;">
  <div style="max-width:720px;margin:0 auto;padding:0 0 48px;">
    <header style="background:#210140;color:#FAFAFA;padding:40px 32px 32px;">
      <p style="margin:0 0 12px;color:#F16363;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
        Roadman Cycling · Paid Report
      </p>
      <h1 style="margin:0 0 16px;color:#FAFAFA;font-size:32px;font-weight:800;text-transform:uppercase;line-height:1.1;">
        ${escapeHtml(cover?.title ?? content.productName)}
      </h1>
      <p style="margin:0 0 24px;color:#FAFAFA;opacity:0.85;font-size:14px;line-height:1.5;">
        ${escapeHtml(cover?.paragraphs[0] ?? content.toolTitle)}
      </p>
      <p style="margin:0 0 6px;color:#F16363;font-size:12px;font-weight:700;text-transform:uppercase;">
        ${greeting}
      </p>
      <p style="margin:0;color:#FAFAFA;font-size:14px;line-height:1.6;">
        ${escapeHtml(content.summary)}
      </p>
      ${pdfCta ? `<div style="margin-top:24px;">${pdfCta}</div>` : ""}
    </header>

    <main style="padding:32px;background:#FAFAFA;">
      ${body.map(renderSection).join("\n")}
    </main>

    <footer style="padding:24px 32px;background:#210140;color:#FAFAFA;opacity:0.85;font-size:11px;line-height:1.6;">
      <p style="margin:0 0 8px;">Generated ${dateLabel} · Roadman Cycling</p>
      <p style="margin:0;">Questions? Reply to this email — Anthony and the team read everything.</p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Email-friendly digest — trimmed to the essentials with prominent CTAs
 * back to the full web view + PDF. Inline styles everywhere since most
 * email clients ignore <style>.
 */
export function renderDeliveryEmailHtml(
  content: ReportContent,
  opts: { viewHref: string; pdfHref: string | null },
): string {
  const primary = content.primaryCategory;
  const greeting = content.riderFirstName
    ? `Hi ${escapeHtml(content.riderFirstName)},`
    : "Hi,";

  const pdfCta = opts.pdfHref
    ? `<a href="${opts.pdfHref}" style="display:inline-block;margin:8px 8px 8px 0;padding:12px 20px;background:#F16363;color:#FAFAFA;text-decoration:none;border-radius:6px;font-weight:700;letter-spacing:1px;text-transform:uppercase;font-size:12px;">Download PDF</a>`
    : "";

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"/><title>${escapeHtml(content.productName)}</title></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#252526;">
  <div style="max-width:640px;margin:0 auto;padding:0;">
    <div style="background:#210140;color:#FAFAFA;padding:32px 24px;">
      <p style="margin:0 0 8px;color:#F16363;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Roadman Cycling</p>
      <h1 style="margin:0 0 8px;color:#FAFAFA;font-size:24px;font-weight:800;text-transform:uppercase;line-height:1.15;">
        ${escapeHtml(content.productName)}
      </h1>
      <p style="margin:0;color:#FAFAFA;opacity:0.85;font-size:13px;">
        ${escapeHtml(content.toolTitle)}
      </p>
    </div>

    <div style="padding:24px;background:#FAFAFA;color:#252526;line-height:1.6;">
      <p style="margin:0 0 16px;">${greeting}</p>
      <p style="margin:0 0 16px;">Your ${escapeHtml(content.productName)} is ready. ${escapeHtml(content.summary)}</p>

      ${
        primary
          ? `<p style="margin:0 0 8px;color:#F16363;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Primary limiter</p>
      <p style="margin:0 0 16px;"><strong>${escapeHtml(primary.label)}</strong> — ${escapeHtml(primary.explanation)}</p>`
          : ""
      }

      <div style="margin:24px 0;">
        <a href="${opts.viewHref}" style="display:inline-block;margin:8px 8px 8px 0;padding:12px 20px;background:#4C1273;color:#FAFAFA;text-decoration:none;border-radius:6px;font-weight:700;letter-spacing:1px;text-transform:uppercase;font-size:12px;">Open full report</a>
        ${pdfCta}
      </div>

      <p style="margin:24px 0 0;color:#545559;font-size:12px;line-height:1.5;">
        Keep this email — the links are private and tied to your report. Lose
        the email? Reply and we'll resend a fresh link.
      </p>
    </div>

    <div style="padding:16px 24px;background:#210140;color:#FAFAFA;opacity:0.85;font-size:11px;line-height:1.6;text-align:center;">
      Roadman Cycling · roadmancycling.com
    </div>
  </div>
</body>
</html>`;
}
