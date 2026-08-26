import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { SkoolTrialButton } from "@/components/features/community/SkoolTrialButton";
import { mdxComponents } from "@/components/mdx/MDXComponents";
import { SITE_ORIGIN } from "@/lib/brand-facts";
import { SKOOL_URL } from "@/components/features/tour";
import {
  TOUR_HISTORY,
  getHistoryArticle,
  getAllHistorySlugs,
} from "@/data/tour-history";

export function generateStaticParams() {
  return getAllHistorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getHistoryArticle(slug);
  if (!article) return { title: "Article Not Found" };

  const url = `${SITE_ORIGIN}/tour-de-france/history/${slug}`;
  const description = article.seoDescription ?? article.dek;
  return {
    title: article.seoTitle ?? `${article.title} — Tour de France History`,
    description: description.slice(0, 200),
    alternates: { canonical: url },
    openGraph: {
      title: article.seoTitle ?? article.title,
      description: description.slice(0, 200),
      type: "article",
      url,
      publishedTime: article.published,
      modifiedTime: article.updated ?? article.published,
      images: ["/og-image.jpg"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function TourHistoryArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getHistoryArticle(slug);
  if (!article) notFound();

  const url = `${SITE_ORIGIN}/tour-de-france/history/${slug}`;
  const personId = article.person ? `${url}#person` : undefined;
  const more = TOUR_HISTORY.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.dek,
          datePublished: article.published,
          dateModified: article.updated ?? article.published,
          url,
          mainEntityOfPage: url,
          author: { "@id": `${SITE_ORIGIN}/author/anthony-walsh#person` },
          reviewedBy: { "@id": `${SITE_ORIGIN}/#organization` },
          publisher: { "@id": `${SITE_ORIGIN}/#organization` },
          image: `${SITE_ORIGIN}/og-image.jpg`,
          inLanguage: "en",
          isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
          ...(personId && { about: { "@id": personId } }),
          ...(article.sources && { citation: article.sources.map((source) => source.url) }),
        }}
      />
      {article.person && personId && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            "@id": personId,
            name: article.person.name,
            alternateName: article.person.alternateName,
            description: article.person.description,
            birthDate: article.person.birthDate,
            birthPlace: article.person.birthPlace
              ? { "@type": "Place", name: article.person.birthPlace }
              : undefined,
            nationality: article.person.nationality
              ? { "@type": "Country", name: article.person.nationality }
              : undefined,
            url,
            mainEntityOfPage: url,
            sameAs: article.person.sameAs,
          }}
        />
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: "Tour de France 2026", item: `${SITE_ORIGIN}/tour-de-france` },
            { "@type": "ListItem", position: 3, name: "History", item: `${SITE_ORIGIN}/tour-de-france/history` },
            { "@type": "ListItem", position: 4, name: article.title, item: url },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-28 sm:pt-32 pb-12">
          <Container width="narrow">
            <Breadcrumbs
              items={[
                { label: "Tour de France 2026", href: "/tour-de-france" },
                { label: "History", href: "/tour-de-france/history" },
                { label: article.title },
              ]}
            />
            <ScrollReveal direction="up">
              <p className="font-heading text-jersey-yellow text-xs sm:text-sm tracking-[0.3em] mb-4">
                {article.eyebrow} · {article.tag.toUpperCase()} · {article.readMinutes} MIN READ
              </p>
              <h1
                className="font-heading text-off-white leading-[0.95] mb-5"
                style={{ fontSize: "var(--text-section)" }}
              >
                {article.title}
              </h1>
              <p className="text-off-white text-lg leading-relaxed">{article.dek}</p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Body */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            {article.quickFacts && article.quickFacts.length > 0 && (
              <aside
                className="mb-10 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
                aria-labelledby="quick-facts-heading"
              >
                <h2
                  id="quick-facts-heading"
                  className="font-heading text-jersey-yellow text-sm tracking-[0.2em] mb-5"
                >
                  QUICK FACTS
                </h2>
                <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {article.quickFacts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="text-xs uppercase tracking-wider text-foreground-subtle mb-1">
                        {fact.label}
                      </dt>
                      <dd className="text-sm leading-relaxed text-off-white">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </aside>
            )}
            <article className="prose-roadman prose-enhanced">
              <MDXRemote source={article.body} components={mdxComponents} />
            </article>

            {article.sources && article.sources.length > 0 && (
              <aside
                className="mt-10 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
                aria-labelledby="sources-heading"
              >
                <h2
                  id="sources-heading"
                  className="font-heading text-jersey-yellow text-sm tracking-[0.2em] mb-2"
                >
                  SOURCES &amp; VERIFICATION
                </h2>
                <p className="text-sm leading-relaxed text-foreground-muted mb-5">
                  Career facts were checked against the official records of the Tour de
                  France, Giro d&apos;Italia, La Vuelta and UCI. Interpretive passages are
                  labelled as analysis rather than race-record fact.
                </p>
                <ol className="space-y-4">
                  {article.sources.map((source, index) => (
                    <li key={source.url} className="text-sm leading-relaxed">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-off-white hover:text-jersey-yellow transition-colors underline decoration-white/20 underline-offset-4"
                      >
                        {index + 1}. {source.name}
                      </a>
                      <span className="block text-foreground-subtle mt-1">
                        Verifies: {source.scope}.
                      </span>
                    </li>
                  ))}
                </ol>
              </aside>
            )}

            {(article.lastReviewed || article.reviewedBy) && (
              <EvidenceBlock
                lastReviewed={article.lastReviewed}
                reviewedBy={article.reviewedBy}
              />
            )}
          </Container>
        </Section>

        {/* Related content */}
        {article.related.length > 0 && (
          <Section background="charcoal" className="!py-10 border-t border-white/5">
            <Container width="narrow">
              <h2 className="font-heading text-off-white text-xl tracking-wide mb-5">
                TRAIN ON IT
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {article.related.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/8 hover:border-jersey-yellow/40 bg-background-elevated p-4 transition-all"
                  >
                    <span className="font-heading text-off-white group-hover:text-jersey-yellow transition-colors tracking-wide">
                      {r.label}
                    </span>
                    <span className="text-jersey-yellow shrink-0">→</span>
                  </Link>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* CTA */}
        <Section background="deep-purple" grain className="!py-12 border-y border-white/5">
          <Container className="text-center">
            <h2 className="font-heading text-off-white text-2xl sm:text-3xl tracking-wide mb-3">
              TRAIN LIKE IT MATTERS
            </h2>
            <p className="text-foreground-muted max-w-lg mx-auto mb-6">
              The history is the inspiration. The coaching is the system. Bring the
              same principles to your own riding inside the Roadman community.
            </p>
            <SkoolTrialButton
              href={SKOOL_URL}
              source={`tour-history-${slug}`}
              size="lg"
              className="!bg-jersey-yellow !text-charcoal hover:!bg-jersey-yellow-deep !shadow-none"
            >
              Join the Community Free
            </SkoolTrialButton>
          </Container>
        </Section>

        {/* More history */}
        <Section background="charcoal" className="!py-12">
          <Container>
            <h2 className="font-heading text-off-white text-2xl tracking-wide mb-6">
              MORE FROM TOUR HISTORY
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {more.map((a) => (
                <Link
                  key={a.slug}
                  href={`/tour-de-france/history/${a.slug}`}
                  className="group block rounded-xl border border-white/8 hover:border-jersey-yellow/40 bg-background-elevated p-5 transition-all"
                >
                  <p className="font-heading text-jersey-yellow text-[10px] tracking-[0.25em] mb-2">
                    {a.tag.toUpperCase()}
                  </p>
                  <p className="font-heading text-off-white text-lg leading-tight group-hover:text-jersey-yellow transition-colors">
                    {a.title}
                  </p>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button href="/tour-de-france/history" variant="ghost">
                All Tour History →
              </Button>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
