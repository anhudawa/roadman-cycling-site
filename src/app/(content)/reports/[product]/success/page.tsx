import type { Metadata } from "next";
import Link from "next/link";
import { Container, Footer, Header, Section } from "@/components/layout";
import { getProductBySlug } from "@/lib/paid-reports/products";
import { CheckoutSuccessBeacon } from "@/components/paid-reports/CheckoutSuccessBeacon";

/**
 * Post-checkout confirmation page.
 *
 * Stripe redirects here with ?session_id=... on a successful checkout.
 * We don't trust that for anything authoritative — the webhook is the
 * source of truth for order + report state. This page is purely a
 * receipt + "what happens next" landing so the rider knows they're
 * covered while the async generator runs.
 */

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ product: string }>;
}): Promise<Metadata> {
  const { product } = await params;
  const productRow = await getProductBySlug(product);
  return {
    title: productRow
      ? `Thanks — ${productRow.name} on its way`
      : "Thanks — your Roadman report is on the way",
    robots: { index: false, follow: false },
  };
}

export default async function PaidReportSuccess({
  params,
  searchParams,
}: {
  params: Promise<{ product: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { product } = await params;
  const { session_id: sessionId } = await searchParams;
  const productRow = await getProductBySlug(product);

  return (
    <>
      <Header />
      <CheckoutSuccessBeacon
        productSlug={productRow?.slug ?? product}
        sessionId={sessionId ?? null}
      />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container width="narrow">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-3">
              Payment confirmed
            </p>
            <h1
              className="font-heading text-off-white mb-6"
              style={{ fontSize: "var(--text-section)" }}
            >
              YOUR {productRow ? productRow.name.toUpperCase() : "ROADMAN REPORT"} IS ON THE WAY.
            </h1>
            <p className="text-foreground-muted text-lg leading-relaxed mb-4">
              Thanks — the payment came through cleanly. The report is
              generating now and will land in your inbox within a few minutes.
            </p>
            <p className="text-foreground-subtle text-sm mb-8">
              Not here in 10 minutes? Check spam first, then reply to the
              confirmation email from Stripe with your address and we&apos;ll
              resend manually.
            </p>

            <div className="rounded-2xl border border-white/10 bg-background-elevated p-6 md:p-8 mb-6">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                WHAT HAPPENS NEXT
              </p>
              <ol className="space-y-3 text-foreground-muted text-sm leading-relaxed">
                <li>
                  <span className="text-coral font-heading mr-2">1.</span>
                  We score the report from your saved inputs — no extra forms.
                </li>
                <li>
                  <span className="text-coral font-heading mr-2">2.</span>
                  You get an email with a secure link + the PDF attached.
                </li>
                <li>
                  <span className="text-coral font-heading mr-2">3.</span>
                  Open Ask Roadman any time to talk through the plan — it has
                  your result pre-loaded.
                </li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/ask"
                className="inline-flex items-center gap-2 rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm font-heading tracking-wider uppercase transition-colors"
              >
                Open Ask Roadman
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-md border border-white/20 text-off-white hover:border-coral px-6 py-3 text-sm font-heading tracking-wider uppercase transition-colors"
              >
                Keep reading
              </Link>
            </div>

            {sessionId ? (
              <p className="text-foreground-subtle text-xs mt-8 font-mono opacity-60">
                Session reference: {sessionId.slice(0, 20)}…
              </p>
            ) : null}
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
