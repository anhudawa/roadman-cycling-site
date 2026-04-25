import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Footer, Header, Section } from "@/components/layout";
import { getToolResultBySlug } from "@/lib/tool-results/store";
import { getDefinition } from "@/lib/diagnostics/framework/registry";
import type { ToolSlug } from "@/lib/tool-results/types";
import type { ResultCategory } from "@/lib/diagnostics/framework/types";
import { getProductForTool } from "@/lib/paid-reports/products";
import { UpsellCard } from "@/components/paid-reports/UpsellCard";
import { ToolAskHandoffLink } from "@/components/paid-reports/ToolAskHandoffLink";

/**
 * Saved tool-result permalink.
 *
 * Unguessable slug acts as the shareable token $€” no login required.
 * The free view renders summary + category explanation + next steps,
 * with a paid-report upsell below. The definition drives what copy
 * we show so plateau / fuelling / ftp all funnel through one template.
 */

export const dynamic = "force-dynamic";

const URL_TO_SLUG: Record<string, ToolSlug> = {
  plateau: "plateau",
  fuelling: "fuelling",
  "ftp-zones": "ftp_zones",
};

async function loadResult(toolUrl: string, slug: string) {
  const expected = URL_TO_SLUG[toolUrl];
  if (!expected) return null;
  const row = await getToolResultBySlug(slug);
  if (!row || row.toolSlug !== expected) return null;
  return row;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string; slug: string }>;
}): Promise<Metadata> {
  const { tool, slug } = await params;
  const result = await loadResult(tool, slug);
  if (!result) return { title: "Your result $€” Roadman Cycling", robots: { index: false, follow: false } };
  return {
    title: `Your result $€” Roadman Cycling`,
    description: result.summary,
    robots: { index: false, follow: false },
  };
}

export default async function ToolResultPermalink({
  params,
}: {
  params: Promise<{ tool: string; slug: string }>;
}) {
  const { tool, slug } = await params;
  const result = await loadResult(tool, slug);
  if (!result) notFound();

  const def = getDefinition(result.toolSlug);
  const primaryCategory: ResultCategory | undefined =
    result.primaryResult
      ? def.categories.find((c) => c.key === result.primaryResult)
      : undefined;

  const askHref = result.primaryResult
    ? `/ask?seed_tool=${result.toolSlug}&seed_result=${result.slug}`
    : "/ask";

  const paidProduct = await getProductForTool(result.toolSlug);

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-3">
              Your saved result
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              {def.title.toUpperCase()}
            </h1>
            <p className="text-foreground-muted text-lg leading-relaxed">
              {result.summary}
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            {primaryCategory ? (
              <article className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
                <p className="font-heading text-coral text-xs tracking-widest mb-2">
                  {primaryCategory.shortLabel ?? primaryCategory.label}
                </p>
                <h2 className="font-heading text-off-white text-2xl md:text-3xl mb-4 leading-tight">
                  {primaryCategory.label.toUpperCase()}
                </h2>
                <p className="text-foreground-muted text-base leading-relaxed mb-6">
                  {primaryCategory.explanation}
                </p>

                <h3 className="font-heading text-off-white text-lg mb-3 tracking-wide">
                  YOUR NEXT STEPS
                </h3>
                <ol className="space-y-2 mb-6">
                  {primaryCategory.nextSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-foreground-muted text-sm leading-relaxed"
                    >
                      <span className="text-coral font-heading shrink-0">
                        {idx + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>

                <Link
                  href={primaryCategory.recommendedResource.href}
                  className="inline-flex items-center text-coral hover:text-coral/80 text-sm font-heading tracking-wider transition-colors"
                >
                  {primaryCategory.recommendedResource.label} $†’
                </Link>
              </article>
            ) : null}

            {/* Ask Roadman hand-off */}
            <div className="rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/5 via-deep-purple/30 to-charcoal p-6 md:p-8 mb-6">
              <p className="font-heading text-coral text-xs tracking-widest mb-2">
                NEED MORE DETAIL?
              </p>
              <h3 className="font-heading text-off-white text-xl md:text-2xl mb-3 leading-tight">
                ASK ROADMAN TO WALK YOU THROUGH IT
              </h3>
              <p className="text-foreground-muted text-sm mb-5 leading-relaxed">
                Chat with the Roadman AI about this exact result $€” it has your
                numbers, the training methodology, and the podcast archive at
                hand.
              </p>
              <ToolAskHandoffLink
                href={askHref}
                toolSlug={result.toolSlug}
                resultSlug={result.slug}
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
              >
                Open this in Ask Roadman $†’
              </ToolAskHandoffLink>
            </div>

            {/* Paid report upsell $€” live checkout when the product is active. */}
            {paidProduct ? (
              <UpsellCard
                productSlug={paidProduct.slug}
                productName={paidProduct.name}
                priceCents={paidProduct.priceCents}
                currency={paidProduct.currency}
                description={paidProduct.description}
                toolResultSlug={result.slug}
                defaultEmail={result.email}
                utm={result.utm as Record<string, string | null> | null}
              />
            ) : null}
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
