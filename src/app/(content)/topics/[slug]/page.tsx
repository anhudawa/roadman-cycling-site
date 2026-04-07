import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal, Card, Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { getTopicBySlug, getAllTopicSlugs } from "@/lib/topics";

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
    title: `${topic.title} — Roadman Cycling`,
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
                    "le-metier": "THE CRAFT, DELIVERED WEEKLY",
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

        {/* CTA */}
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
      </main>

      <Footer />
    </>
  );
}
