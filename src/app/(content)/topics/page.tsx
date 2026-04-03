import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal, Card, Badge } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllTopics } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Cycling Topics — In-Depth Guides & Resources",
  description:
    "Browse cycling topics: FTP training, nutrition, training plans, recovery, strength & conditioning, weight loss, and beginner guides. Curated expert content from the podcast.",
  alternates: {
    canonical: "https://roadmancycling.com/topics",
  },
};

export default function TopicsPage() {
  const topics = getAllTopics();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Cycling Topics",
          description:
            "In-depth cycling topic hubs covering training, nutrition, recovery, and more",
          url: "https://roadmancycling.com/topics",
        }}
      />

      <Header />

      <main>
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <h1
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-hero)" }}
              >
                DEEP DIVES
              </h1>
              <p className="text-foreground-muted max-w-xl mx-auto text-lg">
                Curated topic hubs bringing together blog posts, podcast
                episodes, and tools on the subjects that matter most.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {topics.map((topic, i) => (
                <ScrollReveal
                  key={topic.slug}
                  direction="up"
                  delay={i * 0.05}
                >
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="block group"
                  >
                    <Card className="p-8 h-full transition-all group-hover:border-coral/30">
                      <div className="flex items-start justify-between mb-3">
                        <Badge pillar={topic.pillar} size="md" />
                        <span className="text-xs text-foreground-subtle font-heading">
                          {topic.posts.length} ARTICLES &middot;{" "}
                          {topic.episodes.length} EPISODES
                        </span>
                      </div>
                      <h2 className="font-heading text-2xl text-off-white group-hover:text-coral transition-colors mb-3">
                        {topic.title.toUpperCase()}
                      </h2>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {topic.description}
                      </p>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
