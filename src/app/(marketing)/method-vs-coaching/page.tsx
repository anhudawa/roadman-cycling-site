import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN, BRAND_STATS } from "@/lib/brand-facts";
import { getTestimonialsByName } from "@/lib/testimonials";
import {
  COURSE_PRICE_STANDARD_USD,
  COURSE_PRICE_PREMIUM_USD,
} from "@/app/(method)/method/_components/sales/data";

/**
 * /method-vs-coaching — positioning page that helps a visitor
 * self-select between the two paid Roadman products:
 *
 *  - The Roadman Method ($297 one-time, Premium $397): a finite,
 *    self-paced 12-week course you complete on your own and keep for
 *    life. You become your own coach.
 *  - Not Done Yet Coaching ($195/mo): the ongoing coaching community —
 *    personalised TrainingPeaks plans, weekly live calls with Anthony,
 *    accountability, the people who keep you in it.
 *
 * They are not competitors — they're two answers to "how much
 * structure and accountability do I need?". This page draws the line
 * cleanly so a self-starter buys the course and a rider who needs a
 * coach in their corner joins the community. Modelled on the depth of
 * /apps-vs-coaching. Method CTA → /method, NDY CTA →
 * /community/not-done-yet.
 */

const PAGE_PATH = "/method-vs-coaching";
const PAGE_URL = `${SITE_ORIGIN}${PAGE_PATH}`;

type Axis = {
  axis: string;
  method: string;
  coaching: string;
};

const COMPARISON_ROWS: readonly Axis[] = [
  {
    axis: "What it is",
    method:
      "A finite, self-paced 12-week course. Twelve video modules, twelve written companions, every worksheet and TrainingPeaks plan. You finish it and keep it.",
    coaching:
      "An ongoing coaching relationship and community. Personalised plans, weekly live calls with Anthony, and the accountability of riders training the same way.",
  },
  {
    axis: "Price",
    method: `$${COURSE_PRICE_STANDARD_USD} once (Premium $${COURSE_PRICE_PREMIUM_USD}). Lifetime access, no subscription.`,
    coaching: "$195/month. Cancel anytime. 7-day free trial.",
  },
  {
    axis: "Who plans your training",
    method:
      "You do — using the framework. By Week 12 you can write your own next block and know why each session exists.",
    coaching:
      "Anthony does — your plan is built around your audit and adjusted as the data comes in, week after week.",
  },
  {
    axis: "Accountability",
    method:
      "Self-directed. The discussion forum and your own discipline carry you. Nobody chases a missed session.",
    coaching:
      "A coach reads your compliance, asks the right question on Monday, and adjusts the block before it falls apart.",
  },
  {
    axis: "Time horizon",
    method:
      "Twelve weeks to ownership. Run it again next season with new goals — every update is included for life.",
    coaching:
      "As long as you want a coach in your corner. Built for the rider who wants the relationship to continue.",
  },
  {
    axis: "Personalisation",
    method:
      "The framework scales to 6–12 hours a week. Premium adds a TrainingPeaks plan built around your audit plus a Week-6 adjustment.",
    coaching:
      "Fully bespoke from day one. Every plan, every adjustment, written for your hours, your event and your recovery profile.",
  },
  {
    axis: "Best if",
    method:
      "You're a self-starter who wants to understand the system, not just be handed sessions — and own it for good.",
    coaching:
      "You want someone reading your data and holding the line, week in week out, so you can just train.",
  },
];

const METHOD_FOR: readonly string[] = [
  "You're disciplined and you finish what you start without being chased.",
  "You want to understand the why behind the training, not just follow it.",
  "You'd rather pay once and own a system than pay monthly forever.",
  "You're happy to be your own coach once you have the framework.",
  "You want to start today, at your own pace, on your own schedule.",
];

const COACHING_FOR: readonly string[] = [
  "You want a coach reading your data and making the calls for you.",
  "Accountability is the thing that's been missing — you train better when someone's watching.",
  "Your life is unpredictable and you want a plan that flexes with you weekly.",
  "You want live calls, direct access, and a community in your corner.",
  "You'd rather invest monthly in the relationship than do it solo.",
];

