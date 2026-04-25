import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal, Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProblemBySlug, getAllProblemSlugs } from "@/lib/problems";

export function generateStaticParams() {
  return getAllProblemSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getProblemBySlug(slug);
  if (!page) return { title: "Not Found" };

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `https://roadmancycling.com/problem/${slug}` },
  };
}

export default async function ProblemPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getProblemBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.title,
          description: page.seoDescription,
          url: `https://roadmancycling.com/problem/${slug}`,
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".problem-description"],
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: page.title, item: `https://roadmancycling.com/problem/${slug}` },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow">
            <ScrollReveal direction="up" eager>
              <Badge pillar={page.pillar} size="md" />
              <h1
                className="font-heading text-off-white mt-4 mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {page.title.toUpperCase()}
              </h1>
              <p className="problem-description text-foreground-muted text-lg leading-relaxed max-w-2xl">
                {page.problem}
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8">
              <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>
                WHY THIS HAPPENS
              </h2>
            </ScrollReveal>
            <div className="space-y-3">
              {page.causes.map((cause, i) => (
                <ScrollReveal key={cause} direction="up" delay={i * 0.04}>
                  <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <span className="text-coral mt-0.5 shrink-0">&#10007;</span>
                    <p className="text-foreground-muted text-sm leading-relaxed">{cause}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8">
              <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>
                WHAT TO DO ABOUT IT
              </h2>
            </ScrollReveal>
            <div className="space-y-4">
              {page.solutions.map((sol, i) => (
                <ScrollReveal key={sol.title} direction="up" delay={i * 0.05}>
                  <Link href={sol.href} className="block group">
                    <Card className="p-6 transition-all group-hover:border-coral/30">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center">
                          <span className="font-heading text-coral text-sm">{i + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-heading text-off-white text-base group-hover:text-coral transition-colors mb-1">
                            {sol.title}
                          </h3>
                          <p className="text-foreground-muted text-sm">{sol.description}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {page.toolHref && (
          <Section background="charcoal" className="section-glow-coral !py-14">
            <Container width="narrow" className="text-center">
              <ScrollReveal direction="up">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">FREE DIAGNOSTIC</p>
                <Button href={page.toolHref} size="lg" dataTrack={`problem_${slug}_tool`}>
                  {page.toolLabel || "Try the free tool"}
                </Button>
                <div className="mt-4">
                  <Link href="/apply" className="text-coral hover:text-coral/80 text-sm font-heading tracking-wider transition-colors" data-track={`problem_${slug}_apply`}>
                    Or apply for coaching $†’
                  </Link>
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
