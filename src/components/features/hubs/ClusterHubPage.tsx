import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal, Card, Badge } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ShortAnswer } from "@/components/features/aeo/ShortAnswer";
import { SourceMethodology } from "@/components/features/aeo/SourceMethodology";
import { AskRoadmanCTA } from "@/components/features/aeo/AskRoadmanCTA";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { mdxComponents } from "@/components/mdx/MDXComponents";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import {
  resolveClusterHub,
  type ClusterHubDef,
  type ResolvedClusterHub,
} from "@/lib/cluster-hubs";

const SKOOL_URL = "https://www.skool.com/roadmancycling";

/** Static <Metadata> for a hub route. Each page re-exports this. */
export function hubMetadata(def: ClusterHubDef): Metadata {
  const url = `${SITE_ORIGIN}${def.path}`;
  return {
    title: def.metaTitle,
    description: def.description,
    keywords: def.keywords,
    alternates: { canonical: def.path },
    openGraph: {
      title: def.metaTitle,
      description: def.description,
      type: "website",
      url,
    },
  };
}

function HubJsonLd({ hub }: { hub: ResolvedClusterHub }) {
  const url = `${SITE_ORIGIN}${hub.path}`;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${url}#hub`,
              name: hub.metaTitle,
              description: hub.description,
              url,
              isPartOf: { "@id": ENTITY_IDS.website },
              mainEntity: { "@id": `${url}#thing` },
              about: { "@id": `${url}#thing` },
              ...(hub.lastReviewed && { dateModified: hub.lastReviewed }),
              ...(hub.reviewedBy && {
                reviewedBy:
                  hub.reviewedBy === "Anthony Walsh"
                    ? { "@id": ENTITY_IDS.person }
                    : { "@type": "Person", name: hub.reviewedBy },
              }),
              ...(hub.research && hub.research.length > 0 && {
                citation: hub.research.map((source) => ({
                  "@type": "ScholarlyArticle",
                  name: source.title,
                  url: source.href,
                })),
              }),
              hasPart: hub.articles.map((a) => ({
                "@type": "BlogPosting",
                "@id": `${SITE_ORIGIN}/blog/${a.slug}#article`,
                name: a.title,
                url: `${SITE_ORIGIN}/blog/${a.slug}`,
              })),
              speakable: {
                "@type": "SpeakableSpecification",
                cssSelector: ["h1", ".short-answer"],
              },
            },
            {
              "@type": "Thing",
              "@id": `${url}#thing`,
              name: hub.metaTitle,
              description: hub.description,
              url,
              sameAs: url,
            },
            // The experts behind the hub's positions, exposed as Person
            // nodes the CollectionPage mentions — an E-E-A-T signal that
            // names the authorities the aggregation is grounded in.
            {
              "@type": "ItemList",
              "@id": `${url}#articles`,
              name: `Articles in ${hub.metaTitle}`,
              itemListElement: hub.articles.map((a, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE_ORIGIN}/blog/${a.slug}`,
                name: a.title,
              })),
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            {
              "@type": "ListItem",
              position: 2,
              name: hub.parent.label,
              item: `${SITE_ORIGIN}${hub.parent.href}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: hub.metaTitle,
              item: url,
            },
          ],
        }}
      />
      {hub.faqs.length > 0 && <FAQSchema faqs={hub.faqs} />}
    </>
  );
}

