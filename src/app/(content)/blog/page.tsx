import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { getAllPosts } from "@/lib/blog";
import { BlogSearch } from "@/components/features/blog/BlogSearch";

export const metadata: Metadata = {
  title: "Blog — Cycling Training, Nutrition & Performance",
  description:
    "Expert cycling content grounded in science. Training methodology, nutrition, strength & conditioning, recovery, and cycling culture — from the conversations with the world's best.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <Header />
      <main>
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
                {posts.length} articles grounded in science and real
                conversations with the world&apos;s best coaches, scientists,
                and riders.
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
