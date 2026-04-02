import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, Badge } from "@/components/ui";
import { getAllPosts } from "@/lib/blog";
import { type ContentPillar, CONTENT_PILLARS } from "@/types";

export const metadata: Metadata = {
  title: "Blog — Cycling Training, Nutrition & Performance",
  description:
    "Expert cycling content grounded in science. Training methodology, nutrition, strength & conditioning, recovery, and cycling culture — from the conversations with the world's best.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ pillar?: string }>;
}) {
  const { pillar: pillarFilter } = await searchParams;
  const allPosts = getAllPosts();
  const posts = pillarFilter
    ? allPosts.filter((p) => p.pillar === pillarFilter)
    : allPosts;

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              THE KNOWLEDGE
            </h1>
            <p className="text-foreground-muted max-w-xl mx-auto text-lg">
              Expert cycling content grounded in science and real conversations
              with the world&apos;s best coaches, scientists, and riders.
            </p>
          </Container>
        </Section>

        {/* Pillar Filter */}
        <Section background="charcoal" className="!py-6 border-b border-white/5">
          <Container>
            <div className="flex flex-wrap gap-2 justify-center">
              <a
                href="/blog"
                className={`px-4 py-2 rounded-full text-sm font-body transition-colors ${
                  !pillarFilter
                    ? "bg-coral text-off-white"
                    : "bg-white/5 text-foreground-muted hover:bg-white/10"
                }`}
              >
                All
              </a>
              {(Object.keys(CONTENT_PILLARS) as ContentPillar[]).map((key) => (
                <a
                  key={key}
                  href={`/blog?pillar=${key}`}
                  className={`px-4 py-2 rounded-full text-sm font-body transition-colors ${
                    pillarFilter === key
                      ? "bg-coral text-off-white"
                      : "bg-white/5 text-foreground-muted hover:bg-white/10"
                  }`}
                >
                  {CONTENT_PILLARS[key].label}
                </a>
              ))}
            </div>
          </Container>
        </Section>

        {/* Posts Grid */}
        <Section background="charcoal">
          <Container>
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-foreground-muted text-lg">
                  No posts yet{pillarFilter ? ` in ${CONTENT_PILLARS[pillarFilter as ContentPillar]?.label}` : ""}. Check back soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Card
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group"
                  >
                    {/* Image placeholder */}
                    <div className="aspect-[16/9] bg-gradient-to-br from-deep-purple to-charcoal" />

                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge pillar={post.pillar} />
                        <span className="text-xs text-foreground-subtle">
                          {post.readTime}
                        </span>
                      </div>

                      <h2 className="font-heading text-xl text-off-white mb-2 group-hover:text-coral transition-colors leading-tight">
                        {post.title.toUpperCase()}
                      </h2>

                      <p className="text-sm text-foreground-muted leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-foreground-subtle">
                          {new Date(post.publishDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="text-coral text-sm font-body font-medium">
                          Read &rarr;
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