export function ClusterHubPage({ def }: { def: ClusterHubDef }) {
  const hub = resolveClusterHub(def);
  const newArticles = hub.articles.filter((a) => a.isNew);

  return (
    <>
      <HubJsonLd hub={hub} />
      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-24 md:pt-32 pb-10 md:pb-12">
          <Container>
            <Breadcrumbs
              items={[
                { label: hub.parent.label, href: hub.parent.href },
                { label: hub.headline },
              ]}
            />
          </Container>
          <Container className="text-center">
            <ScrollReveal direction="up">
              <Badge pillar={hub.pillar} size="md" />
              <h1
                className="font-heading text-off-white mt-4 mb-4"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {hub.headline}
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-foreground-muted">
                {hub.description}
              </p>
              <p className="text-foreground-subtle text-sm mt-4">
                {hub.articles.length} in-depth articles &middot;{" "}
                {hub.experts.length} named experts
              </p>
            </ScrollReveal>
          </Container>
          <Container width="narrow" className="mt-8">
            <ScrollReveal direction="up">
              <ShortAnswer
                text={hub.shortAnswer}
                pillar={hub.pillar}
                heading="THE SHORT ANSWER"
              />
            </ScrollReveal>
          </Container>
        </Section>

        {/* Experts in this hub — E-E-A-T attribution strip */}
        <Section background="charcoal" className="!pt-12 !pb-2">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-xs tracking-widest mb-4">
                THE EXPERTS BEHIND THIS HUB
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hub.experts.map((e) => (
                  <div
                    key={e.name}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <p className="font-heading text-off-white text-base leading-tight">
                      {e.name}
                    </p>
                    <p className="text-foreground-subtle text-sm mt-0.5">
                      {e.credential}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Connective hub prose */}
        <Section background="charcoal" className="!pt-10 !pb-14">
          <Container width="narrow">
            <article className="prose-roadman prose-roadman--pillar">
              <MDXRemote
                source={hub.pillarContent}
                components={mdxComponents}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              />
            </article>
          </Container>
        </Section>

        {/* New gap articles — surfaced first, labelled NEW */}
        {newArticles.length > 0 && (
          <Section background="deep-purple" grain>
            <Container>
              <ScrollReveal direction="up" className="mb-8">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  NEW IN THIS HUB
                </p>
                <h2
                  className="font-heading text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  FRESH RESEARCH
                </h2>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newArticles.map((a, i) => (
                  <ScrollReveal key={a.slug} direction="up" delay={i * 0.05}>
                    <Link href={`/blog/${a.slug}`} className="block group">
                      <Card className="p-6 h-full transition-all group-hover:border-coral/40 border-coral/20">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-heading text-xs tracking-widest text-coral border border-coral/40 rounded px-2 py-0.5">
                            NEW
                          </span>
                          <span className="text-xs text-foreground-subtle">
                            {a.readTime}
                          </span>
                        </div>
                        <h3 className="font-heading text-lg text-off-white group-hover:text-coral transition-colors leading-snug mb-2">
                          {a.title}
                        </h3>
                        <p className="text-sm text-foreground-muted line-clamp-4">
                          {a.excerpt}
                        </p>
                      </Card>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Full article grid */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-8"
                style={{ fontSize: "var(--text-section)" }}
              >
                EVERY ARTICLE IN THIS CLUSTER
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hub.articles.map((a, i) => (
                <ScrollReveal key={a.slug} direction="up" delay={i * 0.04}>
                  <Link href={`/blog/${a.slug}`} className="block group">
                    <Card className="p-6 h-full transition-all group-hover:border-coral/30">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge pillar={a.pillar} size="sm" />
                        {a.isNew && (
                          <span className="font-heading text-xs tracking-widest text-coral">
                            NEW
                          </span>
                        )}
                        <span className="text-xs text-foreground-subtle">
                          {a.readTime}
                        </span>
                      </div>
                      <h3 className="font-heading text-lg text-off-white group-hover:text-coral transition-colors leading-snug mb-2">
                        {a.title}
                      </h3>
                      <p className="text-sm text-foreground-muted line-clamp-4">
                        {a.excerpt}
                      </p>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Commercial CTA — Skool community */}
        <Section background="charcoal" className="section-glow-coral !py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-8 md:p-10 text-center">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  NOT DONE YET
                </p>
                <h2
                  className="font-heading text-off-white mb-3"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  {hub.ctaHeadline}
                </h2>
                <p className="text-foreground-muted text-sm mb-6 max-w-md mx-auto">
                  {hub.ctaSubhead}
                </p>
                <a
                  href={SKOOL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                  data-track={`hub_${hub.id}_cta`}
                >
                  Join the Community →
                </a>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Related hubs */}
        {hub.relatedHubs.length > 0 && (
          <Section background="deep-purple" grain className="!py-12">
            <Container width="narrow" className="text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-4">
                RELATED HUBS
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {hub.relatedHubs.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                  >
                    {r.label} →
                  </Link>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Newsletter capture */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <EmailCapture
                heading={
                  hub.pillar === "nutrition"
                    ? "EAT SMARTER, RIDE STRONGER"
                    : "GET FASTER EVERY WEEK"
                }
                subheading={`The best of ${hub.metaTitle.toLowerCase()} — evidence-based, once a week. No fluff.`}
                source={`hub-${hub.id}`}
              />
            </ScrollReveal>
          </Container>
        </Section>

        {/* Source + methodology + Ask handoff */}
        <Section background="deep-purple" grain className="!py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <SourceMethodology
                experts={hub.experts.map((e) => ({
                  name: e.name,
                  role: e.credential,
                }))}
                articles={hub.articles.slice(0, 3).map((a) => ({
                  title: a.title,
                  href: `/blog/${a.slug}`,
                }))}
                research={hub.research?.map((source) => ({
                  title: `${source.title} — ${source.scope}`,
                  href: source.href,
                }))}
                methodology={
                  hub.methodology ??
                  `This hub aggregates Roadman Cycling's written guides and podcast conversations into a single position on ${hub.metaTitle.toLowerCase()}. Every recommendation traces back to a named expert on the show or the published research they cite — not generic fitness content.`
                }
                reviewedBy={hub.reviewedBy}
                lastReviewed={hub.lastReviewed}
              />
              <AskRoadmanCTA
                topic={hub.metaTitle}
                question={`I'm trying to get my head around ${hub.headline.toLowerCase()}. Where should I start, given my situation?`}
                source={`hub-${hub.id}`}
                heading="WANT THIS APPLIED TO YOU?"
              />
            </ScrollReveal>
          </Container>
        </Section>

        {/* FAQ */}
        {hub.faqs.length > 0 && (
          <Section background="charcoal">
            <Container width="narrow">
              <ScrollReveal direction="up" className="text-center mb-12">
                <p className="text-coral font-heading text-xs tracking-widest mb-3">
                  COMMON QUESTIONS
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  FREQUENTLY ASKED
                </h2>
              </ScrollReveal>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {hub.faqs.map((f) => (
                  <details key={f.question} className="group py-5">
                    <summary className="cursor-pointer flex items-center justify-between gap-4 font-heading tracking-wide uppercase text-off-white text-base md:text-lg list-none">
                      <span>{f.question}</span>
                      <span className="text-coral transition-transform group-open:rotate-45 shrink-0">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-foreground-muted leading-relaxed">
                      {f.answer}
                    </p>
                  </details>
                ))}
              </div>
            </Container>
          </Section>
        )}
      </main>

      <Footer />
    </>
  );
}
