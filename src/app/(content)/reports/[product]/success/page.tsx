import type { Metadata } from "next";
import Link from "next/link";
import { Container, Footer, Header, Section } from "@/components/layout";
import {
  getProductBySlug,
  listActiveProducts,
} from "@/lib/paid-reports/products";
import type { ReportProduct } from "@/lib/paid-reports/types";
import { CheckoutSuccessBeacon } from "@/components/paid-reports/CheckoutSuccessBeacon";

/**
 * Post-checkout confirmation page.
 *
 * Stripe redirects here with ?session_id=... on a successful checkout.
 * We don't trust that for anything authoritative — the webhook is the
 * source of truth for order + report state. This page is a receipt + a
 * deliberate upsell stack:
 *   1. "What happens next" so the rider knows the report is incoming.
 *   2. Bundle upsell — single-report buyers see the bundle that includes
 *      what they just bought (so they only pay the difference once).
 *   3. Not Done Yet community CTA — coaching is the natural next step
 *      for any rider who just bought a personalised report.
 */

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ product: string }>;
}): Promise<Metadata> {
  const { product } = await params;
  // Graceful degradation: the customer has already paid by the time
  // they land here. A DB outage must not show them an error page.
  const productRow = await getProductBySlug(product).catch(() => null);
  return {
    title: productRow
      ? `Thanks — ${productRow.name} on its way`
      : "Thanks — your Roadman report is on the way",
    robots: { index: false, follow: false },
  };
}

function formatPrice(cents: number, currency: string): string {
  const major = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  switch (currency.toLowerCase()) {
    case "eur":
      return `€${major}`;
    case "gbp":
      return `£${major}`;
    case "usd":
      return `$${major}`;
    default:
      return `${major} ${currency.toUpperCase()}`;
  }
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
  // Graceful degradation: never crash this page on a DB blip — the
  // customer has paid. Worst case we render the generic confirmation
  // copy without the bundle upsell.
  const productRow = await getProductBySlug(product).catch(() => null);
  const allProducts = await listActiveProducts().catch(() => []);
  const bundle = pickBundleUpsell(productRow, allProducts);
  const bundleSavings = bundle && productRow
    ? computeBundleSavings(bundle, productRow, allProducts)
    : null;

  return (
    <>
      <Header />
      <CheckoutSuccessBeacon
        productSlug={productRow?.slug ?? product}
        sessionId={sessionId ?? null}
      />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
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

        {bundle && productRow ? (
          <Section background="charcoal" className="!py-12">
            <Container width="narrow">
              <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-purple/10 to-transparent p-6 md:p-8">
                <p className="font-heading text-coral text-xs tracking-widest mb-2">
                  GET THE COMPLETE PACKAGE
                </p>
                <h2 className="font-heading text-off-white text-2xl md:text-3xl mb-3 leading-tight">
                  {bundle.name.toUpperCase()}
                </h2>
                <p className="text-foreground-muted text-sm md:text-base leading-relaxed mb-5">
                  {bundle.description}
                </p>
                <div className="flex items-baseline gap-3 mb-5 flex-wrap">
                  <span className="font-heading text-off-white text-3xl">
                    {formatPrice(bundle.priceCents, bundle.currency)}
                  </span>
                  <span className="text-foreground-subtle text-sm line-through">
                    {bundleSavings
                      ? formatPrice(bundleSavings.componentsCents, bundle.currency)
                      : null}
                  </span>
                  {bundleSavings && bundleSavings.savesCents > 0 ? (
                    <span className="bg-coral/15 text-coral text-xs font-heading uppercase tracking-wider px-2 py-1 rounded">
                      Save {formatPrice(bundleSavings.savesCents, bundle.currency)}
                    </span>
                  ) : null}
                </div>
                <Link
                  href={`/reports/${bundle.slug}`}
                  data-track="bundle_upsell_post_purchase"
                  data-product={bundle.slug}
                  className="inline-flex items-center gap-2 rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm font-heading tracking-wider uppercase transition-colors"
                >
                  Upgrade to the bundle →
                </Link>
                <p className="text-foreground-subtle text-xs mt-3">
                  Reply to your delivery email and we&apos;ll credit what you just paid against the bundle price.
                </p>
              </div>
            </Container>
          </Section>
        ) : null}

        <Section background="deep-purple" className="!py-12">
          <Container width="narrow">
            <div className="rounded-2xl border border-white/10 bg-background-elevated p-6 md:p-8">
              <p className="font-heading text-coral text-xs tracking-widest mb-2">
                YOUR NEXT STEP
              </p>
              <h2 className="font-heading text-off-white text-2xl md:text-3xl mb-3 leading-tight">
                NOT DONE YET — THE COMMUNITY
              </h2>
              <p className="text-foreground-muted text-sm md:text-base leading-relaxed mb-4">
                The report tells you what to do. Not Done Yet is where serious
                amateur racers train alongside Anthony — weekly live calls,
                Vekta-driven plans, and the same expert access this report
                draws on (Dan Lorang, Professor Seiler, Dr. David Dunne).
              </p>
              <ul className="text-foreground-muted text-sm space-y-2 mb-5">
                <li className="flex gap-2.5 items-start">
                  <span className="text-coral mt-1 leading-none shrink-0">▸</span>
                  Weekly live Q&amp;A with Anthony
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="text-coral mt-1 leading-none shrink-0">▸</span>
                  Vekta-powered training plans built around your power profile
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="text-coral mt-1 leading-none shrink-0">▸</span>
                  Private community of riders who train like you do
                </li>
              </ul>
              <Link
                href="/community/not-done-yet"
                data-track="ndy_upsell_post_purchase"
                className="inline-flex items-center gap-2 rounded-md bg-purple hover:bg-purple-hover text-off-white px-6 py-3 text-sm font-heading tracking-wider uppercase transition-colors"
              >
                See Not Done Yet →
              </Link>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

/**
 * Pick a bundle worth offering: must be active, must NOT be the product
 * the rider just bought, and must include the rider's product so the
 * "credit what you paid" pitch is honest. Returns the first match.
 */
function pickBundleUpsell(
  bought: ReportProduct | null,
  all: ReportProduct[],
): ReportProduct | null {
  if (!bought) return null;
  // Already bought a bundle — nothing to upsell.
  if (bought.bundleItems && bought.bundleItems.length > 0) return null;
  return (
    all.find(
      (p) =>
        p.active &&
        p.bundleItems &&
        p.bundleItems.includes(bought.slug),
    ) ?? null
  );
}

/**
 * Sum component-product prices to surface a "save $X" badge. If we can't
 * resolve the components, return null and skip the savings line.
 */
function computeBundleSavings(
  bundle: ReportProduct,
  bought: ReportProduct,
  all: ReportProduct[],
): { componentsCents: number; savesCents: number } | null {
  if (!bundle.bundleItems) return null;
  const componentsCents = bundle.bundleItems.reduce((sum, slug) => {
    const item = all.find((p) => p.slug === slug);
    return sum + (item?.priceCents ?? 0);
  }, 0);
  const savesCents = componentsCents - bundle.priceCents;
  void bought;
  return { componentsCents, savesCents };
}
