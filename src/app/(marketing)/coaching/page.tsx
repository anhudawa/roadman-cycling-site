import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { getTestimonialsByName } from "@/lib/testimonials";
import { BeforeAfterMetrics, type MetricRow } from "@/components/proof";
import { JourneyBlock } from "@/components/journey";
import { SEGMENT_DISPLAY_ORDER } from "@/lib/coaching-segments";
import { ChoosePath } from "@/components/features/routing/ChoosePath";

export const metadata: Metadata = {
  title: "Online Cycling Coach — Evidence-Based Coaching | $195/month",
  description:
    "Evidence-based cycling coaching for serious amateur and masters cyclists. Personalised plans built on 1,400+ expert podcast conversations. Training, nutrition, strength, recovery, and community. Trusted by cyclists in Ireland, UK, and USA.",
  keywords: [
    "cycling coach",
    "cycling coaching",
    "online cycling coach",
    "cycling coaching program",
    "personalised cycling training plan",
    "cycling coach ireland",
    "cycling coach uk",
    "best online cycling coach",
  ],
  alternates: {
    canonical: "https://roadmancycling.com/coaching",
  },
  openGraph: {
    title: "Online Cycling Coach — Personalised Coaching | $195/month",
    description:
      "Personalised cycling coaching built on 1,400+ expert podcast conversations. Training, nutrition, strength, recovery, and community.",
    type: "website",
    url: "https://roadmancycling.com/coaching",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

const results = [
  {
    stat: "+90w",
    label: "FTP gain",
    name: "Damien Maloney",
    detail: "205w → 295w",
  },
  {
    stat: "3 → 1",
    label: "Category jump",
    name: "Daniel Stone",
    detail: "Roadman Cycling Club",
  },
  {
    stat: "+15%",
    label: "FTP gain at age 52",
    name: "Brian Morrissey",
    detail: "230w → 265w",
  },
];

// Editorial choice — four different persona angles for the 'IN THEIR
// WORDS' row (plateau, comeback, body composition, data-backed
// expertise). Pulled from the central testimonials library so any quote
// update ripples across /coaching, /apply, /you/<slug>, etc.
const voiceTestimonials = getTestimonialsByName([
  "Damien Maloney",
  "David Lundy",
  "Chris O'Connor",
  "Rob Capps",
]);

const pillars = [
  {
    number: "01",
    title: "Training",
    description:
      "Personalised TrainingPeaks plans built around your life, your goals, and your data. Adjusted weekly based on how you actually responded — not how an algorithm predicted you would.",
  },
  {
    number: "02",
    title: "Nutrition",
    description:
      "Race weight, fuelling strategy, and body composition guidance. Not calorie counting — practical nutrition that makes a measurable difference to your power-to-weight ratio.",
  },
  {
    number: "03",
    title: "Strength",
    description:
      "Cycling-specific S&C programming that transfers directly to the bike. Periodised with your riding so you get stronger without wrecking your legs.",
  },
  {
    number: "04",
    title: "Recovery",
    description:
      "Sleep optimisation, stress management, and adaptation protocols. The part most cyclists ignore — and the part that determines whether training actually sticks.",
  },
  {
    number: "05",
    title: "Community",
    description:
      "Weekly coaching calls, a private group of serious cyclists, and 1:1 plan reviews. The reason this works when apps and solo plans don't — you're surrounded by people who know your situation and are watching.",
  },
];

const faqItems = [
  {
    question: "Is a cycling coach worth it?",
    answer:
      "A cycling coach is worth it when you have been training consistently for 1-2 years and stopped improving, when you cannot figure out why your FTP has plateaued, or when you need structured accountability. Our members typically see measurable improvements within 8-12 weeks. At $195 per month, coaching costs less than a single bike upgrade and delivers better long-term results.",
  },
  {
    question: "How does online cycling coaching work?",
    answer:
      "You get a personalised training plan on TrainingPeaks that adapts weekly based on your data, life context, and how you responded to the previous week. This includes weekly coaching calls, 1:1 plan reviews, nutrition guidance, strength programming, and access to a private community of serious cyclists. Everything is remote — your coach sees more of your training data than an in-person coach ever could.",
  },
  {
    question: "How much does a cycling coach cost?",
    answer:
      "Coaching is $195 per month and includes 1:1 personalised coaching with Anthony Walsh across all five pillars — training, nutrition, strength, recovery, and community. You get a personalised TrainingPeaks plan, weekly coaching calls, and a private community of serious cyclists. Includes a 7-day free trial.",
  },
  {
    question:
      "What is the difference between a cycling app and a cycling coach?",
    answer:
      "A cycling app gives you workouts. A coach gives you a system. Apps cannot adjust for a bad night of sleep, a stressful week at work, or the fact that your knee has been sore since Tuesday. A coach builds your plan around your actual life and adjusts it in real time. That is why our members consistently outperform their app-trained years.",
  },
  {
    question: "Do I need a power meter for coaching?",
    answer:
      "A power meter makes coaching significantly more effective because it gives your coach objective data to work with. However, it is not required to start. Many of our members begin with heart rate and RPE and add a power meter later. We will help you get the most out of whatever setup you have.",
  },
  {
    question: "Can I get coaching if I only ride 6-8 hours per week?",
    answer:
      "Yes — in fact, time-limited cyclists benefit the most from coaching. When you only have 6-8 hours, every session needs to count. A coach ensures you are doing the right work at the right intensity instead of accumulating junk miles. Several of our strongest results come from riders training under 8 hours per week.",
  },
  {
    question: "Do you coach cyclists in Ireland, the UK, and the USA?",
    answer:
      "Yes. Roadman Cycling is based in Dublin, Ireland, and coaches cyclists across Ireland, the UK, the USA, and worldwide. All coaching is delivered online through TrainingPeaks, Zoom, and our private community platform. Time zones are never an issue — coaching calls are scheduled flexibly and all communication is asynchronous-first.",
  },
];

// Before/after metric ladder pulled from real coached athletes. Mirrors
// the testimonial wins above as a scannable numerical proof block.
const memberMetrics: MetricRow[] = [
  {
    label: "FTP — Damien Maloney",
    before: "205w",
    after: "295w",
    delta: "+90w over the coached programme",
  },
  {
    label: "20-min power — Blair Corey",
    before: "236w",
    after: "296w",
    delta: "+60w in 3 months on NDY",
  },
  {
    label: "Body weight — Chris O'Connor",
    before: "84kg",
    after: "68kg",
    delta: "-16kg, body fat 20% → 7%",
  },
  {
    label: "Race category — Daniel Stone",
    before: "Cat 3",
    after: "Cat 1",
    delta: "One coached season",
  },
  {
    label: "FTP at 52 — Brian Morrissey",
    before: "230w",
    after: "265w",
    delta: "+15% — 4 w/kg at 52, training less",
  },
  {
    label: "Body weight — Gregory Gross",
    before: "315 lbs",
    after: "<100 kg",
    delta: "Lowest weight in 15 years",
  },
];

const testimonials = [
  {
    quote:
      "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I've gotten much more out of Roadman than I ever imagined.",
    name: "Damien Maloney",
    detail: "FTP: 205w → 295w",
  },
  {
    quote:
      "The system took me from Cat 3 to Cat 1. The structured approach changed everything about how I train and race.",
    name: "Daniel Stone",
    detail: "Roadman Cycling Club",
  },
  {
    quote:
      "This really works. I'm training so much less than last year, at lower intensities and not getting sick. FTHR up from 175 to 180, peak HR up to 193.",
    name: "Brian Morrissey",
    detail: "Age 52, shift worker",
  },
  {
    quote:
      "From 315lbs to sub-100kg, and I'm still going. The accountability and structure changed my life — not just my cycling.",
    name: "Gregory Gross",
    detail: "USA",
  },
];

export default function CoachingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Roadman Cycling Coaching",
          description:
            "Personalised online cycling coaching across five pillars: training, nutrition, strength, recovery, and community. Built on 1,400+ expert podcast conversations.",
          serviceType: "Online Cycling Coaching",
          // The service is offered by the Roadman Cycling organisation;
          // the head coach (Anthony) is the named provider of the Course
          // schema below. Splitting org/coach by relationship lets Google
          // resolve the brand entity for SERP and the human expert for
          // E-E-A-T separately.
          provider: { "@id": ENTITY_IDS.organization },
          brand: { "@id": ENTITY_IDS.organization },
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
            availability: "https://schema.org/InStock",
            url: "https://roadmancycling.com/apply",
          },
          // Testimonials render on the page but are NOT marked up as
          // schema.org/Review — Google requires reviewRating on every
          // Review, and we collect narrative testimonials not star ratings.
          // Emitting Review without reviewRating triggers the structured-
          // data spam policy. Re-add with real ratings if we ever collect them.
        }}
      />
      {/* Course schema — structured coaching programme with instructor + delivery mode */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: "Roadman Cycling — Not Done Yet Coaching Community",
          description:
            "Structured online cycling coaching programme covering training, nutrition, strength, recovery, and community. Delivered via TrainingPeaks, weekly coaching calls, and a private community of serious cyclists.",
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
                EVIDENCE-BASED CYCLING COACHING
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                STOP GUESSING.
                <br />
                <span className="text-coral">START PROGRESSING.</span>
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                Evidence-based coaching for serious amateur and masters
                cyclists. Personalised plans built on 1,400+ conversations with
                the world&apos;s best coaches and scientists — Seiler, Lorang,
                LeMond, Friel — structured into your week so every session
                counts.
              </p>

              {/* Hero proof point — single killer stat + quote, above the fold */}
              <div className="relative mx-auto max-w-2xl mb-10">
                <div className="rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/10 via-deep-purple/30 to-deep-purple/50 px-6 py-6 md:px-10 md:py-7 text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-7">
                    <div className="shrink-0 text-center md:text-left">
                      <p
                        className="font-heading text-coral leading-none"
                        style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
                      >
                        +90w
                      </p>
                      <p className="text-xs font-body tracking-widest text-foreground-subtle uppercase mt-1">
                        FTP gain
                      </p>
                    </div>
                    <div className="h-px md:h-14 md:w-px bg-white/10 shrink-0" />
                    <div>
                      <p className="text-off-white italic leading-relaxed text-base md:text-lg">
                        &ldquo;I was an average sportive rider who had plateaued.
                        Roadman custom built a plan to achieve my goals. I&apos;ve
                        gotten much more out of it than I ever imagined.&rdquo;
                      </p>
                      <p className="text-foreground-subtle text-sm mt-3">
                        <span className="text-off-white font-medium">Damien Maloney</span>
                        &nbsp;· Ireland · 205w &rarr; 295w
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button
                  href="/apply"
                  size="lg"
                  dataTrack="coaching_hub_hero_apply"
                >
                  Apply for Coaching
                </Button>
                <Button href="#how-it-works" variant="ghost" size="lg">
                  See How It Works
                </Button>
              </div>
              <p className="text-foreground-subtle text-sm">
                $195/month. 7-day free trial. Cancel anytime.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* Results */}
        <Section background="charcoal" id="real-results">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                REAL RESULTS FROM REAL CYCLISTS
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Not influencers. Not pros. Everyday cyclists with jobs, families,
                and limited training hours.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              {results.map((r, i) => (
                <ScrollReveal key={r.name} direction="up" delay={i * 0.1}>
                  <Card
                    className="p-8 text-center h-full"
                    glass
                    hoverable={false}
                  >
                    <p className="font-heading text-5xl text-coral mb-2">
                      {r.stat}
                    </p>
                    <p className="text-off-white font-medium mb-1">
                      {r.label}
                    </p>
                    <p className="text-xs text-foreground-subtle">{r.name}</p>
                    <p className="text-xs text-foreground-subtle">{r.detail}</p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>

            {/* In-their-words testimonial row — four different persona
                angles (plateau, comeback, body comp, data-backed
                expertise) with full quotes so prospects can self-identify
                with a specific case. */}
            <ScrollReveal direction="up" className="text-center mb-8">
              <p className="font-heading text-coral text-sm tracking-widest">
                IN THEIR WORDS
              </p>
              <p className="text-foreground-subtle text-xs mt-2">
                Or read the full{" "}
                <Link
                  href="/case-studies"
                  className="text-coral hover:text-coral/80 transition-colors underline-offset-2 hover:underline"
                  data-track="coaching_to_case_studies"
                >
                  athlete case studies
                </Link>{" "}
                — starting point, intervention, outcome, caveats.
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {voiceTestimonials.map((t, i) => (
                <ScrollReveal key={t.name} direction="up" delay={i * 0.08}>
                  <Card
                    className="p-6 md:p-7 h-full flex flex-col"
                    glass
                    hoverable={false}
                  >
                    <div className="inline-flex items-center self-start mb-4 px-2.5 py-1 rounded-full bg-coral/10 border border-coral/20">
                      <span className="text-coral text-[10px] font-heading tracking-widest">
                        {t.tag}
                      </span>
                    </div>
                    <p className="text-off-white italic text-sm leading-relaxed mb-5 flex-1">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div>
                      <p className="text-off-white font-medium text-sm">
                        {t.name}
                      </p>
                      <p className="text-foreground-subtle text-xs mt-0.5">
                        {t.detail}
                      </p>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>

            {/* Member before/after ladder — pulled from the central
                testimonial library, rendered as a scannable metrics
                block to complement the narrative quotes above. */}
            <ScrollReveal direction="up" className="mt-16 max-w-4xl mx-auto">
              <BeforeAfterMetrics
                metrics={memberMetrics}
                eyebrow="MEASURED CHANGE"
                title="What members move in their first 6-12 months"
                subtitle="Personal records, race categories, body composition. Plus the bit that's harder to measure — getting their cycling identity back."
              />
            </ScrollReveal>
          </Container>
        </Section>

        {/* The Problem */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <ScrollReveal direction="left">
                <h2
                  className="font-heading text-off-white mb-6"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  <GradientText as="span">
                    MOST CYCLISTS PLATEAU AFTER 2-3 YEARS.
                  </GradientText>
                </h2>
                <div className="space-y-4 text-foreground-muted leading-relaxed">
                  <p>
                    You bought the power meter. Downloaded the training app. Did
                    the intervals. And it worked — for a while. Then the gains
                    stopped, motivation dipped, and you started wondering whether
                    this is just your ceiling.
                  </p>
                  <p>
                    It&apos;s not. The problem isn&apos;t effort — it&apos;s
                    structure. Training apps give you workouts. They can&apos;t
                    adjust for a bad night of sleep, a stressful week at work, or
                    the fact that your nutrition is quietly undermining everything
                    else.
                  </p>
                  <p className="text-off-white font-medium">
                    A coach sees the whole picture. That&apos;s why coaching
                    works when apps stop working.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <Card className="p-6" hoverable={false}>
                  <h3 className="font-heading text-lg text-off-white mb-4">
                    WHY A CYCLING COACH?
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Plans that adapt weekly based on your data and life context",
                      "Nutrition guidance that targets your power-to-weight ratio",
                      "Strength programming periodised with your riding",
                      "Recovery protocols that let training actually stick",
                      "A private community of serious cyclists that keeps you consistent through bad weeks",
                      "Expert knowledge from 1,400+ podcast conversations distilled into your plan",
                    ].map((item) => (
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
        <div className="relative h-[25vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-coral/20 via-deep-purple to-charcoal" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,107,74,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.2),transparent_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-heading text-off-white/10 text-[8rem] md:text-[12rem] select-none tracking-tighter leading-none">
              COACH
            </p>
          </div>
        </div>

        {/* Five Pillars */}
        <Section background="charcoal" id="how-it-works">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-16">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE FIVE-PILLAR SYSTEM
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Most coaching is just a training plan. Ours covers everything
                that determines whether you actually get faster.
              </p>
            </ScrollReveal>

            <div className="max-w-4xl mx-auto space-y-4">
              {pillars.map((item, i) => (
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

        {/* Who This Is For */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                IS COACHING RIGHT FOR YOU?
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
                    {[
                      "Have been riding 1-2+ years and stopped improving",
                      "Train consistently but can't break through your FTP plateau",
                      "Want structure but don't know how to build a proper plan",
                      "Have limited hours and need every session to count",
                      "Are over 40 and feel the gains getting harder to find",
                      "Have tried apps and self-coaching and hit a wall",
                    ].map((item) => (
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
                    {[
                      "Are brand new to cycling (start with our free Clubhouse first)",
                      "Already have a coach you're happy with",
                      "Just want a generic plan to follow without feedback",
                    ].map((item) => (
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

        {/* Testimonials */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                FROM CYCLISTS WHO&apos;VE DONE IT
              </h2>
            </ScrollReveal>

            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <ScrollReveal
                  key={t.name}
                  direction={i % 2 === 0 ? "left" : "right"}
                >
                  <Card className="p-6" glass hoverable={false}>
                    <p className="text-foreground-muted italic leading-relaxed mb-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-coral font-heading tracking-wider">
                        {t.name.toUpperCase()}
                      </p>
                      <p className="text-xs text-foreground-subtle">
                        &middot; {t.detail}
                      </p>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Coaching by segment — entry points to the 10 segment pages */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                COACHING BY SEGMENT
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                FIND THE COACHING THAT FITS YOU
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Same five-pillar system. Periodised differently depending on
                who you are and what you&apos;re training for.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SEGMENT_DISPLAY_ORDER.map((s) => (
                <Link
                  key={s.slug}
                  href={`/coaching/${s.slug}`}
                  className="group block p-5 rounded-lg bg-white/5 hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all"
                >
                  <p className="font-heading text-base text-off-white group-hover:text-coral transition-colors tracking-wide mb-1">
                    {s.label.toUpperCase()}
                  </p>
                  <p className="text-xs text-foreground-subtle leading-relaxed">
                    {s.tagline}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        {/* Triathlon-specific entry point */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <Card className="p-8 md:p-10 text-center" glass hoverable={false}>
                <p className="text-coral font-heading text-xs tracking-widest mb-4">
                  FOR TRIATHLETES
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  RACING A 70.3 OR IRONMAN?
                </h2>
                <p className="text-foreground-muted max-w-xl mx-auto mb-6 leading-relaxed">
                  The bike leg is where age-group races are won and lost — and
                  where most run legs fall apart. Our{" "}
                  <Link
                    href="/coaching/triathlon"
                    className="text-coral hover:text-coral/80 transition-colors"
                  >
                    triathlon bike coaching
                  </Link>{" "}
                  programme is built to make you faster on the bike without
                  ruining your run.
                </p>
                <Button
                  href="/coaching/triathlon"
                  size="lg"
                  dataTrack="coaching_hub_to_triathlon_pillar"
                >
                  Triathlon Bike Coaching →
                </Button>
              </Card>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Geographic trust */}
        <Section background="deep-purple" grain>
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                COACHING CYCLISTS WORLDWIDE
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto mb-8 leading-relaxed">
                Based in Dublin, Ireland. Coaching cyclists across Ireland, the
                UK, the USA, and beyond. All coaching is delivered online — your
                location is never a barrier to getting faster.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/coaching/ireland"
                  className="px-6 py-3 rounded-lg bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white transition-colors font-heading text-sm tracking-wider"
                >
                  IRELAND
                </Link>
                <Link
                  href="/coaching/uk"
                  className="px-6 py-3 rounded-lg bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white transition-colors font-heading text-sm tracking-wider"
                >
                  UNITED KINGDOM
                </Link>
                <Link
                  href="/coaching/usa"
                  className="px-6 py-3 rounded-lg bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white transition-colors font-heading text-sm tracking-wider"
                >
                  UNITED STATES
                </Link>
              </div>
              <p className="text-foreground-subtle text-xs mt-8 mb-4 tracking-wider font-heading">
                OR BY CITY
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { href: "/coaching/dublin", label: "DUBLIN" },
                  { href: "/coaching/cork", label: "CORK" },
                  { href: "/coaching/galway", label: "GALWAY" },
                  { href: "/coaching/belfast", label: "BELFAST" },
                  { href: "/coaching/london", label: "LONDON" },
                  { href: "/coaching/manchester", label: "MANCHESTER" },
                  { href: "/coaching/leeds", label: "LEEDS" },
                  { href: "/coaching/edinburgh", label: "EDINBURGH" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="px-4 py-2 rounded-lg bg-white/5 text-foreground-subtle hover:bg-white/10 hover:text-off-white transition-colors font-heading text-xs tracking-wider"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Blog cluster — coaching-pillar articles for internal link equity */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-10">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                FROM THE BLOG
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Training science, coaching methodology, and what actually
                moves the needle for serious amateurs.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  href: "/blog/polarised-vs-sweet-spot-training",
                  title: "Polarised vs Sweet Spot: What the Science Says",
                },
                {
                  href: "/blog/is-a-cycling-coach-worth-it",
                  title: "Is a Cycling Coach Worth It? Cost-Benefit Analysis",
                },
                {
                  href: "/blog/is-a-cycling-coach-worth-it-case-study",
                  title: "Is a Cycling Coach Worth It? (Cat-3 to Cat-1 Case Study)",
                },
                {
                  href: "/blog/trainerroad-vs-online-cycling-coach",
                  title: "TrainerRoad vs Online Cycling Coach",
                },
                {
                  href: "/blog/time-crunched-cyclist-8-hours-week",
                  title: "How to Train on 8 Hours a Week",
                },
                {
                  href: "/blog/how-to-structure-cycling-training-plan",
                  title: "How to Structure a Cycling Training Plan",
                },
                {
                  href: "/blog/how-to-periodise-cycling-season",
                  title: "How to Periodise a Cycling Season",
                },
                {
                  href: "/blog/age-group-ftp-benchmarks-2026",
                  title: "Age-Group FTP Benchmarks 2026",
                },
                {
                  href: "/blog/masters-cyclist-guide-getting-faster-after-40",
                  title: "Getting Faster After 40: The Masters Guide",
                },
              ].map((article) => (
                <Link
                  key={article.href}
                  href={article.href}
                  className="block p-4 rounded-lg bg-white/5 hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all group"
                >
                  <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors tracking-wide">
                    {article.title.toUpperCase()}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        {/* Funnel-aware next steps — for visitors who've read the
            page but aren't ready to apply yet. Routes them to the
            methodology, real results, or the apply funnel. */}
        <Section background="charcoal">
          <Container width="narrow">
            <JourneyBlock
              stage="coaching"
              source="coaching-page"
              eyebrow="NOT READY YET?"
              heading="DECIDE FROM EVIDENCE — NOT FROM A SALES PAGE."
            />
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

            <FAQSchema faqs={faqItems} />

            <div className="space-y-4">
              {faqItems.map((item, i) => (
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

        {/* Choose Your Path — final routing for visitors who've read the
            full coaching pitch but aren't ready to apply. Gives free
            tool / newsletter / Ask Roadman exits before the final
            coral CTA so hesitant visitors stay on-site instead of
            bouncing. Light variant to break up the dark sections. */}
        <ChoosePath
          variant="light"
          source="coaching"
          eyebrow="NOT COACHING TODAY?"
          heading="PICK A DIFFERENT WAY IN."
          subheading="Coaching isn't the only path. If you're not ready, start with a free tool, the newsletter, or a question for Anthony."
        />

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
              7-day free trial. Five pillars. Personalised to your goals, your
              schedule, and your life. Cancel anytime.
            </p>
            {/* Inline coloured Link instead of Button: the Button variants
                always set a bg-* class that collides with our overrides at
                equal specificity in Tailwind v4, making the button
                invisible-until-hover on the coral section. */}
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-off-white text-coral hover:bg-off-white/90 shadow-lg"
              style={{ transitionDuration: "var(--duration-fast)" }}
              data-track="coaching_hub_footer_apply"
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
