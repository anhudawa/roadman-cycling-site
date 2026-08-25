import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { FitIntegration } from "@/components/features/ndy/FitIntegration";
import {
  TESTIMONIALS,
  getTestimonialsByName,
} from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Not Done Yet — Cycling Coaching Community",
  description:
    "Group coaching at $195/month for cyclists who refuse to plateau. Personalised TrainingPeaks plan, weekly live calls with Anthony, a serious private community. 7-day trial.",
  alternates: {
    canonical: "https://roadmancycling.com/community/not-done-yet",
  },
  openGraph: {
    title: "Not Done Yet — Cycling Coaching Community",
    description:
      "Group coaching at $195/month for cyclists who refuse to plateau. Personalised plan, weekly live calls with Anthony, a serious private community.",
    type: "website",
    url: "https://roadmancycling.com/community/not-done-yet",
  },
};

const tiers = [
  {
    name: "Not Done Yet Coaching",
    price: "$195",
    period: "/month",
    annual: null,
    description: "Personalised coaching across the five pillars. 7-day free trial. Cancel anytime.",
    features: [
      "Personalised TrainingPeaks plans",
      "Weekly live group coaching led by Anthony",
      "Cycling-specific strength programme",
      "Race weight & nutrition guidance",
      "Individual plan reviews by the Roadman coaching team",
      "Riders training alongside you, not beginners",
    ],
    cta: "Apply for Coaching",
    href: "/apply",
    highlight: true,
  },
  {
    name: "Inner Circle",
    price: "$525",
    period: "/month",
    annual: null,
    description:
      "High-touch 1:1 coaching with daily review and integrated performance health.",
    features: [
      "Everything in Not Done Yet Coaching",
      "Daily session review and feedback",
      "Weekly written coaching check-in",
      "Monthly 45-minute video review",
      "Quarterly blood-work analysis",
      "Performance health and biomarker tracking",
    ],
    cta: "Apply for Inner Circle",
    href: "/inner-circle/apply",
    highlight: false,
  },
];

// Pre-pricing trust block — 3 varied-angle testimonials.
const testimonials = getTestimonialsByName([
  "Chris O'Connor",
  "Ian McKnight",
  "Kazim",
]);

// Featured results — quote + stat from the central library; FTP
// progress bars are page-specific so they stay local.
const featuredResults = (
  [
    { name: "Daniel Stone", ftpBefore: null, ftpAfter: null },
    { name: "Brian Morrissey", ftpBefore: 230, ftpAfter: 265 },
    { name: "Damien Maloney", ftpBefore: 205, ftpAfter: 295 },
  ] as const
).map(({ name, ftpBefore, ftpAfter }) => {
  const t = TESTIMONIALS.find((x) => x.name === name);
  return {
    name,
    context: t?.detail ?? "",
    quote: t?.quote ?? "",
    ftpBefore,
    ftpAfter,
    statLabel: (t?.statLabel ?? "").toUpperCase(),
    statValue: t?.stat ?? "",
  };
});

// Member testimonial wall
const memberTestimonials = getTestimonialsByName([
  "Damien Maloney",
  "Chris O'Connor",
  "Brian Morrissey",
  "Aaron Kearney",
  "Ciaran O Conluain",
]);

const objections = [
  {
    question: "I already listen to the podcast — why would I pay?",
    answer:
      "The podcast gives you the knowledge. The coaching gives you the structure and accountability to actually apply it. Knowledge without action is just entertainment.",
  },
  {
    question: "I can't afford it.",
    answer:
      "$195/month is less than most 1:1 private coaching, which typically runs $300–$500/month. There's a 7-day free trial so you can test the system before paying anything, and the free Clubhouse is always there as a starting point.",
  },
  {
    question: "I don't have time.",
    answer:
      "The plans are built for busy professionals training 6-12 hours per week. The coaching runs on your schedule — no mandatory live sessions, weekly calls are recorded.",
  },
  {
    question: "How is this different from TrainerRoad or Zwift?",
    answer:
      "Those deliver workouts. Roadman delivers understanding. Plans built on conversations with Dan Lorang and Professor Seiler, not templates. Plus a community of serious cyclists, not beginners.",
  },
];

