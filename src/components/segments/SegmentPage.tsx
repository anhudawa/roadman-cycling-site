import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";
import { FAQSchema } from "@/components/seo/FAQSchema";
import {
  type SegmentData,
  SEGMENT_DISPLAY_ORDER,
} from "@/lib/coaching-segments";

interface Props {
  data: SegmentData;
}

/**
 * Shared template for /coaching/<segment> landing pages. Each segment
 * data file in src/lib/coaching-segments.ts feeds this component. Edit
 * data there for content; edit this component for layout/structure.
 */
export function SegmentPage({ data }: Props) {
  const otherSegments = SEGMENT_DISPLAY_ORDER.filter(
    (s) => s.slug !== data.slug,
  ).slice(0, 6);

  return (
    <>
      {/* Service schema */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Roadman Cycling — ${data.serviceType}`,
          description: data.seoDescription,
          serviceType: data.serviceType,
          provider: { "@id": ENTITY_IDS.person },
          areaServed: [
            { "@type": "Country", name: "Ireland" },
            { "@type": "Country", name: "United Kingdom" },
            { "@type": "Country", name: "United States" },
          ],
          offers: {
            "@type": "Offer",
            name: "Not Done Yet Coaching Community — Personalised Coaching",
            price: "195",
            priceCurrency: "USD",
            description:
              "1:1 personalised coaching across training, nutrition, strength, recovery, and community",
          },
        }}
      />

      {/* Course schema — structured coaching programme for the segment */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: `${data.serviceType} Programme`,
          description: data.seoDescription,
          provider: { "@id": ENTITY_IDS.organization },
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "Online",
            courseWorkload: "PT8H",
            instructor: { "@id": ENTITY_IDS.person },
          },
          offers: {
            "@type": "Offer",
            price: "195",
            priceCurrency: "USD",
            category: "Monthly subscription",
          },
        }}
      />

      {/* Breadcrumb */}
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
              name: "Coaching",
              item: "https://roadmancycling.com/coaching",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: data.h1,
              item: `https://roadmancycling.com/coaching/${data.slug}`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-6">
                {data.heroEyebrow}
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {data.h1.toUpperCase()}
                <br />
                <span className="text-coral">{data.heroAccent}</span>
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                {data.directAnswer}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button
                  href="/apply"
                  size="lg"
                  dataTrack={`segment_${data.slug}_hero_apply`}
                >
                  Apply for Coaching
                </Button>
                <Button href="#how-it-works" variant="ghost" size="lg">
                  How It Works
                </Button>
              </div>
              <p className="text-foreground-subtle text-sm">
                $195/month. 7-day free trial. Cancel anytime.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* The Problem */}
        <Section background="charcoal">
          <Container width="narrow">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <ScrollReveal direction="left">
                <h2
                  className="font-heading text-off-white mb-6"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  <GradientText as="span">
                    THE PROBLEM MOST RIDERS IN THIS SPOT FACE.
                  </GradientText>
                </h2>
                <div className="space-y-4 text-foreground-muted leading-relaxed">
                  {data.problem.map((para, i) => (
                    <p
                      key={i}
                      className={
                        i === data.problem.length - 1
                          ? "text-off-white font-medium"
                          : ""
                      }
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <Card className="p-6" hoverable={false}>
                  <h3 className="font-heading text-lg text-off-white mb-4">
                    WHAT CHANGES IN THE COACHING
                  </h3>
                  <ul className="space-y-3">
                    {data.whatChanges.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="text-coral mt-0.5 shrink-0">
                          &#10003;
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* Visual break */}
        <div className="relative h-[20vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-coral/20 via-deep-purple to-charcoal" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,107,74,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.2),transparent_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-heading text-off-white/10 text-[6rem] md:text-[10rem] select-none tracking-tighter leading-none">
              {data.breakerWord}
            </p>
          </div>
        </div>

        {/* Five pillars */}
        <Section background="charcoal" id="how-it-works">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-16">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                HOW THE COACHING WORKS
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                The five pillars adapted for this segment. Same system —
                periodised differently to fit what you actually need.
              </p>
            </ScrollReveal>

            <div className="max-w-4xl mx-auto space-y-4">
              {data.pillars.map((item, i) => (
                <ScrollReveal key={item.title} direction="up" delay={i * 0.06}>
                  <Card
                    className="p-6 card-shimmer group"
                    glass
                    tilt
                    tiltStrength={4}
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                      <div className="shrink-0">
                        <span className="font-heading text-4xl text-coral/40 group-hover:text-coral transition-colors duration-300">
                          {item.number}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-xl text-off-white mb-2 group-hover:text-coral transition-colors duration-300">
                          {item.title.toUpperCase()}
                        </h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Sample week */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                EXAMPLE TRAINING WEEK
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT A WEEK LOOKS LIKE
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto leading-relaxed">
                {data.sampleWeekContext}
              </p>
              <p className="text-foreground-subtle text-sm mt-3 font-heading tracking-wider">
                {data.sampleWeekHours.toUpperCase()}
              </p>
            </ScrollReveal>

            <div className="space-y-3">
              {data.sampleWeek.map((day, i) => (
                <ScrollReveal key={day.day} direction="up" delay={i * 0.04}>
                  <Card className="p-5" hoverable={false}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-start md:items-center">
                      <div className="md:col-span-2">
                        <p className="font-heading text-sm text-coral tracking-wider">
                          {day.day.toUpperCase()}
                        </p>
                      </div>
                      <div className="md:col-span-8">
                        <p className="text-sm text-off-white leading-relaxed">
                          {day.session}
                        </p>
                      </div>
                      <div className="md:col-span-2 md:text-right">
                        <p className="text-xs text-foreground-subtle font-heading tracking-wider">
                          {day.duration.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="up" className="mt-8">
              <p className="text-xs text-foreground-subtle text-center max-w-xl mx-auto leading-relaxed">
                Adjusts weekly based on how you actually responded — power
                trends, HRV, sleep, life context. Built and reviewed in
                TrainingPeaks.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Mistakes to avoid */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                FIXABLE MISTAKES
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                MISTAKES TO AVOID
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                The patterns that hold this segment back the most. Each one
                is fixable — that&apos;s the whole point.
              </p>
            </ScrollReveal>

            <div className="space-y-4">
              {data.mistakes.map((m, i) => (
                <ScrollReveal key={m.title} direction="up" delay={i * 0.05}>
                  <Card
                    className="p-6 border-l-2 border-l-coral"
                    hoverable={false}
                  >
                    <h3 className="font-heading text-lg text-off-white mb-3">
                      {(i + 1).toString().padStart(2, "0")}. {m.title.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {m.description}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Case study */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                CASE STUDY
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT THIS LOOKS LIKE IN PRACTICE
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="up">
              <Card className="p-8 md:p-10" glass hoverable={false}>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-coral font-heading text-xs tracking-widest mb-2">
                      THE RIDER
                    </p>
                    <p className="text-off-white font-heading text-lg mb-1">
                      {data.caseStudy.name.toUpperCase()}
                    </p>
                    <p className="text-foreground-subtle text-sm leading-relaxed">
                      {data.caseStudy.context}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-coral font-heading text-xs tracking-widest mb-2">
                      THE OUTCOME
                    </p>
                    <p className="text-off-white text-base leading-relaxed">
                      {data.caseStudy.result}
                    </p>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-6">
                  <p className="text-off-white italic leading-relaxed text-base md:text-lg">
                    &ldquo;{data.caseStudy.quote}&rdquo;
                  </p>
                  <p className="text-foreground-subtle text-sm mt-3 font-heading tracking-wider">
                    — {data.caseStudy.name.toUpperCase()}
                  </p>
                </div>
              </Card>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Yes / Not */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                IS THIS COACHING RIGHT FOR YOU?
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-8">
              <ScrollReveal direction="left">
                <Card
                  className="p-6 h-full border-l-2 border-l-coral"
                  hoverable={false}
                >
                  <h3 className="font-heading text-lg text-coral mb-4">
                    YES, IF YOU...
                  </h3>
                  <ul className="space-y-3">
                    {data.yesIfYou.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="text-coral mt-0.5 shrink-0">
                          &#10003;
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <Card
                  className="p-6 h-full border-l-2 border-l-foreground-subtle"
                  hoverable={false}
                >
                  <h3 className="font-heading text-lg text-foreground-subtle mb-4">
                    NOT IF YOU...
                  </h3>
                  <ul className="space-y-3">
                    {data.notIfYou.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="text-foreground-subtle mt-0.5 shrink-0">
                          &times;
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* FAQ */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                COMMON QUESTIONS
              </h2>
            </ScrollReveal>

            <FAQSchema faqs={data.faqs} />

            <div className="space-y-4">
              {data.faqs.map((item, i) => (
                <ScrollReveal key={item.question} direction="up" delay={i * 0.06}>
                  <Card className="p-6" hoverable={false}>
                    <h3 className="font-heading text-lg text-off-white mb-3">
                      {item.question.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {item.answer}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Cross-segment links */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-8">
              <h2
                className="font-heading text-off-white mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                COACHING FOR OTHER SEGMENTS
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Same five pillars. Different periodisation depending on who
                you are and what you&apos;re training for.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherSegments.map((s) => (
                <Link
                  key={s.slug}
                  href={`/coaching/${s.slug}`}
                  className="block p-4 rounded-lg bg-white/5 hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all group"
                >
                  <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors tracking-wide mb-1">
                    {s.label.toUpperCase()}
                  </p>
                  <p className="text-xs text-foreground-subtle leading-relaxed">
                    {s.tagline}
                  </p>
                </Link>
              ))}
            </div>

            <ScrollReveal direction="up" className="text-center mt-8">
              <Link
                href="/coaching"
                className="inline-flex items-center gap-2 text-sm text-foreground-subtle hover:text-coral transition-colors font-heading tracking-wider"
              >
                ← BACK TO ALL COACHING
              </Link>
            </ScrollReveal>
          </Container>
        </Section>

        {/* CTA */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              YOUR COACHING STARTS HERE.
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-8">
              7-day free trial. Five pillars. Personalised to your goals,
              your schedule, and your life. Cancel anytime.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-off-white text-coral hover:bg-off-white/90 shadow-lg"
              style={{ transitionDuration: "var(--duration-fast)" }}
              data-track={`segment_${data.slug}_footer_apply`}
            >
              Apply Now
            </Link>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-off-white/60 text-sm">
              <span>$195/month</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>7-day free trial</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Cancel anytime</span>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
