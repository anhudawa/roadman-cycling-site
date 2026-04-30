import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import {
  CASE_STUDIES,
  getCaseStudyTestimonial,
  type CaseStudy,
} from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Cycling Coaching Case Studies — Real Athlete Results",
  description:
    "Case studies of real cyclists coached by Roadman Cycling. FTP gains, comebacks after injury, body composition transformations, and category jumps — with the constraints, the intervention, and the honest caveats.",
  keywords: [
    "cycling coaching case studies",
    "cycling coach results",
    "FTP gain case study",
    "Roadman Cycling testimonials",
    "Not Done Yet results",
    "cycling transformation",
    "online cycling coach evidence",
  ],
  alternates: {
    canonical: `${SITE_ORIGIN}/case-studies`,
  },
  openGraph: {
    title: "Cycling Coaching Case Studies — Real Athlete Results | Roadman Cycling",
    description:
      "Long-form case studies of cyclists coached by Roadman Cycling — starting point, intervention, outcome, caveats.",
    type: "website",
    url: `${SITE_ORIGIN}/case-studies`,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Roadman Cycling coaching case studies",
      },
    ],
  },
};

interface CardData {
  caseStudy: CaseStudy;
  tag?: string;
}

function buildCardData(): CardData[] {
  return CASE_STUDIES.map((caseStudy) => {
    const testimonial = getCaseStudyTestimonial(caseStudy);
    return { caseStudy, tag: testimonial.tag };
  });
}

export default function CaseStudiesIndex() {
  const cards = buildCardData();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Roadman Cycling Coaching Case Studies",
          description:
            "Long-form case studies of athletes coached by Roadman Cycling.",
          url: `${SITE_ORIGIN}/case-studies`,
          isPartOf: { "@id": ENTITY_IDS.website },
          publisher: { "@id": ENTITY_IDS.organization },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: CASE_STUDIES.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_ORIGIN}/case-studies/${c.slug}`,
              name: c.title,
            })),
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
              item: SITE_ORIGIN,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Case Studies",
              item: `${SITE_ORIGIN}/case-studies`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container width="narrow">
            <Breadcrumbs items={[{ label: "Case Studies" }]} />
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-6">
                CASE STUDIES
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                REAL ATHLETES.
                <br />
                <span className="text-coral">REAL NUMBERS.</span>
                <br />
                HONEST CAVEATS.
              </h1>
              <p className="text-foreground-muted text-lg max-w-2xl leading-relaxed">
                Long-form case studies of cyclists coached by Roadman Cycling.
                Starting point, constraints, the intervention, weekly
                structure, the outcome — and a caveats block, because real
                coaching has limits and pretending otherwise is the fastest
                way to lose your trust.
              </p>
              <p className="text-foreground-subtle text-sm mt-4 max-w-2xl">
                Quotes are verbatim from the athletes. Numbers come from their
                testimonials and TrainingPeaks files. Where a detail isn&apos;t
                public, we say so.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Cards grid */}
        <Section background="charcoal">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-6xl mx-auto">
              {cards.map(({ caseStudy, tag }, i) => (
                <ScrollReveal
                  key={caseStudy.slug}
                  direction="up"
                  delay={i * 0.05}
                >
                  <Link
                    href={`/case-studies/${caseStudy.slug}`}
                    data-track={`case_studies_index_${caseStudy.slug}`}
                    className="group block h-full rounded-2xl border border-white/10 bg-white/[0.03] hover:border-coral/30 hover:bg-white/[0.05] transition-all p-6 md:p-8"
                  >
                    {tag && (
                      <p className="font-heading text-coral text-[11px] tracking-[0.25em] mb-4">
                        {tag.toUpperCase()}
                      </p>
                    )}
                    <div className="flex items-baseline gap-4 mb-3">
                      <p
                        className="font-heading text-coral leading-none"
                        style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)" }}
                      >
                        {caseStudy.heroStat}
                      </p>
                      <p className="text-[11px] font-body tracking-widest text-foreground-subtle uppercase">
                        {caseStudy.heroStatLabel}
                      </p>
                    </div>
                    <h2 className="font-heading text-off-white text-xl md:text-2xl tracking-wide leading-tight mb-3 group-hover:text-coral transition-colors">
                      {caseStudy.testimonialName.toUpperCase()}
                    </h2>
                    <p className="text-foreground-muted text-sm leading-relaxed mb-5">
                      {caseStudy.cardSummary}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-coral text-xs font-heading tracking-widest">
                      READ THE CASE STUDY
                      <span
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Editorial standards / honesty block */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
                <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                  HOW WE WRITE CASE STUDIES
                </p>
                <h2 className="font-heading text-off-white text-2xl md:text-3xl leading-tight mb-4">
                  No invented numbers. No before-photo theatre. No
                  &ldquo;average results may vary&rdquo; small print.
                </h2>
                <div className="space-y-4 text-foreground-muted leading-relaxed">
                  <p>
                    Every quote on these pages is the athlete&apos;s own
                    words. Every power number, weight, and timeframe comes
                    from their testimonial or their TrainingPeaks file. Where
                    a specific detail isn&apos;t available, we either source
                    it from elsewhere or we say it&apos;s not available.
                  </p>
                  <p>
                    Each case study includes a caveats block that names the
                    limits — atypical timeframes, missing data, the role of
                    genetics, where coaching alone isn&apos;t the answer. If
                    we can&apos;t be honest about the limitations, we
                    can&apos;t be honest about the gains either.
                  </p>
                  <p>
                    For the full editorial policy, see our{" "}
                    <Link
                      href="/editorial-standards"
                      className="text-coral hover:text-coral/80 transition-colors"
                    >
                      editorial standards
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Closing CTA */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              READY TO BE THE NEXT CASE STUDY?
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-8">
              The five-pillar system that produced these results is the same
              system every coached athlete gets. $195/month. 7-day free
              trial. Reviewed personally by Anthony.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-off-white text-coral hover:bg-off-white/90 shadow-lg"
              style={{ transitionDuration: "var(--duration-fast)" }}
              data-track="case_studies_index_apply"
            >
              Apply for Coaching
            </Link>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-off-white/60 text-sm">
              <span>$195/month</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>7-day free trial</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Cancel anytime</span>
            </div>
            <p className="text-off-white/50 text-xs mt-4">
              Or take the{" "}
              <Link
                href="/assessment"
                className="underline hover:text-off-white transition-colors"
              >
                free coaching assessment
              </Link>{" "}
              first.
            </p>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
