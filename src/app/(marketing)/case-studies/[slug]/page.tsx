import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AnswerCapsule } from "@/components/ui/AnswerCapsule";
import { TestimonialBlock, BeforeAfterMetrics } from "@/components/proof";
import { JourneyBlock } from "@/components/journey";
import { ENTITY_IDS, FOUNDER, SITE_ORIGIN } from "@/lib/brand-facts";
import {
  CASE_STUDIES,
  getCaseStudyBySlug,
  getCaseStudyTestimonial,
  getAllCaseStudySlugs,
} from "@/lib/case-studies";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);
  if (!caseStudy) return {};

  const url = `${SITE_ORIGIN}/case-studies/${caseStudy.slug}`;
  return {
    title: caseStudy.seoTitle,
    description: caseStudy.seoDescription,
    keywords: caseStudy.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: caseStudy.seoTitle,
      description: caseStudy.seoDescription,
      type: "article",
      url,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: caseStudy.title,
        },
      ],
      authors: [FOUNDER.name],
      publishedTime: caseStudy.publishDate,
      modifiedTime: caseStudy.updatedDate ?? caseStudy.publishDate,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);
  if (!caseStudy) notFound();

  const testimonial = getCaseStudyTestimonial(caseStudy);
  const url = `${SITE_ORIGIN}/case-studies/${caseStudy.slug}`;
  const pillar = caseStudy.pillar ?? "coaching";

  // Pull the related case studies — silently drops any that don't
  // resolve (so a typo'd slug doesn't 500 the page in production).
  const related = (caseStudy.relatedCaseStudies ?? [])
    .map((s) => CASE_STUDIES.find((c) => c.slug === s))
    .filter((c): c is (typeof CASE_STUDIES)[number] => Boolean(c));

  return (
    <>
      {/* Article schema. We intentionally do NOT emit schema.org/Review
          here: Google requires `reviewRating` on every Review (a numeric
          rating value), and these are narrative case studies, not
          star-rated reviews. Emitting Review without a rating triggers
          the structured-data spam policy. The athlete's quote is
          surfaced via Article.about + Article.mentions instead. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: caseStudy.title,
          description: caseStudy.seoDescription,
          url,
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          isPartOf: { "@id": ENTITY_IDS.website },
          datePublished: caseStudy.publishDate,
          dateModified: caseStudy.updatedDate ?? caseStudy.publishDate,
          mainEntityOfPage: url,
          articleSection: "Case Studies",
          about: {
            "@type": "Person",
            name: testimonial.name,
            description: testimonial.detail,
          },
          mentions: [
            {
              "@type": "Service",
              name: "Roadman Cycling Coaching",
              provider: { "@id": ENTITY_IDS.organization },
              url: `${SITE_ORIGIN}/coaching`,
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
              name: "Case Studies",
              item: `${SITE_ORIGIN}/case-studies`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: testimonial.name,
              item: url,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <Breadcrumbs
              items={[
                { label: "Case Studies", href: "/case-studies" },
                { label: testimonial.name },
              ]}
            />
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-xs tracking-[0.3em] mb-4">
                {caseStudy.heroEyebrow}
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {caseStudy.title.toUpperCase()}
              </h1>

              <AnswerCapsule text={caseStudy.answerCapsule} pillar={pillar} />

              <TestimonialBlock
                testimonial={testimonial}
                variant="spotlight"
                className="mt-8"
              />

              {/* Quick facts */}
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                {caseStudy.riderConstraints.map((c) => (
                  <div
                    key={c.label}
                    className="rounded-lg bg-white/[0.04] border border-white/5 p-4"
                  >
                    <dt className="text-[10px] font-heading tracking-widest text-foreground-subtle uppercase mb-1">
                      {c.label}
                    </dt>
                    <dd className="text-off-white text-sm font-medium leading-snug">
                      {c.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Body — narrative sections */}
        <Section background="charcoal">
          <Container width="narrow">
            <article className="prose-cs space-y-14">
              <NarrativeSection
                eyebrow="STARTING POINT"
                heading="Where the rider was before coaching"
                paragraphs={caseStudy.startingPoint}
              />

              <NarrativeSection
                eyebrow="INTERVENTION"
                heading="What changed"
                paragraphs={caseStudy.intervention}
              />

              <NarrativeSection
                eyebrow="WEEKLY STRUCTURE"
                heading="What the training week actually looked like"
                paragraphs={caseStudy.weeklyStructure}
              />

              <NarrativeSection
                eyebrow="NUTRITION & STRENGTH"
                heading="The pillars under the bike"
                paragraphs={caseStudy.nutritionStrength}
              />

              <NarrativeSection
                eyebrow="OUTCOME"
                heading="The result, in the rider's own words"
                paragraphs={caseStudy.outcome}
              />

              {caseStudy.outcomeMetrics.length > 0 && (
                <ScrollReveal direction="up">
                  <BeforeAfterMetrics
                    metrics={caseStudy.outcomeMetrics}
                    eyebrow="THE NUMBERS"
                    title="Before / after"
                    subtitle="From the athlete's testimonial and TrainingPeaks file. Where a number isn't published, we don't list one."
                  />
                </ScrollReveal>
              )}

              <ScrollReveal direction="up">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                  <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                    CAVEATS
                  </p>
                  <h2 className="font-heading text-off-white text-2xl md:text-3xl leading-tight mb-5">
                    What this case study does <em>not</em> claim.
                  </h2>
                  <ul className="space-y-3">
                    {caseStudy.caveats.map((c) => (
                      <li
                        key={c}
                        className="flex items-start gap-3 text-foreground-muted text-base leading-relaxed"
                      >
                        <span
                          aria-hidden="true"
                          className="text-coral mt-1 shrink-0 font-heading text-xs"
                        >
                          ▶
                        </span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up">
                <div className="rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/10 via-deep-purple/30 to-charcoal p-6 md:p-10">
                  <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                    COACH COMMENTARY
                  </p>
                  <h2 className="font-heading text-off-white text-2xl md:text-3xl leading-tight mb-5">
                    Anthony on this case
                  </h2>
                  <div className="space-y-4 text-off-white/90 leading-relaxed">
                    {caseStudy.coachCommentary.map((p) => (
                      <p key={p} className="text-base md:text-lg">
                        {p}
                      </p>
                    ))}
                  </div>
                  <p className="text-foreground-subtle text-xs mt-6">
                    —{" "}
                    <Link
                      href="/author/anthony-walsh"
                      className="hover:text-coral transition-colors"
                    >
                      Anthony Walsh
                    </Link>
                    , Roadman Cycling head coach.
                  </p>
                </div>
              </ScrollReveal>
            </article>
          </Container>
        </Section>

        {/* Internal links */}
        {caseStudy.internalLinks && caseStudy.internalLinks.length > 0 && (
          <Section background="deep-purple" grain>
            <Container width="narrow">
              <ScrollReveal direction="up" className="mb-8">
                <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                  GO DEEPER
                </p>
                <h2 className="font-heading text-off-white text-2xl md:text-3xl leading-tight max-w-2xl">
                  The methodology, tools, and articles behind this case
                </h2>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseStudy.internalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-track={`case_study_${caseStudy.slug}_link_${link.href}`}
                    className="group block p-5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 hover:border-coral/30 transition-all"
                  >
                    <p className="font-heading text-base text-off-white group-hover:text-coral transition-colors tracking-wide mb-1">
                      {link.label}
                    </p>
                    {link.description && (
                      <p className="text-xs text-foreground-subtle leading-relaxed">
                        {link.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Related case studies */}
        {related.length > 0 && (
          <Section background="charcoal">
            <Container width="narrow">
              <ScrollReveal direction="up" className="mb-8">
                <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                  RELATED CASE STUDIES
                </p>
                <h2 className="font-heading text-off-white text-2xl md:text-3xl leading-tight">
                  Other riders, other constraints, same system
                </h2>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/case-studies/${r.slug}`}
                    data-track={`case_study_${caseStudy.slug}_related_${r.slug}`}
                    className="group block h-full p-5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 hover:border-coral/30 transition-all"
                  >
                    <p
                      className="font-heading text-coral leading-none mb-2"
                      style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                    >
                      {r.heroStat}
                    </p>
                    <p className="text-[10px] font-heading tracking-widest text-foreground-subtle uppercase mb-3">
                      {r.heroStatLabel}
                    </p>
                    <p className="font-heading text-off-white text-sm tracking-wide group-hover:text-coral transition-colors mb-2">
                      {r.testimonialName.toUpperCase()}
                    </p>
                    <p className="text-xs text-foreground-subtle leading-relaxed">
                      {r.cardSummary}
                    </p>
                  </Link>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Funnel-aware journey block */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <JourneyBlock
              stage="coaching"
              source={`case-study-${caseStudy.slug}`}
              eyebrow="DECIDE FROM EVIDENCE"
              heading="One case study isn't proof. The system behind it is."
            />
          </Container>
        </Section>

        {/* CTA */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              YOUR CASE STUDY STARTS HERE.
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-8">
              Same five-pillar system. Personalised to your numbers, your
              schedule, your goals. $195/month. 7-day free trial. Reviewed
              personally by Anthony.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-off-white text-coral hover:bg-off-white/90 shadow-lg"
              style={{ transitionDuration: "var(--duration-fast)" }}
              data-track={`case_study_${caseStudy.slug}_apply`}
            >
              Apply for Coaching
            </Link>
            <p className="text-off-white/60 text-xs mt-4">
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

interface NarrativeSectionProps {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
}

function NarrativeSection({
  eyebrow,
  heading,
  paragraphs,
}: NarrativeSectionProps) {
  if (!paragraphs.length) return null;
  return (
    <ScrollReveal direction="up">
      <section>
        <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
          {eyebrow}
        </p>
        <h2 className="font-heading text-off-white text-2xl md:text-3xl leading-tight mb-5">
          {heading}
        </h2>
        <div className="space-y-4 text-foreground-muted leading-relaxed text-base md:text-lg max-w-2xl">
          {paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
