import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";

export const metadata: Metadata = {
  title: "Not Done Yet — Premium Cycling Coaching",
  description:
    "Personalised TrainingPeaks training plans, weekly coaching with Anthony Walsh, expert masterclasses, and a private community of serious cyclists. From $15/month.",
  alternates: {
    canonical: "https://roadmancycling.com/community/not-done-yet",
  },
  openGraph: {
    title: "Not Done Yet — Premium Cycling Coaching",
    description:
      "Personalised TrainingPeaks training plans, weekly coaching with Anthony Walsh, expert masterclasses, and a private community of serious cyclists. From $15/month.",
    type: "website",
    url: "https://roadmancycling.com/community/not-done-yet",
  },
};

const tiers = [
  {
    name: "Standard",
    price: "$15",
    period: "/month",
    annual: "$150/year",
    description: "The five-pillar coaching system. Stop guessing, get structured.",
    features: [
      "Weekly training plans (adaptable to your hours)",
      "Weekly group coaching calls with Anthony",
      "Cycling-specific strength programme",
      "Race weight & nutrition guidance",
      "Community of serious cyclists",
    ],
    cta: "Join Standard",
    href: "https://www.skool.com/roadmancycling/about",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$195",
    period: "/month",
    annual: null,
    description: "For cyclists who want personalised coaching at a fraction of 1:1 cost.",
    features: [
      "Everything in Standard",
      "Personalised TrainingPeaks plans",
      "Priority Q&A with Anthony",
      "Advanced masterclass library",
      "1:1 plan reviews",
      "Nutrition guidance",
    ],
    cta: "Join Premium",
    href: "https://www.skool.com/roadmancycling/about",
    highlight: true,
  },
  {
    name: "VIP",
    price: "$1,950",
    period: "/year",
    annual: null,
    description: "For cyclists who want the full system with direct access to Anthony.",
    features: [
      "Everything in Premium",
      "Direct access to Anthony",
      "Quarterly strategy calls",
      "Priority event support",
      "Exclusive VIP content",
      "Early access to new features",
    ],
    cta: "Apply for VIP",
    href: "https://www.skool.com/roadmancycling/about",
    highlight: false,
  },
];

const testimonials = [
  {
    name: "Chris O'Connor",
    result: "20% body fat down to 7%, 84kg to 68kg",
    quote:
      "Anthony is a visionary, an educator, a mentor, a coach. He set me on a dietary, mental and physical journey of true discovery.",
  },
  {
    name: "Ian McKnight",
    result: "Commuter to racer in one season",
    quote:
      "I had a disappointing season dabbling in racing, mostly getting dropped. My coach gave me a structured pre-season programme and everything changed.",
  },
  {
    name: "Kazim",
    result: "Novice to 800km, 18,500m climbing in 7 days",
    quote:
      "From being a complete novice to completing a 7-day race covering more than 800km. They pushed me to the limits and I had full confidence and trust in them.",
  },
];

const memberTestimonials = [
  {
    name: "Damien Maloney",
    highlight: "FTP from low 200s to 295",
    quote:
      "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I\u2019ve gotten much more out of Roadman than I ever imagined. The coaches are very generous with their time and knowledge.",
  },
  {
    name: "Chris O\u2019Connor",
    highlight: "20% body fat down to 7%, 84kg to 68kg",
    quote:
      "Anthony set me on a dietary, mental and physical journey. Average wattage doubled and now weekly 100km+ rides are the norm.",
  },
  {
    name: "Brian Morrissey",
    highlight: "FTP up 15%, hit 4 w/kg at age 46",
    quote:
      "This really works. I\u2019m training so much less than last year, at lower intensities and not getting sick. FTHR up from 175 to 180, peak HR up to 193.",
  },
  {
    name: "Aaron Kearney",
    highlight: "Made the leap to Ultra Cycling",
    quote:
      "The expertise and personalised plan allowed me to utilise my past racing experience and gave me the adaptations needed for the changeover. If you\u2019re looking to unlock new potential, I couldn\u2019t recommend Anthony enough.",
  },
  {
    name: "Ciaran O Conluain",
    highlight: "Cycling all over the world",
    quote:
      "Anthony has been the most influential person in my cycling experience. He always knew how to push when needed and encourage when times were tough. None of it would have been possible without Anthony and his team.",
  },
];

const objections = [
  {
    question: "I already listen to the podcast — why would I pay?",
    answer:
      "The podcast gives you the knowledge. The community gives you the structure and accountability to actually apply it. Knowledge without action is just entertainment.",
  },
  {
    question: "I can't afford it.",
    answer:
      "$15/month is less than one cafe stop a week. The Premium tier is personalised coaching at a fraction of what 1:1 coaching costs ($200-500/month).",
  },
  {
    question: "I don't have time.",
    answer:
      "The plans are built for busy professionals training 6-12 hours per week. The community works asynchronously — no mandatory live sessions.",
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
          name: "Not Done Yet — Roadman Cycling Community",
          description:
            "Premium cycling coaching community with personalised training plans, expert masterclasses, and weekly coaching calls.",
          brand: {
            "@type": "Brand",
            name: "Roadman Cycling",
          },
          offers: tiers.map((tier) => ({
            "@type": "Offer",
            name: tier.name,
            price: tier.price.replace("$", "").replace(",", ""),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          })),
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
                THE COACHING SYSTEM
              </p>
              <h1
                className="font-heading text-off-white mb-6 text-gradient-animated"
                style={{ fontSize: "var(--text-hero)" }}
              >
                NOT DONE YET
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-6">
                TrainerRoad sells software. Zwift sells a game.
                We sell who you become.
              </p>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-6">
                Training. Nutrition. Strength. Recovery. Accountability.
                Five pillars, one system — built from 1,400+ conversations
                with the coaches, scientists, and riders at the top of the
                sport. Not summarised. Not repackaged. Structured into your
                week by the coach who had every single one of them on his show.
              </p>
              <p className="text-foreground-subtle text-sm">
                100+ cyclists who refuse to plateau &middot; 7-day free trial &middot; 30-day money-back guarantee
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
                        {t.highlight.toUpperCase()}
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

        {/* Pricing */}
        <Section background="charcoal">
          <Container>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
              {tiers.map((tier, i) => (
                <ScrollReveal key={tier.name} direction="up" delay={i * 0.1}>
                <div className={`relative ${tier.highlight ? "md:-mt-4 md:mb-4 ring-1 ring-coral/30 md:ring-0 rounded-2xl" : ""}`}>
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
                    external
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
                    {t.result.toUpperCase()}
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
                  100+ cyclists chose to stop guessing and start progressing.
                  They&apos;re not more talented than you — they just have
                  a system. Same knowledge. Same coaching. Your turn.
                </p>
                <Button
                  href="https://www.skool.com/roadmancycling/about"
                  external
                  size="lg"
                >
                  Join Not Done Yet
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
