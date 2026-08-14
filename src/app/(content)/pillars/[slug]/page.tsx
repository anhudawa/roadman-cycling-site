import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal, Card, Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { getPillarBySlug, getAllPillarSlugs } from "@/lib/pillars";
import { mdxComponents } from "@/components/mdx/MDXComponents";

export async function generateStaticParams() {
  return getAllPillarSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pillar = getPillarBySlug(slug);
  if (!pillar) return { title: "Pillar Not Found" };

  return {
    title: pillar.seoTitle,
    description: pillar.seoDescription,
    keywords: pillar.keywords,
    alternates: {
      canonical: `${SITE_ORIGIN}/pillars/${slug}`,
    },
    openGraph: {
      title: pillar.seoTitle,
      description: pillar.seoDescription,
      type: "website",
      url: `${SITE_ORIGIN}/pillars/${slug}`,
    },
  };
}

const PILLAR_EMAIL_HEADINGS: Record<string, string> = {
  coaching: "GET FASTER EVERY WEEK",
  nutrition: "EAT SMARTER, RIDE STRONGER",
  strength: "BUILD THE ENGINE OFF THE BIKE",
  recovery: "RECOVER LIKE A PRO",
  community: "THE CRAFT, DELIVERED WEEKLY",
};

export default async function PillarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pillar = getPillarBySlug(slug);

  if (!pillar) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${SITE_ORIGIN}/pillars/${slug}#pillar`,
              name: pillar.title,
              description: pillar.description,
              url: `${SITE_ORIGIN}/pillars/${slug}`,
              isPartOf: { "@id": ENTITY_IDS.website },
              mainEntity: {
                "@type": "Thing",
                "@id": `${SITE_ORIGIN}/pillars/${slug}#thing`,
                name: pillar.title,
                description: pillar.description,
              },
              hasPart: pillar.featuredPosts.slice(0, 10).map((post) => ({
                "@type": "BlogPosting",
                "@id": `${SITE_ORIGIN}/blog/${post.slug}#article`,
                name: post.title,
                url: `${SITE_ORIGIN}/blog/${post.slug}`,
              })),
              speakable: {
                "@type": "SpeakableSpecification",
                cssSelector: ["h1", ".pillar-description"],
              },
            },
          ],
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
              item: SITE_ORIGIN,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: pillar.title,
              item: `${SITE_ORIGIN}/pillars/${slug}`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container>
            <Breadcrumbs items={[{ label: pillar.title }]} />
          </Container>
          <Container className="text-center">
            <ScrollReveal direction="up">
              <Badge pillar={pillar.pillar} size="md" />
              <h1
                className="font-heading text-off-white mt-4 mb-4"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {pillar.headline}
              </h1>
              <p className="pillar-description text-foreground-muted max-w-2xl mx-auto text-lg">
                {pillar.description}
              </p>
              <p className="text-foreground-subtle text-sm mt-4">
                {pillar.posts.length} articles in this pillar
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Pillar prose — the MDX content */}
        <Section background="charcoal" className="!pt-14 !pb-14">
          <Container width="narrow">
            <article className="prose-roadman prose-roadman--pillar">
              <MDXRemote
                source={pillar.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                  },
                }}
              />
            </article>
          </Container>
        </Section>

        {/* Start Here — featured posts */}
        {pillar.featuredPosts.length > 0 && (
          <Section background="deep-purple" grain>
            <Container>
              <ScrollReveal direction="up" className="text-center mb-10">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  NEW HERE?
                </p>
                <h2
                  className="font-heading text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  START HERE
                </h2>
                <p className="text-foreground-muted mt-2 max-w-lg mx-auto">
                  The articles serious cyclists wish they&apos;d found first. Read
                  these before anything else.
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {pillar.featuredPosts.map((post, i) => (
                  <ScrollReveal key={post.slug} direction="up" delay={i * 0.05}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block group h-full"
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
                        <p className="text-sm text-foreground-muted line-clamp-3">
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

        {/* Community CTA */}
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
                  YOU&apos;RE NOT DONE YET
                </h2>
                <p className="text-foreground-muted text-sm mb-6 max-w-md mx-auto">
                  The Not Done Yet community is where serious cyclists get
                  structured coaching, weekly live calls with Anthony, and
                  access to the expert network behind the podcast.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    href="https://www.skool.com/roadmancycling"
                    variant="primary"
                  >
                    Join the Community
                  </Button>
                  <Button href="/start-here" variant="ghost">
                    Explore Free Content
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* All articles for this pillar */}
        {pillar.posts.length > 0 && (
          <Section background="charcoal">
            <Container>
              <ScrollReveal direction="up">
                <h2
                  className="font-heading text-off-white mb-8"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  ALL {pillar.headline.split("—")[0].trim()} ARTICLES
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pillar.posts.map((post, i) => (
                  <ScrollReveal key={post.slug} direction="up" delay={i * 0.03}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block group h-full"
                    >
                      <Card className="p-5 h-full transition-all group-hover:border-coral/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge pillar={post.pillar} size="sm" />
                          <span className="text-xs text-foreground-subtle">
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="font-heading text-sm text-off-white group-hover:text-coral transition-colors leading-snug">
                          {post.title}
                        </h3>
                      </Card>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Newsletter */}
        <Section background="deep-purple">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <EmailCapture
                heading={PILLAR_EMAIL_HEADINGS[pillar.pillar] || "GET THE INSIGHTS"}
                subheading={`The best of ${pillar.title.toLowerCase()} — evidence-based, once a week. No fluff.`}
                source={`pillar-${slug}`}
              />
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
