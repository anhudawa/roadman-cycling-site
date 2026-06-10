import Link from "next/link";
import { Container, Section } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import type { ProductRecommendation as Recommendation } from "@/lib/diagnostic/product-routing";

/**
 * The segmented post-diagnostic recommendation. Renders a single card for
 * the one product this rider's result funnels toward — Method, Not Done
 * Yet, or the Inner Circle. The lead line is personalised to their own
 * diagnosis; the rest is the product's price, what's included, one social-
 * proof line, and a single CTA.
 */
export function ProductRecommendation({
  rec,
  profile,
}: {
  rec: Recommendation;
  profile: string;
}) {
  const { product, callout } = rec;

  return (
    <Section background="charcoal">
      <Container width="narrow">
        <ScrollReveal direction="up">
          <p className="text-coral font-heading text-xs tracking-widest mb-3">
            {product.eyebrow}
          </p>
          <h2 className="font-heading text-off-white text-2xl md:text-3xl mb-4">
            {product.name.toUpperCase()}
          </h2>
          <p className="text-off-white/90 leading-relaxed mb-8">{callout}</p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <div className="rounded-xl border border-coral/30 bg-coral/5 p-6 md:p-8 mb-8">
            <p className="font-heading text-off-white text-3xl md:text-4xl">
              {product.price}
              <span className="text-foreground-muted text-lg font-normal">
                {" "}
                {product.priceUnit}
              </span>
            </p>
            <p className="mt-2 text-off-white/80 text-sm">{product.blurb}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2}>
          <p className="font-heading text-off-white text-lg mb-4 tracking-wide">
            WHAT&rsquo;S IN IT
          </p>
          <ul className="space-y-3 text-off-white/90 leading-relaxed mb-8">
            {product.includes.map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="text-coral font-heading shrink-0 mt-0.5"
                >
                  →
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.3}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-white/10 bg-background-elevated p-6">
            <p className="text-foreground-muted text-sm leading-relaxed sm:max-w-md">
              {product.socialProof}
            </p>
            <RecommendationCta product={product} profile={profile} />
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}

/**
 * Single CTA button. Internal destinations use next/link; the off-site
 * Skool community opens in a new tab. Both carry `data-cta`/`data-product`
 * so the existing results-page click delegate attributes the conversion.
 */
function RecommendationCta({
  product,
  profile,
}: {
  product: Recommendation["product"];
  profile: string;
}) {
  const className =
    "shrink-0 font-heading tracking-wider bg-coral hover:bg-coral-hover text-off-white px-6 py-3 rounded-md transition-colors cursor-pointer text-sm md:text-base whitespace-nowrap text-center";
  const label = product.ctaLabel.toUpperCase();

  if (product.external) {
    return (
      <a
        href={product.href}
        target="_blank"
        rel="noopener noreferrer"
        data-cta={product.ctaTag}
        data-product={product.path}
        data-profile={profile}
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      href={product.href}
      data-cta={product.ctaTag}
      data-product={product.path}
      data-profile={profile}
      className={className}
    >
      {label}
    </Link>
  );
}