const FAQ = [
  {
    q: "What's the actual difference between the Method and Not Done Yet?",
    a: `The Method is a product; Not Done Yet is a relationship. The Method ($${COURSE_PRICE_STANDARD_USD} one-time) is a finite 12-week course you complete on your own — you watch the modules, do the work, and walk away able to coach yourself. Not Done Yet ($195/month) is the ongoing coaching community: Anthony writes and adjusts your plan every week, you get live calls, and the people around you keep you accountable. One teaches you the system; the other runs the system with you.`,
  },
  {
    q: "Can I do both?",
    a: "Yes, and plenty of riders do — in either order. Some take the Method first to learn the framework, then join Not Done Yet to keep sharpening it with a coach. Others join the community first, then take the Method to deepen the why behind what they're already doing. They're complementary, not mutually exclusive.",
  },
  {
    q: "Which is cheaper?",
    a: `Over a single season, the Method is far cheaper — one payment of $${COURSE_PRICE_STANDARD_USD} (or $${COURSE_PRICE_PREMIUM_USD} for Premium) and you keep it for life. Not Done Yet is $195/month, so it's a bigger ongoing investment — but you're paying for a coach who reads your data and adjusts your plan every week, not a finite course. The right question isn't which is cheaper; it's how much structure and accountability you actually need.`,
  },
  {
    q: "I've never followed a structured plan before. Where should I start?",
    a: "If you're brand new to structured training and you know you need someone in your corner, Not Done Yet's coaching and accountability will carry you further, faster. If you're a self-starter who reads, researches and follows through on your own, the Method gives you the whole framework to run yourself. Still unsure? The free Plateau Diagnostic at /plateau is a four-minute way to see where you actually are.",
  },
  {
    q: "Does the Method include coaching from Anthony?",
    a: `Not one-to-one coaching, no — that's what Not Done Yet is for. The Method is Anthony's coaching system, taught: the same principles, sessions and structure he uses with clients, packaged so you can run it yourself. Premium ($${COURSE_PRICE_PREMIUM_USD}) adds a personalised TrainingPeaks plan and a written training-data review, but it's still self-paced, not ongoing coaching.`,
  },
  {
    q: "What if I buy the Method and decide I need a coach?",
    a: "That's a common and healthy path. Finish the Method, see how far self-coaching takes you, and if you decide you want the data read for you and the accountability of weekly calls, Not Done Yet is there. Method members get priority access to a Not Done Yet trial, so the step up is easy.",
  },
];

const methodVsCoachingTestimonials = getTestimonialsByName([
  "Damien Maloney",
  "Daniel Stone",
  "David Lundy",
]);

export const metadata: Metadata = {
  title:
    "The Roadman Method vs Not Done Yet Coaching — Which Is Right For You?",
  description:
    "A self-paced 12-week course you own, or ongoing coaching with a coach in your corner? An honest comparison of The Roadman Method ($297 once) and Not Done Yet Coaching ($195/mo) so you can self-select.",
  keywords: [
    "Roadman Method vs coaching",
    "cycling course vs coaching",
    "self-paced cycling training vs coach",
    "Not Done Yet coaching",
    "The Roadman Method",
    "should I get a cycling coach or a course",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title:
      "The Roadman Method vs Not Done Yet Coaching — Which Is Right For You?",
    description:
      "Self-paced course you own, or ongoing coaching in your corner? An honest comparison so you can self-select.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: `${SITE_ORIGIN}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "The Roadman Method vs Not Done Yet Coaching — Roadman Cycling",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Roadman Method vs Not Done Yet Coaching",
    description:
      "Self-paced course you own, or ongoing coaching in your corner? An honest comparison so you can self-select.",
    images: [`${SITE_ORIGIN}/og-image.jpg`],
  },
  robots: { index: true, follow: true },
};

