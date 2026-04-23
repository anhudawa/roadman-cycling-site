import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal, Card, Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { getTopicBySlug, getAllTopicSlugs, getTopicTitleBySlug } from "@/lib/topics";
import { queryContentGraph } from "@/lib/content-graph";

export async function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return { title: "Topic Not Found" };

  return {
    title: topic.title,
    description: topic.description,
    keywords: topic.keywords,
    alternates: {
      canonical: `https://roadmancycling.com/topics/${slug}`,
    },
    openGraph: {
      title: topic.title,
      description: topic.description,
      type: "website",
      url: `https://roadmancycling.com/topics/${slug}`,
    },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const graph = queryContentGraph({ topicSlug: slug, limit: 5 });

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: topic.title,
          description: topic.description,
          url: `https://roadmancycling.com/topics/${slug}`,
          isPartOf: {
            "@type": "WebSite",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
          hasPart: topic.posts.slice(0, 20).map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            url: `https://roadmancycling.com/blog/${post.slug}`,
          })),
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".topic-description"],
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://roadmancycling.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Topics",
              item: "https://roadmancycling.com/topics",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: topic.title,
              item: `https://roadmancycling.com/topics/${slug}`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <Badge pillar={topic.pillar} size="md" />
              <h1
                className="font-heading text-off-white mt-4 mb-4"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {topic.headline}
              </h1>
              <p className="text-foreground-muted max-w-2xl mx-auto text-lg">
                {topic.description}
              </p>
              <p className="text-foreground-subtle text-sm mt-4">
                {topic.posts.length} articles &middot; {topic.episodes.length}{" "}
                podcast episodes
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Blog Posts */}
        {topic.posts.length > 0 && (
          <Section background="charcoal">
            <Container>
              <ScrollReveal direction="up">
                <h2
                  className="font-heading text-off-white mb-8"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  ARTICLES
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topic.posts.map((post, i) => (
                  <ScrollReveal key={post.slug} direction="up" delay={i * 0.04}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block group"
                    >
                      <Card className="p-6 h-full transition-all group-hover:border-coral/30">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge pillar={post.pillar} size="sm" />
                          <span className="text-xs text-foreground-subtle">
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="font-heading text-lg text-off-white group-hover:text-coral transition-colors leading-snug mb-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-foreground-muted line-clamp-2">
                          {post.excerpt}
                        </p>
                      </Card>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Featured Tools */}
        {topic.tools.length > 0 && (
          <Section background="deep-purple" grain>
            <Container>
              <ScrollReveal direction="up" className="text-center mb-8">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  FREE TOOLS
                </p>
                <h2
                  className="font-heading text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  CALCULATORS FOR THIS TOPIC
                </h2>
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {topic.tools.map((tool, i) => (
                  <ScrollReveal key={tool.slug} direction="up" delay={i * 0.05}>
                    <Link href={tool.href} className="block h-full">
                      <Card hoverable className="h-full p-5 text-center">
                        <h3 className="font-heading text-off-white text-base mb-1">
                          {tool.title}
                        </h3>
                        <span className="text-coral text-sm">Try it free →</span>
                      </Card>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Commercial CTA */}
        <Section background="charcoal" className="section-glow-coral !py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-8 md:p-10 text-center">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  READY FOR STRUCTURE?
                </p>
                <h2
                  className="font-heading text-off-white mb-3"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  GET COACHED ON {topic.headline.split(" ").slice(0, 3).join(" ")}
                </h2>
                <p className="text-foreground-muted text-sm mb-6 max-w-md mx-auto">
                  Not Done Yet coaching builds your plan around these principles.
                  5 pillars. $195/month. 7-day free trial.
                </p>
                <Link
                  href={topic.commercialPath}
                  className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                  data-track={`topic_${topic.slug}_cta`}
                >
                  {topic.commercialPath === "/apply" ? "Apply Now" : "Learn More"} →
                </Link>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Graph-powered: Comparisons for this topic */}
        {graph.comparisons.length > 0 && (
          <Section background="charcoal">
            <Container width="narrow">
              <ScrollReveal direction="up" className="mb-6">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">MAKING A DECISION?</p>
                <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>COMPARISONS</h2>
              </ScrollReveal>
              <div className="space-y-3">
                {graph.comparisons.map((c) => (
                  <Link key={c.slug} href={`/compare/${c.slug}`} className="block group">
                    <Card className="p-5 transition-all group-hover:border-coral/30">
                      <h3 className="font-heading text-off-white text-base group-hover:text-coral transition-colors">
                        {c.optionA} vs {c.optionB}
                      </h3>
                      <p className="text-foreground-muted text-sm mt-1 line-clamp-1">{c.verdict}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Graph-powered: Glossary terms for this topic */}
        {graph.glossaryTerms.length > 0 && (
          <Section background="deep-purple" grain>
            <Container width="narrow">
              <ScrollReveal direction="up" className="mb-6">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">KEY TERMS</p>
                <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>GLOSSARY</h2>
              </ScrollReveal>
              <div className="flex flex-wrap gap-2">
                {graph.glossaryTerms.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/glossary/${t.slug}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                  >
                    {t.term}
                  </Link>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Graph-powered: Problem pages for this topic */}
        {graph.problemPages.length > 0 && (
          <Section background="charcoal">
            <Container width="narrow">
              <ScrollReveal direction="up" className="mb-6">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">STUCK?</p>
                <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>COMMON PROBLEMS</h2>
              </ScrollReveal>
              <div className="space-y-3">
                {graph.problemPages.map((p) => (
                  <Link key={p.slug} href={`/problem/${p.slug}`} className="block group">
                    <Card className="p-5 transition-all group-hover:border-coral/30">
                      <h3 className="font-heading text-off-white text-base group-hover:text-coral transition-colors">{p.title}</h3>
                    </Card>
                  </Link>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Related Topics */}
        {topic.relatedTopics.length > 0 && (
          <Section background="charcoal" className="!pt-0 !pb-14">
            <Container width="narrow" className="text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-4">
                RELATED TOPICS
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {topic.relatedTopics.map((relSlug) => {
                  const title = getTopicTitleBySlug(relSlug);
                  if (!title) return null;
                  return (
                    <Link
                      key={relSlug}
                      href={`/topics/${relSlug}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                    >
                      {title} →
                    </Link>
                  );
                })}
              </div>
            </Container>
          </Section>
        )}

        {/* Newsletter CTA */}
        <Section background="deep-purple">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <EmailCapture
                heading={
                  {
                    coaching: "GET FASTER EVERY WEEK",
                    nutrition: "EAT SMARTER, RIDE STRONGER",
                    strength: "BUILD THE ENGINE OFF THE BIKE",
                    recovery: "RECOVER LIKE A PRO",
                    community: "THE CRAFT, DELIVERED WEEKLY",
                  }[topic.pillar] || "GET THE INSIGHTS"
                }
                subheading={`The best of ${topic.title.toLowerCase()} — evidence-based, once a week. No fluff.`}
                source={`topic-${topic.slug}`}
              />
            </ScrollReveal>
          </Container>
        </Section>

        {/* Podcast Episodes */}
        {topic.episodes.length > 0 && (
          <Section background="deep-purple" grain>
            <Container>
              <ScrollReveal direction="up">
                <h2
                  className="font-heading text-off-white mb-8"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  PODCAST EPISODES
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topic.episodes.map((ep, i) => (
                  <ScrollReveal key={ep.slug} direction="up" delay={i * 0.04}>
                    <Link
                      href={`/podcast/${ep.slug}`}
                      className="block group"
                    >
                      <Card className="p-5 h-full transition-all group-hover:border-coral/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-foreground-subtle">
                            {ep.duration}
                          </span>
                        </div>
                        <h3 className="font-heading text-sm text-off-white group-hover:text-coral transition-colors leading-snug mb-1">
                          {ep.title}
                        </h3>
                        {ep.guest && (
                          <p className="text-xs text-foreground-subtle">
                            with {ep.guest}
                          </p>
                        )}
                      </Card>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* CTA — coaching hub gets a coaching-specific funnel */}
        {topic.slug === "cycling-coaching" ? (
          <Section background="charcoal">
            <Container className="text-center">
              <ScrollReveal direction="up">
                <div className="bg-deep-purple/30 rounded-xl border border-purple/20 p-10">
                  <h2 className="font-heading text-2xl text-off-white mb-3">
                    READY FOR A REAL COACH?
                  </h2>
                  <p className="text-foreground-muted max-w-lg mx-auto mb-6">
                    The Not Done Yet coaching community is 1:1 personalised
                    cycling coaching — training, nutrition, strength, recovery,
                    and accountability. $195/month with a 7-day free trial.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                    <Button href="/apply">Apply Now — 7-Day Free Trial</Button>
                    <Button href="/coaching" variant="ghost">
                      See All Coaching Options
                    </Button>
                  </div>
                  <p className="text-foreground-subtle text-xs mb-3 tracking-wider font-heading">
                    OR COACHING BY REGION
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { href: "/coaching/ireland", label: "IRELAND" },
                      { href: "/coaching/uk", label: "UK" },
                      { href: "/coaching/usa", label: "USA" },
                      { href: "/coaching/dublin", label: "DUBLIN" },
                      { href: "/coaching/london", label: "LONDON" },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="px-3 py-1.5 rounded-md bg-white/5 text-foreground-subtle hover:bg-white/10 hover:text-off-white transition-colors font-heading text-xs tracking-wider"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </Container>
          </Section>
        ) : (
          <Section background="charcoal">
            <Container className="text-center">
              <ScrollReveal direction="up">
                <div className="bg-deep-purple/30 rounded-xl border border-purple/20 p-10">
                  <h2 className="font-heading text-2xl text-off-white mb-3">
                    GO DEEPER
                  </h2>
                  <p className="text-foreground-muted max-w-lg mx-auto mb-6">
                    The podcast conversations go further than any article can.
                    Join the Clubhouse to discuss these topics with Anthony and
                    serious cyclists.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button href="/community/clubhouse">
                      Join the Clubhouse — Free
                    </Button>
                    <Button href="/topics" variant="ghost">
                      Browse All Topics
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            </Container>
          </Section>
        )}
      </main>

      <Footer />
    </>
  );
}
