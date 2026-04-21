import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllPosts } from "@/lib/blog";
import { BlogSearch } from "@/components/features/blog/BlogSearch";

export const metadata: Metadata = {
  title: "Blog — Training, Nutrition & Performance",
  description:
    "Expert cycling content grounded in science. Training methodology, nutrition, strength & conditioning, recovery, and cycling culture — from the conversations with the world's best.",
  alternates: {
    canonical: "https://roadmancycling.com/blog",
  },
  openGraph: {
    title: "Blog — Training, Nutrition & Performance",
    description:
      "Expert cycling content grounded in science. Training methodology, nutrition, strength & conditioning, recovery, and cycling culture — from the conversations with the world's best.",
    type: "website",
    url: "https://roadmancycling.com/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Roadman Cycling Blog",
          description:
            "Expert cycling content grounded in science. Training methodology, nutrition, strength & conditioning, recovery, and cycling culture.",
          url: "https://roadmancycling.com/blog",
          numberOfItems: posts.length,
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
          "@type": "ItemList",
          name: "Latest Cycling Articles",
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: Math.min(posts.length, 20),
          itemListElement: posts.slice(0, 20).map((post, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://roadmancycling.com/blog/${post.slug}`,
            name: post.title,
          })),
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
              name: "Blog",
              item: "https://roadmancycling.com/blog",
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
              <h1
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-hero)" }}
              >
                THE KNOWLEDGE
              </h1>
              <p className="text-foreground-muted max-w-xl mx-auto text-lg">
                Evidence-based cycling content — grounded in real conversations
                with the world&apos;s best coaches, scientists, and riders.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Search + Posts (Client Component) */}
        <Section background="charcoal">
          <Container>
            <BlogSearch posts={posts} />
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