export default function MethodVsCoachingPage() {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
      {
        "@type": "ListItem",
        position: 2,
        name: "The Roadman Method",
        item: `${SITE_ORIGIN}/method`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Method vs Coaching",
        item: PAGE_URL,
      },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: "The Roadman Method vs Not Done Yet Coaching — Roadman Cycling",
    description:
      "An honest comparison of the self-paced Roadman Method course and ongoing Not Done Yet coaching, to help serious amateur cyclists self-select the right product.",
    isPartOf: { "@id": ENTITY_IDS.website },
    publisher: { "@id": ENTITY_IDS.organization },
    about: {
      "@type": "Thing",
      name: "Self-paced cycling course vs ongoing cycling coaching",
      description:
        "Comparison of The Roadman Method (self-paced 12-week course) versus Not Done Yet (ongoing coaching community) for serious amateur cyclists.",
    },
    inLanguage: "en",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={faqJsonLd} />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container>
            <ScrollReveal direction="up" eager>
              <div className="text-center max-w-4xl mx-auto">
                <p className="text-coral font-heading text-sm tracking-[0.3em] uppercase mb-6">
                  Method vs Coaching
                </p>
                <h1
                  className="font-heading text-off-white uppercase leading-[0.95] mb-6"
                  style={{ fontSize: "var(--text-hero)" }}
                >
                  Learn the system,
                  <br />
                  <span className="text-coral">or run it with a coach.</span>
                </h1>
                <p className="text-foreground-muted text-lg md:text-xl leading-relaxed mb-4">
                  Two ways to train with Roadman. The Method is a finite
                  12-week course you complete on your own and keep for life.
                  Not Done Yet is ongoing coaching &mdash; a coach reading your
                  data and writing your plan, week after week.
                </p>
                <p className="text-off-white text-lg md:text-xl leading-relaxed font-medium mb-10">
                  They&apos;re not competitors. They&apos;re two answers to one
                  question: how much structure and accountability do you
                  actually need?
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <Button
                    href="/method"
                    size="lg"
                    dataTrack="method_vs_coaching_hero_method"
                  >
                    Explore The Method
                  </Button>
                  <Button
                    href="/community/not-done-yet"
                    size="lg"
                    variant="ghost"
                    dataTrack="method_vs_coaching_hero_ndy"
                  >
                    See Not Done Yet Coaching
                  </Button>
                </div>
                <p className="text-foreground-subtle text-sm">
                  Not sure yet? The free Plateau Diagnostic shows you where you
                  actually are in four minutes.
                </p>
              </div>
            </ScrollReveal>

            {/* Two-product price strip */}
            <ScrollReveal direction="up" delay={0.15} className="mt-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div className="text-center border border-coral/40 rounded-lg p-6 bg-coral/[0.04]">
                  <p className="font-heading text-off-white text-lg tracking-wide mb-1">
                    THE ROADMAN METHOD
                  </p>
                  <div className="font-heading text-coral text-3xl md:text-4xl tracking-tight">
                    ${COURSE_PRICE_STANDARD_USD}{" "}
                    <span className="text-base text-foreground-muted">
                      once
                    </span>
                  </div>
                  <p className="text-foreground-subtle text-xs tracking-widest uppercase mt-2">
                    Self-paced &middot; lifetime &middot; you keep it
                  </p>
                </div>
                <div className="text-center border border-white/10 rounded-lg p-6 bg-white/[0.02]">
                  <p className="font-heading text-off-white text-lg tracking-wide mb-1">
                    NOT DONE YET COACHING
                  </p>
                  <div className="font-heading text-coral text-3xl md:text-4xl tracking-tight">
                    $195{" "}
                    <span className="text-base text-foreground-muted">
                      / month
                    </span>
                  </div>
                  <p className="text-foreground-subtle text-xs tracking-widest uppercase mt-2">
                    Ongoing &middot; a coach in your corner
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* The honest framing */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                THE HONEST PART
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                <GradientText as="span">
                  BOTH WORK. THEY WORK DIFFERENTLY.
                </GradientText>
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Both are built on the same foundation &mdash;{" "}
                {BRAND_STATS.episodeCountLabel} on-the-record conversations with
                World Tour coaches, sports scientists and pro riders. The
                difference isn&apos;t the quality of the thinking. It&apos;s how
                much of the work you want to do yourself, and whether you want
                someone reading your data and holding you to it.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Side-by-side comparison */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                LINE BY LINE
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE TWO, COMPARED
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Same coaching brain behind both. Here&apos;s where they
                diverge.
              </p>
            </ScrollReveal>

            {/* Column headers — sticky on desktop scroll within the grid */}
            <div className="hidden md:grid md:grid-cols-[160px_1fr_1fr] gap-4 mb-3">
              <div />
              <p className="font-heading text-off-white text-sm tracking-widest text-center border-b border-coral/40 pb-3">
                THE METHOD
              </p>
              <p className="font-heading text-off-white text-sm tracking-widest text-center border-b border-white/15 pb-3">
                NOT DONE YET
              </p>
            </div>

            <div className="space-y-3">
              {COMPARISON_ROWS.map((row, i) => (
                <ScrollReveal key={row.axis} direction="up" delay={i * 0.04}>
                  <div className="grid md:grid-cols-[160px_1fr_1fr] gap-3 md:gap-4 items-stretch">
                    <div className="flex items-center">
                      <p className="font-heading text-coral text-xs tracking-widest uppercase">
                        {row.axis}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-coral/[0.06] border border-coral/30">
                      <p className="md:hidden font-heading text-off-white text-[11px] tracking-widest mb-1.5">
                        THE METHOD
                      </p>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {row.method}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/[0.04] border border-white/10">
                      <p className="md:hidden font-heading text-off-white text-[11px] tracking-widest mb-1.5">
                        NOT DONE YET
                      </p>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {row.coaching}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Self-select cards */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                SELF-SELECT
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHICH ONE IS YOU?
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                Read both lists honestly. The one you nod along to more is your
                answer.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-5">
              <ScrollReveal direction="up">
                <Card
                  className="p-7 md:p-8 h-full border-2 border-coral/50 bg-coral/[0.04] flex flex-col"
                  hoverable={false}
                >
                  <p className="font-heading text-coral text-xs tracking-widest mb-2">
                    SELF-PACED COURSE
                  </p>
                  <h3 className="font-heading text-2xl text-off-white tracking-wide mb-1">
                    THE ROADMAN METHOD
                  </h3>
                  <p className="font-heading text-off-white text-lg mb-5">
                    ${COURSE_PRICE_STANDARD_USD}{" "}
                    <span className="text-sm text-foreground-muted">
                      once &middot; lifetime
                    </span>
                  </p>
                  <p className="text-foreground-subtle text-xs tracking-widest uppercase mb-4">
                    Choose the Method if
                  </p>
                  <ul className="space-y-3 flex-1 mb-8">
                    {METHOD_FOR.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-foreground-muted leading-relaxed flex gap-2.5"
                      >
                        <span className="text-coral shrink-0 mt-0.5">›</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    href="/method"
                    size="lg"
                    className="w-full"
                    dataTrack="method_vs_coaching_card_method"
                  >
                    Explore The Method
                  </Button>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.08}>
                <Card
                  className="p-7 md:p-8 h-full flex flex-col"
                  hoverable={false}
                >
                  <p className="font-heading text-coral text-xs tracking-widest mb-2">
                    ONGOING COACHING
                  </p>
                  <h3 className="font-heading text-2xl text-off-white tracking-wide mb-1">
                    NOT DONE YET
                  </h3>
                  <p className="font-heading text-off-white text-lg mb-5">
                    $195{" "}
                    <span className="text-sm text-foreground-muted">
                      / month &middot; cancel anytime
                    </span>
                  </p>
                  <p className="text-foreground-subtle text-xs tracking-widest uppercase mb-4">
                    Choose Coaching if
                  </p>
                  <ul className="space-y-3 flex-1 mb-8">
                    {COACHING_FOR.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-foreground-muted leading-relaxed flex gap-2.5"
                      >
                        <span className="text-coral shrink-0 mt-0.5">›</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    href="/community/not-done-yet"
                    size="lg"
                    variant="ghost"
                    className="w-full"
                    dataTrack="method_vs_coaching_card_ndy"
                  >
                    See Not Done Yet
                  </Button>
                </Card>
              </ScrollReveal>
            </div>

            <ScrollReveal direction="up" className="text-center mt-10">
              <p className="text-foreground-muted text-sm max-w-xl mx-auto leading-relaxed">
                Nodding along to both? Plenty of riders do the Method first,
                then join Not Done Yet to keep sharpening it. You don&apos;t
                have to choose forever &mdash; just choose where to start.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Testimonials */}
        {methodVsCoachingTestimonials.length > 0 && (
          <Section background="deep-purple" grain>
            <Container width="narrow">
              <ScrollReveal direction="up" className="text-center mb-12">
                <p className="text-coral font-heading text-xs tracking-widest mb-3">
                  IN THEIR WORDS
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  RIDERS WHO PICKED A LANE
                </h2>
                <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                  Real members. Real numbers. None of these are paid.
                </p>
              </ScrollReveal>

              <div className="grid md:grid-cols-3 gap-4">
                {methodVsCoachingTestimonials.map((t, i) => (
                  <ScrollReveal key={t.name} direction="up" delay={i * 0.06}>
                    <Card
                      className="p-6 h-full border-l-2 border-l-coral"
                      hoverable={false}
                    >
                      {t.stat && (
                        <div className="mb-4">
                          <div className="font-heading text-coral text-2xl tracking-tight">
                            {t.stat}
                          </div>
                          <div className="text-foreground-subtle text-[10px] tracking-widest uppercase">
                            {t.statLabel}
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-off-white italic leading-relaxed mb-4">
                        &ldquo;{t.shortQuote ?? t.quote}&rdquo;
                      </p>
                      <p className="font-heading text-xs text-off-white tracking-wider">
                        {t.name.toUpperCase()}
                      </p>
                      <p className="text-foreground-subtle text-xs leading-relaxed mt-1">
                        {t.detail}
                      </p>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal direction="up" className="text-center mt-10">
                <Link
                  href="/results"
                  className="inline-flex items-center gap-2 text-sm text-foreground-subtle hover:text-coral transition-colors font-heading tracking-wider"
                >
                  MORE RESULTS →
                </Link>
              </ScrollReveal>
            </Container>
          </Section>
        )}

        {/* FAQ */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                COMMON QUESTIONS
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                METHOD VS COACHING, ANSWERED
              </h2>
            </ScrollReveal>

            <div className="space-y-4">
              {FAQ.map((item, i) => (
                <ScrollReveal key={item.q} direction="up" delay={i * 0.05}>
                  <details className="group p-6 rounded-lg bg-white/[0.03] border border-white/10 hover:border-coral/30 transition-all">
                    <summary className="cursor-pointer flex items-start justify-between gap-4 list-none">
                      <h3 className="font-heading text-base md:text-lg text-off-white tracking-wide">
                        {item.q.toUpperCase()}
                      </h3>
                      <span className="shrink-0 text-coral text-2xl leading-none transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 text-sm text-foreground-muted leading-relaxed">
                      {item.a}
                    </p>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Final CTA */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              PICK WHERE YOU START.
            </h2>
            <p className="text-off-white/85 max-w-lg mx-auto mb-8 text-lg">
              Own the system in twelve weeks, or put a coach in your corner for
              as long as you want one. Either way, you stop guessing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/method"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-off-white text-coral hover:bg-off-white/90 shadow-lg"
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track="method_vs_coaching_footer_method"
              >
                Explore The Method
              </Link>
              <Link
                href="/community/not-done-yet"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-transparent border-2 border-off-white/40 text-off-white hover:bg-off-white/10 hover:border-off-white"
                style={{ transitionDuration: "var(--duration-fast)" }}
                data-track="method_vs_coaching_footer_ndy"
              >
                Not Done Yet Coaching
              </Link>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
