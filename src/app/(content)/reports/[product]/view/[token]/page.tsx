import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPaidReportByToken,
  incrementDownloadCount,
} from "@/lib/paid-reports/reports";
import {
  PAID_REPORT_EVENTS,
  recordPaidReportServerEvent,
} from "@/lib/analytics/paid-report-events";
import { getProductBySlug } from "@/lib/paid-reports/products";
import { Container, Footer, Header, Section } from "@/components/layout";
import Link from "next/link";

/**
 * Tokenised web view for a paid report.
 *
 * Renders the cached HTML snapshot of the report (generated alongside
 * the PDF). Token possession = ownership. The page is noindex + the
 * HTML sets its own noindex meta, so search engines can't ingest a
 * stray shared link.
 */

export const dynamic = "force-dynamic";

async function load(productSlug: string, token: string) {
  const report = await getPaidReportByToken(token);
  if (!report || report.productSlug !== productSlug) return null;
  if (report.status === "revoked" || report.status === "refunded") return null;
  if (!["generated", "delivered"].includes(report.status)) return null;
  const product = await getProductBySlug(report.productSlug);
  if (!product) return null;
  return { report, product };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ product: string; token: string }>;
}): Promise<Metadata> {
  const { product, token } = await params;
  const loaded = await load(product, token);
  return {
    title: loaded
      ? `${loaded.product.name} $— Roadman Cycling`
      : "Report $— Roadman Cycling",
    robots: { index: false, follow: false },
  };
}

export default async function PaidReportView({
  params,
}: {
  params: Promise<{ product: string; token: string }>;
}) {
  const { product, token } = await params;
  const loaded = await load(product, token);
  if (!loaded) notFound();
  const { report, product: productRow } = loaded;

  // Count the view as a download $— same permission bar, same abuse signal.
  void incrementDownloadCount(report.id).catch(() => {});
  void recordPaidReportServerEvent({
    name: PAID_REPORT_EVENTS.VIEWED,
    page: `/reports/${productRow.slug}/view`,
    email: report.email,
    productSlug: productRow.slug,
    reportId: report.id,
    orderId: report.orderId,
  });

  const downloadHref = report.pdfUrl
    ? `/api/reports/download/${token}`
    : null;

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-10">
          <Container width="narrow">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-3">
              Your Roadman report
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              {productRow.name.toUpperCase()}
            </h1>
            <div className="flex flex-wrap gap-3 mt-4">
              {downloadHref ? (
                <Link
                  href={downloadHref}
                  className="inline-flex items-center gap-2 rounded-md bg-coral text-off-white hover:bg-coral/90 px-5 py-2.5 text-sm font-heading tracking-wider uppercase transition-colors"
                  data-track="paid_report_download_pdf"
                >
                  Download PDF
                </Link>
              ) : null}
              <Link
                href="/ask"
                className="inline-flex items-center gap-2 rounded-md border border-white/20 text-off-white hover:border-coral px-5 py-2.5 text-sm font-heading tracking-wider uppercase transition-colors"
                data-track="paid_report_open_ask"
              >
                Open in Ask Roadman
              </Link>
            </div>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-10">
          <Container width="narrow">
            {report.webReportHtml ? (
              <article
                className="rounded-xl border border-white/5 bg-off-white text-charcoal p-0 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: report.webReportHtml }}
              />
            ) : (
              <p className="text-foreground-muted">
                Your report is ready $— check the PDF download above.
              </p>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
