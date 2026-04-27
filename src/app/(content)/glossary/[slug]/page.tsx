import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal, Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { getTermBySlug, getAllTermSlugs, GLOSSARY_TERMS } from "@/lib/glossary";

export function generateStaticParams() {
  return getAllTermSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const term = getTermBySlug(slug);
  if (!term) return { title: "Term Not Found" };

  return {
    title: `What Is ${term.term}? — Cycling Glossary`,
    description: term.definition,
    alternates: {
      canonical: `https://roadmancycling.com/glossary/${slug}`,
    },
  };
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const term = getTermBySlug(slug);
  if (!term) notFound();

  const relatedTerms = term.relatedTerms
    .map((s) => GLOSSARY_TERMS.find((t) => t.slug === s))
    .filter(Boolean);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          "@id": `https://roadmancycling.com/glossary/${slug}#term`,
          name: term.term,
          description: term.definition,
          url: `https://roadmancycling.com/glossary/${slug}`,
          // Reference the parent set by @id so every term resolves into
          // the same DefinedTermSet entity declared on /glossary, not a
          // duplicate string-named set per term.
          inDefinedTermSet: { "@id": "https://roadmancycling.com/glossary#termset" },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: term.term,
          description: term.definition,
          url: `https://roadmancycling.com/glossary/${slug}`,
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".answer-capsule"],
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Glossary", item: "https://roadmancycling.com/glossary" },
            { "@type": "ListItem", position: 3, name: term.term, item: `https://roadmancycling.com/glossary/${slug}` },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow">
            <ScrollReveal direction="up" eager>
              <nav className="text-xs text-foreground-subtle mb-4 uppercase tracking-widest">
                <Link href="/glossary" className="hover:text-coral">Glossary</Link>
                <span className="mx-2">/</span>
                <span className="text-off-white">{term.term}</span>
              </nav>
              <Badge pillar={term.pillar} size="md" />
              <h1
                className="font-heading text-off-white mt-4 mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {term.term.toUpperCase()}
              </h1>
              <p className="answer-capsule text-foreground-muted text-lg leading-relaxed max-w-2xl">
                {term.definition}
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="prose-roadman">
                <p className="text-foreground-muted leading-relaxed text-base">
                  {term.extendedDefinition}
                </p>
              </div>
            </ScrollReveal>

            {/* Related links */}
            <ScrollReveal direction="up" className="mt-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {term.relatedArticle && (
                  <Link href={term.relatedArticle} className="block">
                    <Card hoverable className="p-4">
                      <p className="font-heading text-coral text-xs tracking-widest mb-1">DEEP DIVE</p>
                      <p className="text-off-white text-sm">Read the full guide →</p>
                    </Card>
                  </Link>
                )}
                {term.relatedTool && (
                  <Link href={term.relatedTool} className="block">
                    <Card hoverable className="p-4">
                      <p className="font-heading text-coral text-xs tracking-widest mb-1">FREE TOOL</p>
                      <p className="text-off-white text-sm">Calculate yours →</p>
                    </Card>
                  </Link>
                )}
                {term.relatedTopicHub && (
                  <Link href={term.relatedTopicHub} className="block">
                    <Card hoverable className="p-4">
                      <p className="font-heading text-coral text-xs tracking-widest mb-1">TOPIC HUB</p>
                      <p className="text-off-white text-sm">Explore the full topic →</p>
                    </Card>
                  </Link>
                )}
              </div>
            </ScrollReveal>

            {/* Related terms */}
            {relatedTerms.length > 0 && (
              <ScrollReveal direction="up" className="mt-10">
                <p className="font-heading text-coral text-xs tracking-widest mb-4">
                  RELATED TERMS
                </p>
                <div className="flex flex-wrap gap-2">
                  {relatedTerms.map((rt) =>
                    rt ? (
                      <Link
                        key={rt.slug}
                        href={`/glossary/${rt.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-3 py-1.5 text-xs font-heading text-off-white tracking-wider transition-all"
                      >
                        {rt.term}
                      </Link>
                    ) : null
                  )}
                </div>
              </ScrollReveal>
            )}

            <div className="mt-10 text-center">
              <Link href="/glossary" className="text-coral hover:text-coral/80 text-sm font-heading tracking-widest transition-colors">
                ← BACK TO GLOSSARY
              </Link>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
