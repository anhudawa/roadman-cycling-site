import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";

export const metadata: Metadata = {
  title: "Not Done Yet — Premium Cycling Coaching Community",
  description:
    "Personalised Vekta training plans, weekly coaching with Anthony Walsh, expert masterclasses, and a private community of serious cyclists. From $15/month.",
};

const tiers = [
  {
    name: "Standard",
    price: "$15",
    period: "/month",
    annual: "$75/year",
    description: "For cyclists who want structure and community.",
    features: [
      "Vekta training plans",
      "Weekly group coaching calls",
      "Community access",
      "Monthly masterclasses",
      "S&C roadmap",
    ],
    cta: "Join Standard",
    href: "https://skool.com/roadmancycling",
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
      "Personalised Vekta plans",
      "Priority Q&A with Anthony",
      "Advanced masterclass library",
      "1:1 plan reviews",
      "Nutrition guidance",
    ],
    cta: "Join Premium",
    href: "https://skool.com/roadmancycling",
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
    href: "https://skool.com/roadmancycling",
    highlight: false,
  },
];

const testimonials = [
  {
    name: "Tom S.",
    result: "Cat 3 to Cat 1 in 18 months",
    quote:
      "The structured approach changed everything. I stopped guessing and started progressing.",
  },
  {
    name: "Mark D.",
    result: "Completed the Etape — top 20%",
    quote:
      "I didn't just survive the Etape, I performed. The training plan was spot on.",
  },
  {
    name: "James R.",
    result: "Lost 12kg, FTP up 40W",
    quote:
      "Coming back to cycling at 48, I didn't think these numbers were possible. The community kept me accountable.",
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

      <main>
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container className="text-center">
            <h1
              className="font-heading text-off-white mb-6"
              style={{ fontSize: "var(--text-hero)" }}
            >
              NOT DONE YET
            </h1>
            <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-4">
              You get the same insights Anthony gets from sitting across the
              table from Dan Lorang, Professor Seiler, and Lachlan Morton —
              distilled into a system you can actually use.
            </p>
            <p className="text-coral font-heading text-lg">
              113 SERIOUS CYCLISTS. THREE TIERS. ONE MISSION.
            </p>
          </Container>
        </Section>

        {/* Pricing */}
        <Section background="charcoal">
          <Container>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {tiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`p-8 ${
                    tier.highlight
                      ? "border-coral/40 bg-gradient-to-b from-background-elevated to-deep-purple/20 relative"
                      : ""
                  }`}
                  hoverable={false}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-coral text-off-white text-xs font-heading tracking-wider px-4 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

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
              {testimonials.map((t) => (
                <Card key={t.name} className="p-6" hoverable={false}>
                  <p className="text-coral font-heading text-lg mb-3">
                    {t.result.toUpperCase()}
                  </p>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-4 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="text-xs text-foreground-subtle">&mdash; {t.name}</p>
                </Card>
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
            <div className="mt-16 text-center">
              <h2 className="font-heading text-3xl text-off-white mb-4">
                READY TO STOP GUESSING?
              </h2>
              <p className="text-foreground-muted mb-8 max-w-md mx-auto">
                Join 113 serious cyclists who are actively getting faster with
                the right system.
              </p>
              <Button
                href="https://skool.com/roadmancycling"
                external
                size="lg"
              >
                Join Not Done Yet
              </Button>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
