import type { Metadata } from "next";
import Link from "next/link";

import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SITE_ORIGIN } from "@/lib/brand-facts";
import { TOUR_HISTORY } from "@/data/tour-history";

const URL = `${SITE_ORIGIN}/tour-de-france/history`;

export const metadata: Metadata = {
  title: "Tour de France History — The Greats, Through a Training Lens",
  description:
    "Merckx, Hinault, Indurain, Pantani, LeMond and the legend of Alpe d'Huez — Tour de France history told through what it teaches a serious amateur about training, pacing and getting faster.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Tour de France History — The Greats, Through a Training Lens",
    description:
      "Tour de France history with the Roadman training angle — the riders, the climbs, and the lessons that still apply.",
    type: "website",
    url: URL,
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function TourHistoryHubPage() {
  // Group articles by their eyebrow section, preserving array order.
  const sections = TOUR_HISTORY.reduce<Record<string, typeof TOUR_HISTORY>>(
    (acc, a) => {
      (acc[a.eyebrow] ??= []).push(a);
      return acc;
    },
    {},
  );

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tour de France History",
          url: URL,
          isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
          hasPart: TOUR_HISTORY.map((a) => ({
            "@type": "Article",
            headline: a.title,
            url: `${URL}/${a.slug}`,
            datePublished: a.published,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: "Tour de France 2026", item: `${SITE_ORIGIN}/tour-de-france` },
            { "@type": "ListItem", position: 3, name: "History", item: URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-28 sm:pt-32 pb-14">
          <Container>
            <Breadcrumbs
              items={[
                { label: "Tour de France 2026", href: "/tour-de-france" },
                { label: "History" },
              ]}
            />
            <ScrollReveal direction="up">
              <p className="font-heading text-jersey-yellow text-xs sm:text-sm tracking-[0.3em] mb-4">
                A HUNDRED YEARS OF HARD
              </p>
              <h1
                className="font-heading text-off-white leading-[0.9] mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                TOUR DE FRANCE
                <span className="block text-jersey-yellow">HISTORY</span>
              </h1>
              <p className="text-foreground-muted text-lg max-w-2xl leading-relaxed">
                The Cannibal&rsquo;s engine. The Badger&rsquo;s timing. Big Mig&rsquo;s
                lungs. Pantani&rsquo;s climbing maths and LeMond&rsquo;s eight seconds.
                We tell the history the Roadman way — for what each rider and each
                famous climb still teaches a serious amateur about getting faster.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {Object.entries(sections).map(([eyebrow, articles], si) => (
          <Section
            key={eyebrow}
            background={si % 2 === 0 ? "charcoal" : "deep-purple"}
            grain={si % 2 === 1}
          >
            <Container>
              <h2 className="font-heading text-off-white text-3xl tracking-wide mb-8">
                {eyebrow}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.map((a) => (
                  <ScrollReveal key={a.slug} direction="up">
                    <Link
                      href={`/tour-de-france/history/${a.slug}`}
                      className="group block h-full rounded-xl border border-white/8 hover:border-jersey-yellow/40 bg-background-elevated p-6 transition-all"
                    >
                      <p className="font-heading text-jersey-yellow text-[11px] tracking-[0.25em] mb-3">
                        {a.tag.toUpperCase()} · {a.readMinutes} MIN
                      </p>
                      <p className="font-heading text-off-white text-2xl leading-tight tracking-wide group-hover:text-jersey-yellow transition-colors mb-3">
                        {a.title}
                      </p>
                      <p className="text-sm text-foreground-muted leading-relaxed mb-4">
                        {a.dek}
                      </p>
                      <span className="font-heading text-jersey-yellow text-sm tracking-wider">
                        READ →
                      </span>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </Section>
        ))}

        <Section background="charcoal" className="!py-12 border-t border-white/5">
          <Container className="text-center">
            <Button href="/tour-de-france" variant="ghost">
              ← Back to the 2026 Race Hub
            </Button>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
