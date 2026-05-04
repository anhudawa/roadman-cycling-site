import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import {
  TestimonialBlock,
  BeforeAfterMetrics,
  type MetricRow,
} from "@/components/proof";
import {
  TESTIMONIALS,
  getTestimonialsByName,
  type Testimonial,
} from "@/lib/testimonials";
import { CASE_STUDIES } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Real Cyclist Results — Proof Library",
  description:
    "Verified results from cyclists coached by Roadman Cycling. FTP gains, body composition shifts, category jumps, comebacks after injury, and masters performance — quotes verbatim, numbers from TrainingPeaks, caveats included.",
  keywords: [
    "cycling coaching results",
    "Roadman Cycling testimonials",
    "FTP gain proof",
    "Not Done Yet results",
    "cycling transformation",
    "masters cycling performance",
    "cycling coach evidence",
  ],
  alternates: {
    canonical: `${SITE_ORIGIN}/proof`,
  },
  openGraph: {
    title: "Real Cyclist Results — Proof Library | Roadman Cycling",
    description:
      "Real riders. Real results. No hype. The full library of athlete proof from Roadman Cycling coaching.",
    type: "website",
    url: `${SITE_ORIGIN}/proof`,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Roadman Cycling proof library — real athlete results",
      },
    ],
  },
};

const ctaButtonGhost =
  "inline-flex items-center justify-center font-heading tracking-wider uppercase rounded-md px-6 py-3 text-sm border border-white/20 text-off-white hover:border-coral hover:text-coral transition-colors";

interface CategorySectionProps {
  eyebrow: string;
  heading: string;
  intro: string;
  spotlight: Testimonial;
  supporting: Testimonial[];
  metrics?: MetricRow[];
  metricsTitle?: string;
  metricsSubtitle?: string;
  ctaHeading: string;
  ctaBody: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  source: string;
  background: "charcoal" | "deep-purple";
}

function CategorySection({
  eyebrow,
  heading,
  intro,
  spotlight,
  supporting,
  metrics,
  metricsTitle,
  metricsSubtitle,
  ctaHeading,
  ctaBody,
  ctaPrimaryLabel,
  ctaPrimaryHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
  source,
  background,
}: CategorySectionProps) {
  return (
    <Section background={background} grain={background === "deep-purple"}>
      <Container>
        <ScrollReveal direction="up">
          <div className="max-w-2xl mb-10">
            <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
              {eyebrow}
            </p>
            <h2
              className="font-heading text-off-white leading-tight mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              {heading}
            </h2>
            <p className="text-foreground-muted leading-relaxed">{intro}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.05}>
          <TestimonialBlock testimonial={spotlight} variant="spotlight" />
        </ScrollReveal>

        {supporting.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
            {supporting.slice(0, 3).map((t, i) => (
              <ScrollReveal key={t.name} direction="up" delay={0.1 + i * 0.05}>
                <TestimonialBlock
                  testimonial={t}
                  variant="compact"
                  preferShort
                />
              </ScrollReveal>
            ))}
          </div>
        )}

        {metrics && metrics.length > 0 && (
          <ScrollReveal direction="up" delay={0.2}>
            <div className="mt-8">
              <BeforeAfterMetrics
                metrics={metrics}
                eyebrow="Measured change"
                title={metricsTitle}
                subtitle={metricsSubtitle}
              />
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal direction="up" delay={0.25}>
          <aside
            className="mt-10 rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-10"
            aria-label={`${heading} call to action`}
          >
            <div className="grid md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-center">
              <div>
                <h3 className="font-heading text-off-white text-2xl md:text-3xl leading-tight mb-2">
                  {ctaHeading}
                </h3>
                <p className="text-foreground-muted text-sm md:text-base leading-relaxed max-w-2xl">
                  {ctaBody}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:items-end">
                <Button
                  href={ctaPrimaryHref}
                  size="lg"
                  dataTrack={`proof_${source}_primary`}
                >
                  {ctaPrimaryLabel}
                </Button>
                <Link
                  href={ctaSecondaryHref}
                  className={ctaButtonGhost}
                  data-track={`proof_${source}_secondary`}
                >
                  {ctaSecondaryLabel}
                </Link>
              </div>
            </div>
          </aside>
        </ScrollReveal>
      </Container>
    </Section>
  );
}

