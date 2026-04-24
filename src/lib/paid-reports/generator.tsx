import { getDefinition } from "@/lib/diagnostics/framework/registry";
import { isToolSlug } from "@/lib/tool-results/types";
import { getToolResultBySlug } from "@/lib/tool-results/store";
import { loadById as loadRiderById } from "@/lib/rider-profile/store";
import { db } from "@/lib/db";
import { toolResults as toolResultsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getPaidReportById,
  generateSecureToken,
  markDelivered,
  markFailed,
  markGenerated,
  markGenerating,
} from "./reports";
import { getOrderById } from "./orders";
import { getProductBySlug } from "./products";
import { buildReportContent } from "./pdf/content";
import { renderDeliveryEmailHtml, renderReportHtml } from "./pdf/report-html";
import { logCrmSync } from "./crm-sync-log";
import { sendReportEmail } from "./delivery";

/**
 * End-to-end paid-report generation + delivery.
 *
 *   1. Load the paid_report, its order, the underlying tool_result, and
 *      the DiagnosticDefinition. Anything missing → mark failed.
 *   2. Flip status to `generating` so admin sees real-time progress.
 *   3. Render the PDF via @react-pdf/renderer (dynamic import — heavy).
 *   4. If @vercel/blob is configured, upload PDF → capture URL.
 *   5. Render the matching HTML web view; cache on the paid_report row.
 *   6. Mint a secure token (raw emailed, hash stored).
 *   7. Resend the delivery email with inline CTAs + PDF attachment.
 *   8. Flip to `delivered`, log CRM sync.
 *
 * The whole pipeline is non-fatal to the webhook caller: the webhook
 * `void`-fires this and swallows errors. Internally any failure marks
 * the report failed + logs so admin can retry.
 */

export const GENERATOR_VERSION = "v1.0.0";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  "https://roadmancycling.com";

export async function generateAndDeliverPaidReport(
  paidReportId: number,
): Promise<void> {
  try {
    const report = await getPaidReportById(paidReportId);
    if (!report) {
      console.error(`[paid-reports/generator] report ${paidReportId} not found`);
      return;
    }

    if (report.status === "delivered" || report.status === "generated") {
      console.log(
        `[paid-reports/generator] report ${paidReportId} already ${report.status} — skipping`,
      );
      return;
    }

    const order = await getOrderById(report.orderId);
    if (!order) {
      await markFailed(paidReportId, "order_missing");
      return;
    }
    if (order.status !== "paid") {
      await markFailed(paidReportId, `order_not_paid:${order.status}`);
      return;
    }

    const product = await getProductBySlug(report.productSlug);
    if (!product) {
      await markFailed(paidReportId, "product_inactive");
      return;
    }

    // Tool result — we need the scored output to render. Look up by
    // linked id if present; otherwise bail.
    if (!report.toolResultId) {
      await markFailed(paidReportId, "no_tool_result");
      return;
    }
    const toolResultRow = await loadToolResultById(report.toolResultId);
    if (!toolResultRow) {
      await markFailed(paidReportId, "tool_result_missing");
      return;
    }
    if (!isToolSlug(toolResultRow.toolSlug)) {
      await markFailed(paidReportId, `tool_slug_invalid:${toolResultRow.toolSlug}`);
      return;
    }

    const rider = report.riderProfileId
      ? await loadRiderById(report.riderProfileId)
      : null;

    const def = getDefinition(toolResultRow.toolSlug);

    const content = buildReportContent(def, toolResultRow, {
      productName: product.name,
      riderFirstName: rider?.firstName ?? null,
    });

    await markGenerating(paidReportId, GENERATOR_VERSION);

    // 3. PDF — dynamic import keeps @react-pdf/renderer out of cold-start
    //    for any request that doesn't hit this path.
    const pdfBuffer = await renderPdfBuffer(content);

    // 4. Blob upload (optional — dev can skip, web view still works).
    let pdfUrl: string | null = null;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const pathname = `paid-reports/${paidReportId}-${Date.now()}.pdf`;
        const uploaded = await put(pathname, pdfBuffer, {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
          contentType: "application/pdf",
          addRandomSuffix: true,
        });
        pdfUrl = uploaded.url;
      } catch (err) {
        console.error("[paid-reports/generator] blob upload failed:", err);
        // Fall through — web view + email attachment still work.
      }
    }

    // 5. HTML
    const webReportHtml = renderReportHtml(content, {
      pdfHref: pdfUrl,
      viewHref: null,
    });

    // 6. Secure token
    const { token, hash } = generateSecureToken();

    await markGenerated({
      reportId: paidReportId,
      pdfUrl,
      webReportHtml,
      pageCount: product.pageCountTarget ?? null,
      tokenHash: hash,
    });

    // 7. Delivery email
    const viewHref = `${BASE_URL}/reports/${product.slug}/view/${token}`;
    const downloadHref = pdfUrl
      ? `${BASE_URL}/api/reports/download/${token}`
      : null;
    const emailHtml = renderDeliveryEmailHtml(content, {
      viewHref,
      pdfHref: downloadHref,
    });

    const attachBase64 = pdfBuffer.toString("base64");
    const send = await sendReportEmail({
      to: report.email,
      subject: `Your ${product.name} is ready`,
      html: emailHtml,
      pdf: { filename: `${product.slug}.pdf`, contentBase64: attachBase64 },
    });

    await markDelivered(paidReportId);

    await logCrmSync({
      email: report.email,
      target: "resend",
      operation: "paid_report_delivered",
      payload: {
        paidReportId,
        productSlug: product.slug,
        resendId: send.id,
        pdfUploaded: Boolean(pdfUrl),
      },
      status: "success",
      relatedTable: "paid_reports",
      relatedId: paidReportId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[paid-reports/generator] failed for report ${paidReportId}:`,
      message,
    );
    await markFailed(paidReportId, message.slice(0, 255));
    await logCrmSync({
      email: "",
      target: "resend",
      operation: "paid_report_failed",
      payload: { paidReportId, message },
      status: "failed",
      error: message,
      relatedTable: "paid_reports",
      relatedId: paidReportId,
    }).catch(() => {});
  }
}

/**
 * Render the react-pdf document to a Node Buffer. Kept as a separate
 * function so tests can stub it and so the dynamic import lives in one
 * place.
 */
async function renderPdfBuffer(
  content: Awaited<ReturnType<typeof buildReportContent>>,
): Promise<Buffer> {
  const [{ renderToBuffer }, { ReportDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./pdf/report-pdf"),
  ]);
  const buffer = await renderToBuffer(<ReportDocument content={content} />);
  return buffer;
}

/**
 * tool_results is keyed by slug in the rest of the app, but we store
 * tool_result_id on orders/paid_reports. Small helper keeps this module
 * self-contained and doesn't leak a new public export.
 */
async function loadToolResultById(id: number) {
  const [row] = await db
    .select()
    .from(toolResultsTable)
    .where(eq(toolResultsTable.id, id))
    .limit(1);
  if (!row) return null;
  return getToolResultBySlug(row.slug);
}