export default function NotDoneYetPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Not Done Yet Coaching — Roadman Cycling",
          description:
            "The Not Done Yet coaching: personalised training plans, expert masterclasses, and weekly coaching calls with Anthony Walsh.",
          brand: {
            "@type": "Brand",
            name: "Roadman Cycling",
          },
          // `image` and `url` are strongly recommended for the Product
          // rich result — without an image Google suppresses it.
          image: ["https://roadmancycling.com/og-image.jpg"],
          url: "https://roadmancycling.com/community/not-done-yet",
          offers: tiers.map((tier) => ({
            "@type": "Offer",
            name: tier.name,
            price: tier.price.replace("$", "").replace(",", ""),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: "https://roadmancycling.com/apply",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: tier.price.replace("$", "").replace(",", ""),
              priceCurrency: "USD",
              billingDuration: tier.period === "/year" ? "P1Y" : "P1M",
              billingIncrement: 1,
              referenceQuantity: {
                "@type": "QuantitativeValue",
                value: 1,
                unitCode: tier.period === "/year" ? "ANN" : "MON",
              },
            },
          })),
          // NOTE: no Review markup here. We collect narrative testimonials,
          // not star ratings, and Google requires a `reviewRating` on every
          // Review — a page emitting rating-less Reviews with no
          // AggregateRating is flagged "invalid" in Search Console (this
          // was one of the 8/8 invalid review snippets). Inventing a
          // numeric rating would breach the review-snippet guidelines, so
          // the Product stands on its offers alone. The coaching Service's
          // legitimate 5-star AggregateRating lives on /proof.
        }}
      />
      <FAQSchema
        faqs={objections.map((o) => ({
          question: o.question,
          answer: o.answer,
        }))}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-lg mb-4 tracking-widest">
                THE COACHING
              </p>
              <h1
                className="font-heading text-off-white text-gradient-animated"
                style={{ fontSize: "var(--text-hero)" }}
              >
                NOT DONE YET
              </h1>
              <p className="font-heading text-coral tracking-[0.25em] uppercase mt-2 mb-6 text-sm md:text-base">
                Evidence-based coaching for serious amateurs
              </p>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-6">
                TrainerRoad sells software. Zwift sells a game.
                We sell who you become.
              </p>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-6">
                Training. Nutrition. Strength. Recovery. Community.
                Five pillars, one system — informed by a 1,400+ episode podcast
                catalogue featuring coaches, scientists, and riders at the top
                of the sport. Not summarised. Not repackaged. Structured into
                your week by the host who built the archive.
              </p>
              <p className="text-foreground-subtle text-sm">
                For cyclists who refuse to plateau &middot; 7-day free trial
                &middot; cancel anytime
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* YouTube intro video */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-background-elevated shadow-2xl">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/mQJuKIjXxXg"
                  title="Not Done Yet — Roadman Cycling"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* Featured results — visual before/after */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-lg text-center mb-4 tracking-widest">
                MEMBERS ARE GETTING RESULTS LIKE:
              </p>
              <h2
                className="font-heading text-off-white text-center mb-12"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE NUMBERS DON&apos;T LIE
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {featuredResults.map((r, i) => (
                <ScrollReveal key={r.name} direction="up" delay={i * 0.12}>
                  <Card className="p-8 card-shimmer h-full" glass hoverable={false}>
                    {/* Stat highlight */}
                    <div className="text-center mb-6">
                      <p className="text-foreground-subtle text-xs tracking-widest mb-1">
                        {r.statLabel}
                      </p>
                      <p className="font-heading text-coral" style={{ fontSize: "2.5rem" }}>
                        {r.statValue}
                      </p>
                    </div>

                    {/* FTP bar chart (when applicable) */}
                    {r.ftpBefore && r.ftpAfter && (
                      <div className="mb-6 space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-foreground-subtle mb-1">
                            <span>Before</span>
                            <span>{r.ftpBefore}w</span>
                          </div>
                          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-foreground-subtle/40"
                              style={{ width: `${(r.ftpBefore / 320) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-foreground-subtle mb-1">
                            <span>After</span>
                            <span>{r.ftpAfter}w</span>
                          </div>
                          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-coral to-coral/70"
                              style={{ width: `${(r.ftpAfter / 320) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Name and context */}
                    <p className="font-heading text-off-white text-lg mb-1">{r.name}</p>
                    <p className="text-foreground-subtle text-xs tracking-wider mb-3">
                      {r.context.toUpperCase()}
                    </p>

                    {/* Quote */}
                    <p className="text-foreground-muted text-sm leading-relaxed italic">
                      &ldquo;{r.quote}&rdquo;
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* Member testimonials — social proof before pricing */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                RESULTS THAT SPEAK
              </h2>
              <p className="text-foreground-muted text-center max-w-xl mx-auto mb-12">
                Real members. Real numbers. No influencer fluff.
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {memberTestimonials.map((t, i) => (
                <ScrollReveal key={t.name} direction="up" delay={i * 0.1}>
                  <Card className="p-8 card-shimmer relative h-full" glass hoverable={false}>
                    {/* Coral quote mark decoration */}
                    <span className="absolute top-4 left-6 font-heading text-coral/20 leading-none select-none" style={{ fontSize: "5rem" }}>
                      &ldquo;
                    </span>
                    <div className="relative z-10 pt-8">
                      <p className="text-coral font-heading text-lg mb-3">
                        {t.detail.toUpperCase()}
                      </p>
                      <p className="text-foreground-muted text-sm leading-relaxed mb-4 italic">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <p className="text-xs text-foreground-subtle">&mdash; {t.name}</p>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* Tier finder CTA — opens fullscreen overlay */}
        <Section background="charcoal" className="pb-0">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="bg-white/[0.03] rounded-xl border border-white/5 px-8 py-10">
                <FitIntegration />
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Pricing */}
        <Section background="charcoal">
          <Container>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto items-start">
              {tiers.map((tier, i) => (
                <ScrollReveal key={tier.name} direction="up" delay={i * 0.1}>
                <div id={`tier-${tier.name.toLowerCase()}`} className={`relative ${tier.highlight ? "md:-mt-4 md:mb-4 ring-1 ring-coral/30 md:ring-0 rounded-2xl" : ""}`}>
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-coral text-off-white text-xs font-heading tracking-wider px-4 py-1 rounded-full whitespace-nowrap">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                <Card
                  className={`p-8 card-shimmer ${
                    tier.highlight
                      ? "border-coral/40 bg-gradient-to-b from-background-elevated to-deep-purple/20 border-rotating pt-10"
                      : ""
                  }`}
                  hoverable={false}
                >

                  <h3 className="font-heading text-2xl text-off-white mb-2">
                    {tier.name.toUpperCase()}
                  </h3>
                  <div className="mb-2">
                    <span className="font-heading text-4xl text-coral">
                      {tier.price}
                    </span>
                    <span className="text-foreground-subtle text-sm">
                      {tier.period}
                    </span>
                  </div>
                  {tier.annual && (
                    <p className="text-xs text-foreground-subtle mb-4">
                      or {tier.annual}
                    </p>
                  )}
                  <p className="text-sm text-foreground-muted mb-6">
                    {tier.description}
                  </p>

                  <ul className="space-y-2 mb-8">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="text-coral mt-0.5 shrink-0">
                          &#10003;
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    href={tier.href}
                    variant={tier.highlight ? "primary" : "ghost"}
                    size="lg"
                    className="w-full"
                  >
                    {tier.cta}
                  </Button>
                </Card>
                </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Testimonials */}
        <Section background="deep-purple" grain>
          <Container>
            <h2
              className="font-heading text-off-white text-center mb-12"
              style={{ fontSize: "var(--text-section)" }}
            >
              REAL RESULTS
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((t, i) => (
                <ScrollReveal key={t.name} direction="up" delay={i * 0.08}>
                <Card className="p-6" hoverable={false}>
                  <p className="text-coral font-heading text-lg mb-3">
                    {t.detail.toUpperCase()}
                  </p>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-4 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="text-xs text-foreground-subtle">&mdash; {t.name}</p>
                </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* FAQ / Objections */}
        <Section background="charcoal">
          <Container width="narrow">
            <h2
              className="font-heading text-off-white text-center mb-12"
              style={{ fontSize: "var(--text-section)" }}
            >
              COMMON QUESTIONS
            </h2>
            <div className="space-y-6">
              {objections.map((obj) => (
                <div
                  key={obj.question}
                  className="bg-background-elevated rounded-lg border border-white/5 p-6"
                >
                  <h3 className="font-heading text-lg text-off-white mb-2">
                    {obj.question.toUpperCase()}
                  </h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">
                    {obj.answer}
                  </p>
                </div>
              ))}
            </div>

            {/* Final CTA */}
            <ScrollReveal direction="up">
              <div className="mt-16 text-center bg-deep-purple/30 rounded-xl border border-purple/20 p-10">
                <h2 className="font-heading text-3xl text-off-white mb-4">
                  YOU&apos;RE NOT DONE YET.
                </h2>
                <p className="text-foreground-muted mb-8 max-w-md mx-auto">
                  Cyclists across Ireland, the UK and the US have chosen
                  to stop guessing and start progressing. They&apos;re not
                  more talented than you — they just have a system. Same
                  knowledge. Same coaching. Your turn.
                </p>
                <Button
                  href="/apply"
                  size="lg"
                >
                  Apply for Not Done Yet
                </Button>
                <p className="text-foreground-subtle text-xs mt-4">
                  7-day free trial. Cancel anytime. No contracts.
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