export default function ProofLibraryPage() {
  const plateauSpotlight = getTestimonialsByName(["Damien Maloney"])[0];
  const plateauSupporting = getTestimonialsByName([
    "Blair Corey",
    "Brian Morrissey",
    "Vern Locke",
  ]);

  const bodyCompSpotlight = getTestimonialsByName(["Chris O'Connor"])[0];
  const bodyCompSupporting = getTestimonialsByName([
    "Gregory Gross",
    "John Devlin",
  ]);

  const raceSpotlight = getTestimonialsByName(["Daniel Stone"])[0];
  const raceSupporting = getTestimonialsByName([
    "Quinton Gothard",
    "Keano Donne",
    "David Corrigan",
  ]);

  const comebackSpotlight = getTestimonialsByName(["David Lundy"])[0];
  const comebackSupporting = getTestimonialsByName([
    "Aaron Kearney",
    "Gregory Gross",
    "Ciaran O Conluain",
  ]);

  const eventSpotlight = getTestimonialsByName(["Kazim"])[0];
  const eventSupporting = getTestimonialsByName([
    "Aaron Kearney",
    "Ian McKnight",
    "Quinton Gothard",
  ]);

  const mastersSpotlight = getTestimonialsByName(["Brian Morrissey"])[0];
  const mastersSupporting = getTestimonialsByName([
    "Kevin L",
    "Mary K",
    "Rob Capps",
  ]);

  const ftpMetrics: MetricRow[] = [
    {
      label: "Damien · FTP",
      before: "205w",
      after: "295w",
      delta: "+90w · plateau broken",
    },
    {
      label: "Blair · 20-min power",
      before: "236w",
      after: "296w",
      delta: "+60w in 3 months",
    },
    {
      label: "Brian · FTP at 52",
      before: "230w",
      after: "265w",
      delta: "+15% in 10 weeks",
    },
  ];

  const bodyCompMetrics: MetricRow[] = [
    {
      label: "Chris · weight",
      before: "84kg",
      after: "68kg",
      delta: "-16kg · 20% body fat → 7%",
    },
    {
      label: "Gregory · weight",
      before: "315lbs",
      after: "Sub-100kg",
      delta: "15-year low weight",
    },
    {
      label: "John · weight",
      before: "103kg",
      after: "96.3kg",
      delta: "-6.7kg since December",
    },
  ];

  const raceMetrics: MetricRow[] = [
    {
      label: "Daniel · category",
      before: "Cat 3",
      after: "Cat 1",
      delta: "Two upgrades in one season",
    },
    {
      label: "Vern · 5-sec power",
      before: "77w max",
      after: "915w PR",
      delta: "Personal record",
    },
    {
      label: "Keano · 2-min power",
      before: "585w",
      after: "610w",
      delta: "+25w PB",
    },
  ];

  const orgQuotes = TESTIMONIALS.filter((t) => t.quote && t.name).slice(0, 12);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Real Cyclist Results — Roadman Cycling Proof Library",
          description:
            "Verified results, testimonials, and case studies from cyclists coached by Roadman Cycling.",
          url: `${SITE_ORIGIN}/proof`,
          isPartOf: { "@id": ENTITY_IDS.website },
          publisher: { "@id": ENTITY_IDS.organization },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: orgQuotes.length,
            itemListElement: orgQuotes.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Person",
                name: t.name,
                description: t.detail,
              },
            })),
          },
          significantLink: CASE_STUDIES.slice(0, 6).map(
            (c) => `${SITE_ORIGIN}/case-studies/${c.slug}`,
          ),
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
              name: "Proof",
              item: `${SITE_ORIGIN}/proof`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container width="narrow">
            <Breadcrumbs items={[{ label: "Proof" }]} />
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-6">
                PROOF LIBRARY
              </p>
              <h1
                className="font-heading text-off-white leading-[0.95] mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                REAL RIDERS.
                <br />
                REAL RESULTS.
                <br />
                <span className="text-coral">NO HYPE.</span>
              </h1>
              <p className="text-foreground-muted text-lg max-w-2xl leading-relaxed">
                The full library of athlete proof from Roadman Cycling
                coaching. FTP gains, body composition shifts, category jumps,
                comebacks after injury, and masters performance — every quote
                verbatim, every number from a TrainingPeaks file or
                testimonial, caveats included.
              </p>
              <p className="text-foreground-subtle text-sm mt-4 max-w-2xl">
                Quotes are from real members of the Not Done Yet community and
                Anthony&apos;s 1:1 coaching roster. Where a number isn&apos;t
                verifiable, it isn&apos;t here.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Aggregate proof rail */}
        <Section background="charcoal" className="!py-12">
          <Container>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {[
                {
                  stat: "+90w",
                  label: "Highest documented FTP gain",
                  detail: "Damien Maloney · plateau broken",
                },
                {
                  stat: "-16kg",
                  label: "Biggest body composition shift",
                  detail: "Chris O'Connor · 20% → 7% body fat",
                },
                {
                  stat: "Cat 3 → 1",
                  label: "Two upgrades, one season",
                  detail: "Daniel Stone · category jump",
                },
                {
                  stat: "4 w/kg @ 52",
                  label: "Masters performance benchmark",
                  detail: "Brian Morrissey · age 50+",
                },
              ].map((s, i) => (
                <ScrollReveal key={s.label} direction="up" delay={i * 0.05}>
                  <div className="h-full rounded-xl border border-coral/20 bg-gradient-to-br from-coral/10 via-deep-purple/30 to-charcoal p-5 md:p-6">
                    <p
                      className="font-heading text-coral leading-none mb-3"
                      style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
                    >
                      {s.stat}
                    </p>
                    <p className="font-heading text-off-white text-sm tracking-wide leading-tight mb-1.5">
                      {s.label.toUpperCase()}
                    </p>
                    <p className="text-foreground-subtle text-xs leading-snug">
                      {s.detail}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <p className="text-foreground-subtle text-xs mt-6 text-center">
              {CASE_STUDIES.length} long-form case studies ·{" "}
              {TESTIMONIALS.length}+ verified member testimonials.{" "}
              <Link
                href="/case-studies"
                className="text-coral hover:text-coral/80 transition-colors"
              >
                Read the deep dives →
              </Link>
            </p>
          </Container>
        </Section>

        {/* Category 1: Plateau Broken (FTP gains) */}
        <CategorySection
          eyebrow="PLATEAU BROKEN · FTP GAINS"
          heading="WHEN THE NUMBERS START MOVING AGAIN"
          intro="The plateau is the most common reason cyclists land here. Years of riding, structured intervals, no movement on the FTP test. The fix usually isn't more — it's the right kind of stress, the right recovery, the right strength work. Here's what that looks like when it lands."
          spotlight={plateauSpotlight}
          supporting={plateauSupporting}
          metrics={ftpMetrics}
          metricsTitle="Verified FTP gains"
          metricsSubtitle="Numbers come from athlete testimonials and TrainingPeaks files."
          ctaHeading="STUCK ON YOUR FTP? START WITH THE DIAGNOSTIC."
          ctaBody="The Plateau Diagnostic is a free 12-question tool that pinpoints which of the five systems is holding you back — recovery, fuelling, polarisation, strength, or pacing. Personal report. No upsell required."
          ctaPrimaryLabel="Run the Plateau Diagnostic"
          ctaPrimaryHref="/plateau"
          ctaSecondaryLabel="Apply for coaching"
          ctaSecondaryHref="/apply"
          source="ftp"
          background="charcoal"
        />

        {/* Category 2: Body Composition */}
        <CategorySection
          eyebrow="BODY COMPOSITION"
          heading="LOSING THE WEIGHT THAT WAS COSTING YOU WATTS"
          intro="Body composition is the hidden universal motivator. Most riders ask about FTP and discover the gain comes from the same scale that holds their morning weight. These shifts happened over months, not weeks, alongside structured training and honest fuelling — not in spite of it."
          spotlight={bodyCompSpotlight}
          supporting={bodyCompSupporting}
          metrics={bodyCompMetrics}
          metricsTitle="Body composition shifts"
          metricsSubtitle="Quotes verbatim. No before-and-after photo theatre."
          ctaHeading="LOSE THE WEIGHT THAT'S HOLDING YOU BACK."
          ctaBody="Apply for coaching and you'll get a fuelling and body composition plan personal to your numbers, alongside the training. Not a generic deficit. Not a crash diet. Sustainable shifts that don't tank your power."
          ctaPrimaryLabel="Apply for coaching"
          ctaPrimaryHref="/apply"
          ctaSecondaryLabel="Run the Plateau Diagnostic"
          ctaSecondaryHref="/plateau"
          source="bodycomp"
          background="deep-purple"
        />

        {/* Category 3: Race results */}
        <CategorySection
          eyebrow="CATEGORY JUMPS · RACE WINS · POWER PRS"
          heading="WHEN STRUCTURED TRAINING SHOWS UP ON RACE DAY"
          intro="Race results are the cleanest read on whether the system works. Category upgrades. First wins. Power records on intervals that used to feel impossible. These aren't outliers — they're what happens when the training calendar matches the race calendar and the rider stops making it up as they go."
          spotlight={raceSpotlight}
          supporting={raceSupporting}
          metrics={raceMetrics}
          metricsTitle="Race-day proof"
          metricsSubtitle="Category upgrades, power PRs, race wins."
          ctaHeading="WANT TO RACE WITH A REAL PLAN BEHIND YOU?"
          ctaBody="Inner Circle is the small-group coaching room for serious racers and event riders. Weekly check-ins with Anthony, Vekta-built training plans, and the same five-pillar system that put Daniel Stone in Cat 1 in one season."
          ctaPrimaryLabel="See Inner Circle"
          ctaPrimaryHref="/inner-circle"
          ctaSecondaryLabel="Run the Plateau Diagnostic"
          ctaSecondaryHref="/plateau"
          source="race"
          background="charcoal"
        />

        {/* Category 4: Comeback */}
        <CategorySection
          eyebrow="COMEBACKS"
          heading="GETTING THE FORM — AND THE LOVE FOR IT — BACK"
          intro="A bad crash. A long illness. A few years where life took the bike out of the diary. Comebacks are the most emotional category in here, because the work isn't only about watts. It's about the version of yourself you're trying to find again. The riders below did, and they wrote it down."
          spotlight={comebackSpotlight}
          supporting={comebackSupporting}
          ctaHeading="COMING BACK FROM A SETBACK? DO IT WITH STRUCTURE."
          ctaBody="Whether it's a crash, an illness, or just a long break — the path back is faster, safer, and more enjoyable with a coach reading your numbers and adjusting in real time. Apply and we'll talk about whether coaching is right for where you are."
          ctaPrimaryLabel="Apply for coaching"
          ctaPrimaryHref="/apply"
          ctaSecondaryLabel="Run the Plateau Diagnostic"
          ctaSecondaryHref="/plateau"
          source="comeback"
          background="deep-purple"
        />

        {/* Category 5: Events / Volume */}
        <CategorySection
          eyebrow="EVENTS · ULTRA · BUCKET-LIST RIDES"
          heading="FROM SURVIVING THE EVENT TO PERFORMING IN IT"
          intro="The Etape. The Marmotte. A 7-day ultra. The bucket-list ride doesn't have to be the one you barely finish. With a structured 16- to 24-week build, the right fuelling protocol, and pacing that matches your actual numbers, the goal stops being completion. It starts being how you ride it."
          spotlight={eventSpotlight}
          supporting={eventSupporting}
          ctaHeading="GOT AN EVENT ON THE CALENDAR? BUILD A REAL CAMPAIGN."
          ctaBody="Tell us the event and the date. We'll build a coaching plan that hits peak form on the right day, with the strength, nutrition, and pacing work to back it up. Most event athletes start with a coaching application or the Plateau Diagnostic."
          ctaPrimaryLabel="Apply for coaching"
          ctaPrimaryHref="/apply"
          ctaSecondaryLabel="See coaching for sportives"
          ctaSecondaryHref="/coaching/sportives"
          source="events"
          background="charcoal"
        />

        {/* Category 6: Masters / 50+ */}
        <CategorySection
          eyebrow="MASTERS · AGE 50+"
          heading="THE BEST DECADE OF YOUR RIDING ISN'T BEHIND YOU"
          intro="The masters category is where the &ldquo;not done yet&rdquo; identity is loudest — riders who refuse the script that says it's all downhill from here. Done right, masters training is more rewarding, more durable, and more specific than the training you did at 30. The proof below is a small sample."
          spotlight={mastersSpotlight}
          supporting={mastersSupporting}
          ctaHeading="OVER 50 AND STILL CHASING NUMBERS? GOOD."
          ctaBody="Coaching for masters cyclists isn't a watered-down version of coaching for racers — it's smarter periodisation, more deliberate strength work, and recovery that respects what your body actually needs. Apply and we'll build it around you."
          ctaPrimaryLabel="Apply for coaching"
          ctaPrimaryHref="/apply"
          ctaSecondaryLabel="See coaching for over-50s"
          ctaSecondaryHref="/coaching/over-50"
          source="masters"
          background="deep-purple"
        />

        {/* Editorial honesty block */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
                <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
                  HOW WE BUILD THIS PAGE
                </p>
                <h2 className="font-heading text-off-white text-2xl md:text-3xl leading-tight mb-4">
                  No invented numbers. No before-photo theatre. No
                  &ldquo;average results may vary&rdquo; small print.
                </h2>
                <div className="space-y-4 text-foreground-muted leading-relaxed">
                  <p>
                    Every quote on this page is the athlete&apos;s own words.
                    Every power number, weight, body fat percentage, and
                    timeframe comes from their testimonial or their
                    TrainingPeaks file. Where a specific detail isn&apos;t
                    available, we either source it from elsewhere or we say it
                    isn&apos;t available.
                  </p>
                  <p>
                    These results are not promises. They&apos;re what
                    individual riders achieved with a personalised coaching
                    plan, the right buy-in, and the time it took. The full
                    long-form versions — including the constraints, the
                    intervention, and the caveats — live on the case studies
                    pages.
                  </p>
                  <p>
                    For the full editorial policy, see{" "}
                    <Link
                      href="/case-studies"
                      className="text-coral hover:text-coral/80 transition-colors"
                    >
                      our case studies index
                    </Link>{" "}
                    or our{" "}
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

        {/* Final closing CTA */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <p className="font-heading text-off-white/80 text-xs tracking-[0.3em] mb-4">
              READY TO BE THE NEXT NAME ON THIS PAGE?
            </p>
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              START WITH THE DIAGNOSTIC.
            </h2>
            <p className="text-off-white/85 max-w-xl mx-auto mb-8 leading-relaxed">
              The Plateau Diagnostic is the universal entry point. Twelve
              questions. A personal report. The first read on which of the
              five systems is holding your numbers back. Free. No upsell to
              finish it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/plateau"
                className="inline-flex items-center justify-center font-heading tracking-wider uppercase rounded-md px-8 md:px-10 py-4 text-lg bg-off-white text-coral hover:bg-off-white/90 shadow-lg transition-colors"
                data-track="proof_final_plateau"
              >
                Run the Plateau Diagnostic
              </Link>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center font-heading tracking-wider uppercase rounded-md px-8 md:px-10 py-4 text-lg border-2 border-off-white text-off-white hover:bg-off-white hover:text-coral transition-colors"
                data-track="proof_final_apply"
              >
                Apply for coaching
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 text-off-white/70 text-sm">
              <Link
                href="/case-studies"
                className="underline hover:text-off-white transition-colors"
                data-track="proof_final_case_studies"
              >
                Read the long-form case studies
              </Link>
              <span className="hidden sm:inline">·</span>
              <Link
                href="/find-your-fit"
                className="underline hover:text-off-white transition-colors"
                data-track="proof_final_find_your_fit"
              >
                Find your fit
              </Link>
              <span className="hidden sm:inline">·</span>
              <Link
                href="/community/not-done-yet"
                className="underline hover:text-off-white transition-colors"
                data-track="proof_final_ndy"
              >
                Explore Not Done Yet
              </Link>
            </div>
            <p className="text-off-white/55 text-xs mt-6 max-w-md mx-auto">
              All coaching reviewed personally by Anthony Walsh. $195/month.
              7-day free trial. Cancel anytime.
            </p>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
